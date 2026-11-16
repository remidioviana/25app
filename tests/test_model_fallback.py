"""Fault-injection transport tests; no real quota or provider calls."""
import io
import json
import os
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
import model_provider as provider

class ModelFallbackTests(unittest.TestCase):
 def setUp(self):
  env=patch.dict(os.environ,{'OPENAI_API_KEY':'fictional-test-key','OPENAI_BASE_URL':'https://api.groq.com/openai/v1',
      'AGENT_ALLOW_PREVIEW_MODELS':'0','AGENT_REQUIRE_DISTINCT_MODELS':'0'})
  env.start();self.addCleanup(env.stop)
  self.primary=provider.FAST_MODEL;self.failures={self.primary:429};self.calls=[]
  self.active=list(provider.FALLBACK_MODELS);self.catalogue_failure=None
 def transport(self,request,timeout):
  if request.get_method()=='GET':
   self.calls.append(('catalogue',None,None))
   if self.catalogue_failure:raise HTTPError(request.full_url,self.catalogue_failure,'controlled',{},io.BytesIO(b'private catalogue body'))
   return io.BytesIO(json.dumps({'data':[{'id':model,'active':True} for model in self.active]}).encode())
  payload=json.loads(request.data);model=payload['model'];self.calls.append(('inference',model,payload))
  if model in self.failures:raise HTTPError(request.full_url,self.failures[model],'controlled',{},io.BytesIO(b'private provider body'))
  return io.BytesIO(json.dumps({'model':model,'choices':[{'finish_reason':'stop','message':{'content':'controlled response'}}],'usage':{'total_tokens':7}}).encode())
 def respond(self,**kwargs):
  with patch.object(provider,'urlopen',side_effect=self.transport):
   return provider.respond([],[],model_override=self.primary,**kwargs)
 def model_calls(self):return [model for kind,model,_ in self.calls if kind=='inference']
 def test_all_roles_can_recover_from_quota_or_unavailability(self):
  defaults=provider.ROLE_MODELS.copy()
  for role in ('planner','specialist','critic'):
   for status in (429,500,502,503,504):
    self.calls=[];self.failures={self.primary:status}
    with self.subTest(role=role,status=status):
     response=self.respond(role=role)
     self.assertEqual(self.model_calls(),[self.primary,provider.AUDIT_MODEL])
     self.assertEqual(response['usage']['requested_model'],self.primary)
     self.assertEqual(response['usage']['provider_reported_model'],provider.AUDIT_MODEL)
     self.assertTrue(response['usage']['fallback']);self.assertNotIn('private',json.dumps(response))
  self.assertEqual(provider.ROLE_MODELS,defaults)
 def test_reserves_are_bounded_unique_and_checked_against_live_catalogue(self):
  self.failures={self.primary:429,provider.AUDIT_MODEL:503}
  with patch.dict(os.environ,{'AGENT_ALLOW_PREVIEW_MODELS':'1'}):response=self.respond()
  self.assertEqual(self.model_calls(),list(provider.FALLBACK_MODELS))
  self.assertEqual(len(self.model_calls()),len(set(self.model_calls())))
  self.assertLessEqual(len(self.model_calls()),6)
  self.assertEqual(sum(kind=='catalogue' for kind,_,_ in self.calls),1)
  self.assertEqual(response['usage']['model'],'qwen/qwen3.8-27b')
  self.assertEqual([x['statuses'] for x in response['usage']['fallback_history']],[[429],[503]])
 def test_unavailable_preview_and_non_text_ids_are_never_selected(self):
  self.active=[self.primary,'whisper-large-v3','openai/gpt-oss-safeguard-20b','qwen/qwen3.8-27b']
  with self.assertRaises(provider.ProviderFailure):self.respond()
  self.assertEqual(self.model_calls(),[self.primary])
 def test_primary_auth_schema_and_client_errors_do_not_trigger_model_switch(self):
  for status in (400,401,403,404,422):
   self.calls=[];self.failures={self.primary:status}
   with self.subTest(status=status),self.assertRaises(provider.ProviderFailure):self.respond()
   self.assertEqual(self.model_calls(),[self.primary]);self.assertFalse(any(kind=='catalogue' for kind,_,_ in self.calls))
 def test_explicit_disable_and_strict_proof_mode_never_substitute_identity(self):
  with self.assertRaises(provider.ProviderFailure):self.respond(allow_fallback=False)
  self.assertEqual(len(self.calls),1);self.calls=[]
  with patch.dict(os.environ,{'AGENT_REQUIRE_DISTINCT_MODELS':'1'}):
   with self.assertRaises(provider.ProviderFailure):self.respond()
  self.assertEqual(len(self.calls),1)
 def test_catalogue_failure_does_not_send_data_to_an_unverified_reserve(self):
  self.catalogue_failure=503
  with self.assertRaises(provider.ProviderFailure) as caught:self.respond()
  self.assertEqual(caught.exception.statuses,[429]);self.assertEqual(self.model_calls(),[self.primary])
  self.assertNotIn('private',str(caught.exception))
 def test_strict_json_payload_is_preserved_on_reserve(self):
  schema={'type':'object','properties':{},'required':[],'additionalProperties':False}
  response=self.respond(response_schema=schema)
  payloads=[p for kind,_,p in self.calls if kind=='inference']
  self.assertEqual(payloads[0]['response_format'],payloads[1]['response_format'])
  self.assertTrue(payloads[1]['response_format']['json_schema']['strict'])
  self.assertEqual(response['usage']['response_contract'],'json_schema_strict')
 def test_healthy_requests_skip_catalogue_and_reserves(self):
  self.failures={};response=self.respond()
  self.assertEqual(len(self.calls),1);self.assertFalse(response['usage']['fallback'])
  self.assertEqual(response['usage']['fallback_history'],[])
 def test_groq_reserves_are_not_sent_to_another_provider(self):
  with patch.dict(os.environ,{'OPENAI_BASE_URL':'https://other-provider.invalid/v1'}):
   with self.assertRaises(provider.ProviderFailure):self.respond()
  self.assertEqual(len(self.calls),1)
 def test_denied_reserve_is_skipped_without_claiming_it_succeeded(self):
  self.failures={self.primary:429,provider.AUDIT_MODEL:403}
  with patch.dict(os.environ,{'AGENT_ALLOW_PREVIEW_MODELS':'1'}):response=self.respond()
  self.assertEqual(response['usage']['model'],'qwen/qwen3.8-27b')
  self.assertEqual(response['usage']['fallback_history'][1]['statuses'],[403])

 def test_exhausted_pool_reports_bounded_attempts_without_raw_errors(self):
  self.failures={model:503 for model in provider.FALLBACK_MODELS}
  with patch.dict(os.environ,{'AGENT_ALLOW_PREVIEW_MODELS':'1'}):
   with self.assertRaises(provider.ProviderFailure) as caught:self.respond()
  self.assertEqual([item['model'] for item in caught.exception.attempts],list(provider.FALLBACK_MODELS))
  self.assertNotIn('private',str(caught.exception));self.assertEqual(len(self.model_calls()),3)
