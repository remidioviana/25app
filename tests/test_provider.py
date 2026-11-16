"""Transport tests use fictional keys and mocked HTTP; no provider calls."""
import io,json,os,unittest
from unittest.mock import patch
from urllib.error import HTTPError,URLError
import model_provider as p

class ProviderTests(unittest.TestCase):
 def setUp(self):
  self.env=patch.dict(os.environ,{'OPENAI_API_KEY':'test-a,test-b,test-c','OPENAI_BASE_URL':'https://api.groq.com/openai/v1','OPENAI_MODEL':p.FAST_MODEL});self.env.start();self.addCleanup(self.env.stop)
  p._KEY_CONFIG=();p._KEY_INDEX=0
  catalogue=patch.object(p,'list_models',return_value=list(p.FALLBACK_MODELS));catalogue.start();self.addCleanup(catalogue.stop)
 def ok(self):return io.BytesIO(json.dumps({'choices':[{'message':{'content':'checked'}}],'usage':{'total_tokens':9}}).encode())
 def error(self,status):return HTTPError('https://api.groq.com',status,'mock',{},io.BytesIO(b'secret response must not leak'))
 def call(self,model=p.AUDIT_MODEL):return p.respond([{'role':'user','content':'Test'}],[],model_override=model)
 def test_roles(self):self.assertEqual(p.ROLE_MODELS,{'planner':p.FAST_MODEL,'specialist':p.FAST_MODEL,'critic':p.AUDIT_MODEL})
 def test_rotation(self):
  with patch.object(p,'urlopen',side_effect=[self.ok(),self.ok(),self.ok(),self.ok()]) as send:
   for _ in range(4):self.call()
  self.assertEqual([c.args[0].get_header('Authorization') for c in send.call_args_list],['Bearer test-a','Bearer test-b','Bearer test-c','Bearer test-a'])
 def test_all_429_falls_back_after_three(self):
  with patch.object(p,'urlopen',side_effect=[self.error(429) for _ in range(3)]+[self.ok()]) as send:r=self.call()
  self.assertEqual([json.loads(c.args[0].data)['model'] for c in send.call_args_list],[p.AUDIT_MODEL]*3+[p.FAST_MODEL]);self.assertTrue(r['usage']['fallback'])
 def test_partial_429_success_does_not_fallback(self):
  with patch.object(p,'urlopen',side_effect=[self.error(429),self.ok()]) as send:r=self.call()
  self.assertEqual(send.call_count,2);self.assertFalse(r['usage']['fallback']);self.assertEqual(r['usage']['model'],p.AUDIT_MODEL)
 def test_auth_failure_mixed_with_quota_never_changes_model(self):
  for status in (401,403):
   with self.subTest(status=status),patch.object(p,'urlopen',side_effect=[self.error(429),self.error(status),self.error(429)]) as send:
    with self.assertRaises(p.ProviderFailure) as caught:self.call()
    self.assertEqual(send.call_count,3);self.assertNotIn('secret',str(caught.exception));self.assertNotIn('test-',str(caught.exception))
 def test_fast_model_falls_back_without_changing_role_defaults(self):
  with patch.object(p,'urlopen',side_effect=[self.error(429) for _ in range(3)]+[self.ok()]) as send:r=self.call(p.FAST_MODEL)
  self.assertEqual(send.call_count,4);self.assertTrue(r['usage']['fallback'])
  self.assertEqual(json.loads(send.call_args.args[0].data)['model'],p.AUDIT_MODEL)
  self.assertEqual(p.ROLE_MODELS,{'planner':p.FAST_MODEL,'specialist':p.FAST_MODEL,'critic':p.AUDIT_MODEL})
 def test_nonretryable_error_stops(self):
  with patch.object(p,'urlopen',side_effect=self.error(400)) as send:
   with self.assertRaises(p.ProviderFailure):self.call()
   self.assertEqual(send.call_count,1)
 def test_network_error_uses_next_key(self):
  with patch.object(p,'urlopen',side_effect=[URLError('offline'),self.ok()]):self.assertFalse(self.call()['usage']['fallback'])
 def test_duplicate_and_empty_keys(self):
  with patch.dict(os.environ,{'OPENAI_API_KEY':' test-a, ,test-a,test-b '}):self.assertEqual(p._get_keys(),['test-a','test-b'])
 def test_endpoint_and_override(self):
  with patch.dict(os.environ,{'OPENAI_BASE_URL':'https://groq.com'}),patch.object(p,'urlopen',return_value=self.ok()) as send:self.call(p.FAST_MODEL)
  request=send.call_args.args[0];self.assertEqual(request.full_url,'https://api.groq.com/openai/v1/chat/completions');self.assertEqual(json.loads(request.data)['model'],p.FAST_MODEL)
 def test_parallel_tool_messages(self):
  messages=p._to_chat_messages([{'type':'function_call','call_id':str(i),'name':'analyze','arguments':'{}'} for i in range(2)]+[{'type':'function_call_output','call_id':str(i),'output':'done'} for i in range(2)])
  self.assertEqual(len(messages),3);self.assertEqual(len(messages[0]['tool_calls']),2);self.assertEqual([m['role'] for m in messages],['assistant','tool','tool'])
 def test_malformed_response(self):
  for response in ({}, {'choices':[None]}, {'choices':[{'message':{ 'tool_calls':[{}]}}]}):
   with self.subTest(response=response),patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps(response).encode())):
    with self.assertRaises(ValueError):self.call()
 def test_invalid_envelopes_are_sanitized(self):
  for raw in (None,[],True,{'choices':[{'message':{'content':['private']}}]}, {'choices':[{'message':{'content':'ok'}}],'usage':['private']}):
   with self.subTest(raw=raw),patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps(raw).encode())):
    with self.assertRaises(ValueError) as caught:self.call()
    self.assertNotIn('private',str(caught.exception))
 def test_empty_refused_or_truncated_response_is_not_success(self):
  cases=[{'message':{'content':''}}, {'message':{'content':'partial'},'finish_reason':'length'}, {'message':{'content':None,'refusal':'private policy detail'}}, {'message':{'content':'partial'},'finish_reason':'content_filter'}]
  for choice in cases:
   with self.subTest(choice=choice),patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps({'choices':[choice]}).encode())) as send:
    with self.assertRaises(ValueError) as caught:self.call()
    self.assertEqual(send.call_count,1);self.assertNotIn('private',str(caught.exception))
 def test_tool_calls_are_validated_before_return(self):
  valid={'id':'call-1','type':'function','function':{'name':'analyze','arguments':'{}'}}
  cases=['bad',[None],[dict(valid,function=None)],[dict(valid,id=7)],[valid,valid],[dict(valid,function={'name':'analyze','arguments':'[1]'})],[dict(valid,function={'name':'analyze','arguments':'{"broken"'})]]
  for calls in cases:
   with self.subTest(calls=calls),patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps({'choices':[{'message':{'tool_calls':calls}}]}).encode())):
    with self.assertRaises(ValueError):self.call()
 def test_valid_tool_only_response(self):
  raw={'choices':[{'finish_reason':'tool_calls','message':{'content':None,'tool_calls':[{'id':'one','type':'function','function':{'name':'analyze','arguments':'{}'}}]}}]}
  with patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps(raw).encode())):result=self.call()
  self.assertEqual(result['output'][0]['call_id'],'one');self.assertEqual(result['output_text'],'')
 def test_invalid_token_counts_rejected(self):
  for count in (-1,True,'10',float('inf')):
   with self.subTest(count=count),patch.object(p,'urlopen',return_value=io.BytesIO(json.dumps({'choices':[{'message':{'content':'ok'}}],'usage':{'total_tokens':count}}).encode())):
    with self.assertRaises(ValueError):self.call()
 def test_interrupted_response_rotates_without_model_downgrade(self):
  from http.client import IncompleteRead
  for error in (ConnectionResetError('private transport'),IncompleteRead(b'private')):
   with self.subTest(error=type(error).__name__),patch.object(p,'urlopen',side_effect=[error,self.ok()]) as send:
    self.assertFalse(self.call()['usage']['fallback']);self.assertEqual(send.call_count,2)
 def test_connection_and_quota_failure_can_use_an_active_reserve(self):
  with patch.object(p,'urlopen',side_effect=[self.error(429),ConnectionResetError('private'),self.error(429),self.ok()]) as send:
   response=self.call()
  self.assertEqual(send.call_count,4);self.assertTrue(response['usage']['fallback'])
  self.assertEqual(response['usage']['fallback_reason'],'provider_unavailable')
  self.assertNotIn('private',json.dumps(response))

 def test_provider_error_classification_never_copies_message_or_failed_generation(self):
  raw={'error':{'code':'tool_use_failed','message':'controlled-private-message','failed_generation':'controlled-private-generation'}}
  error=HTTPError('https://api.groq.com',400,'mock',{'Retry-After':'12'},io.BytesIO(json.dumps(raw).encode()))
  with patch.object(p,'urlopen',side_effect=error):
   with self.assertRaises(p.ProviderFailure) as caught:self.call()
  self.assertEqual(caught.exception.codes,['tool_use_failed']);self.assertEqual(caught.exception.retry_after,12)
  self.assertNotIn('controlled-private',str(caught.exception))
 def test_unknown_provider_error_code_is_not_echoed(self):
  error=HTTPError('https://api.groq.com',400,'mock',{},io.BytesIO(json.dumps({'error':{'code':'controlled-private-code'}}).encode()))
  with patch.object(p,'urlopen',side_effect=error):
   with self.assertRaises(p.ProviderFailure) as caught:self.call()
  self.assertEqual(caught.exception.codes,[]);self.assertNotIn('controlled-private',str(caught.exception))

 def test_named_required_tool_is_bound_to_registered_function(self):
  tools=[{'type':'function','name':'deliver_role_result','parameters':{'type':'object','properties':{},'required':[],'additionalProperties':False}}]
  with patch.object(p,'urlopen',return_value=self.ok()) as send:
   p.respond([],tools,required_tool='deliver_role_result')
  self.assertEqual(json.loads(send.call_args.args[0].data)['tool_choice'],{'type':'function','function':{'name':'deliver_role_result'}})
  for required in ('unregistered','controlled private value'):
   with self.subTest(required=required),patch.object(p,'urlopen') as network:
    with self.assertRaisesRegex(ValueError,'registered function'):p.respond([],tools,required_tool=required)
    network.assert_not_called()

 def test_strict_schema_output_cannot_be_combined_with_tools(self):
  schema={'type':'object','properties':{'verdict':{'type':'string','enum':['accept']}},'required':['verdict'],'additionalProperties':False}
  with patch.object(p,'urlopen',return_value=self.ok()) as send:p.respond([],[],response_schema=schema)
  payload=json.loads(send.call_args.args[0].data)
  self.assertTrue(payload['response_format']['json_schema']['strict']);self.assertEqual(payload['response_format']['json_schema']['schema'],schema)
  self.assertNotIn('tools',payload);self.assertNotIn('tool_choice',payload)
  with patch.object(p,'urlopen') as network:
   with self.assertRaisesRegex(ValueError,'no tool calls'):
    p.respond([],[{'name':'test','parameters':{}}],response_schema=schema)
   network.assert_not_called()

 def test_json_generation_error_and_safe_type_are_classified_without_raw_values(self):
  for code in ('json_validate_failed','controlled-private-code'):
   error=HTTPError('https://api.groq.com',400,'mock',{},io.BytesIO(json.dumps({'error':{'code':code,'type':'invalid_request_error','message':'controlled-private-message','failed_generation':'controlled-private-generation'}}).encode()))
   with self.subTest(code=code),patch.object(p,'urlopen',side_effect=error):
    with self.assertRaises(p.ProviderFailure) as caught:self.call()
   self.assertIn('invalid_request_error',caught.exception.codes)
   if code=='json_validate_failed':self.assertIn(code,caught.exception.codes)
   self.assertNotIn('controlled-private',str(caught.exception))

 def test_large_failed_generation_does_not_hide_safe_error_classification(self):
  raw={'error':{'code':'json_validate_failed','failed_generation':'controlled-private-generation '*1000}}
  self.assertGreater(len(json.dumps(raw)),8192)
  error=HTTPError('https://api.groq.com',400,'mock',{},io.BytesIO(json.dumps(raw).encode()))
  with patch.object(p,'urlopen',side_effect=error):
   with self.assertRaises(p.ProviderFailure) as caught:self.call()
  self.assertEqual(caught.exception.codes,['json_validate_failed'])
  self.assertNotIn('controlled-private',str(caught.exception))
