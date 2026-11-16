"""Controlled credentials/HTTP fixtures only; no real provider/key or live model proof."""
import io
import json
import os
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
import model_provider as provider
from scripts.verify_groq import verify


class GroqReadinessTests(unittest.TestCase):
    def setUp(self):
        self.models={'planner':'planner-model','specialist':'specialist-model','critic':'auditor-model'}
        self.env=patch.dict(os.environ,{'OPENAI_API_KEY':'fictional-test-key','OPENAI_BASE_URL':'https://api.groq.com/openai/v1',
          'AGENT_PLANNER_MODEL':self.models['planner'],'AGENT_SPECIALIST_MODEL':self.models['specialist'],'AGENT_AUDITOR_MODEL':self.models['critic'],
          'AGENT_REQUIRE_DISTINCT_MODELS':'0','AGENT_ALLOW_PREVIEW_MODELS':'0'})
        self.env.start();self.addCleanup(self.env.stop);self.requests=[];self.aliases=dict(zip(self.models.values(),self.models.values()))
    def transport(self,request,timeout):
        self.requests.append(request)
        if request.get_method()=='GET':return io.BytesIO(json.dumps({'data':[{'id':m,'active':True} for m in self.models.values()]}).encode())
        payload=json.loads(request.data);messages=payload['messages'];model=payload['model']
        if messages[-1]['role']=='tool':
            message={'content':json.dumps({'acknowledgement':json.loads(messages[-1]['content'])['acknowledgement']})};finish='stop'
        else:
            context=json.loads(messages[1]['content']);message={'content':None,'tool_calls':[{'id':'controlled-call','type':'function','function':{'name':'connection_probe','arguments':json.dumps(context)}}]};finish='tool_calls'
        raw={'model':self.aliases.get(model,model),'choices':[{'message':message,'finish_reason':finish}],'usage':{'total_tokens':7}}
        return io.BytesIO(json.dumps(raw).encode())

    def test_role_configuration_is_dynamic_distinct_and_not_live_verification(self):
        self.assertEqual(provider.role_models(require_distinct=True),self.models)
        status=provider.configuration_status();self.assertEqual(status['distinct_models'],3);self.assertFalse(status['inference_verified'])
        with patch.dict(os.environ,{'AGENT_SPECIALIST_MODEL':'planner-model'}):
            with self.assertRaisesRegex(ValueError,'distinct'):provider.role_models(require_distinct=True)

    def test_preview_and_credential_shaped_model_values_fail_closed_without_leaking(self):
        for model in ('qwen/qwen3.8-27b','meta-models/muse-spark-open'):
            with self.subTest(model=model),patch.dict(os.environ,{'AGENT_AUDITOR_MODEL':model}):
                self.assertFalse(provider.configuration_status()['configuration_valid'])
                with patch.dict(os.environ,{'AGENT_ALLOW_PREVIEW_MODELS':'1'}):self.assertTrue(provider.configuration_status()['configuration_valid'])
        with patch.dict(os.environ,{'AGENT_PLANNER_MODEL':'gsk_TEST'}):
            status=provider.configuration_status();self.assertFalse(status['configuration_valid']);self.assertNotIn('gsk_TEST',json.dumps(status))

    def test_invalid_url_parser_values_are_sanitized(self):
        for value in ['https://api.groq.com:controlled-private-value/openai/v1','https://[invalid/private-value','https://api.groq.com/openai/v1\nprivate-value']:
            with self.subTest(value=value),patch.dict(os.environ,{'OPENAI_BASE_URL':value}):
                status=provider.configuration_status();self.assertFalse(status['configuration_valid']);self.assertNotIn('private-value',json.dumps(status))

    def test_offline_and_missing_key_paths_never_contact_a_provider(self):
        with patch.object(provider,'urlopen') as network:
            report,code=verify();self.assertEqual(code,0);self.assertFalse(report['catalogue_verified']);self.assertFalse(report['model_inference_verified'])
            with patch.dict(os.environ,{'OPENAI_API_KEY':''}):
                report,code=verify(live=True,probe_models=True);self.assertEqual(code,2);self.assertFalse(report['configuration']['configured'])
            network.assert_not_called()

    def test_catalogue_success_is_not_model_or_application_verification(self):
        with patch.object(provider,'urlopen',side_effect=self.transport):report,code=verify(live=True)
        self.assertEqual(code,0);self.assertTrue(report['catalogue_verified']);self.assertFalse(report['model_inference_verified'])
        self.assertFalse(report['primary_application_workflow_verified']);self.assertEqual(len(self.requests),1)
        self.assertEqual(self.requests[0].get_method(),'GET');self.assertIsNone(self.requests[0].data)
        self.assertNotIn('fictional-test-key',json.dumps(report))

    def test_three_model_tool_roundtrips_record_returned_ids_without_fallback(self):
        with patch.object(provider,'urlopen',side_effect=self.transport):report,code=verify(live=True,probe_models=True)
        self.assertEqual(code,0,report);self.assertTrue(report['three_distinct_models_verified']);self.assertTrue(report['model_inference_verified'])
        self.assertEqual(len(self.requests),7);self.assertEqual(report['reported_total_tokens'],42)
        self.assertTrue(all(r['logical_completion_requests']==2 and r['tool_roundtrip_verified'] for r in report['role_checks']))

    def test_aliasing_to_one_returned_model_cannot_prove_three_distinct_models(self):
        self.aliases={m:'one-returned-model' for m in self.models.values()}
        with patch.object(provider,'urlopen',side_effect=self.transport):report,code=verify(live=True,probe_models=True)
        self.assertEqual(code,2);self.assertTrue(report['model_inference_verified']);self.assertFalse(report['three_distinct_models_verified'])
        self.assertTrue(all(r['tool_roundtrip_verified'] for r in report['role_checks']))

    def test_missing_catalogue_model_prevents_billable_probes(self):
        with patch.object(provider,'list_models',return_value=['planner-model']),patch.object(provider,'respond') as inference:
            report,code=verify(live=True,probe_models=True)
        self.assertEqual(code,2);self.assertIn('absent',report['error']);inference.assert_not_called()

    def test_explicit_no_fallback_preserves_requested_specialist_identity(self):
        error=HTTPError('https://api.groq.com/openai/v1/chat/completions',429,'controlled',{},io.BytesIO(b'private fixture body'))
        with patch.object(provider,'urlopen',side_effect=error) as network:
            with self.assertRaises(provider.ProviderFailure):provider.respond([],[],model_override=provider.AUDIT_MODEL,role='specialist',allow_fallback=False)
        self.assertEqual(network.call_count,1)

    def test_strict_distinct_mode_disables_even_auditor_model_downgrade(self):
        with patch.dict(os.environ,{'AGENT_REQUIRE_DISTINCT_MODELS':'1'}),patch.object(provider,'urlopen',side_effect=HTTPError('https://api.groq.com',429,'controlled',{},io.BytesIO(b''))) as network:
            with self.assertRaises(provider.ProviderFailure):provider.respond([],[],model_override=provider.AUDIT_MODEL,role='critic')
        self.assertEqual(network.call_count,1)

    def test_request_identity_is_not_provider_reported_identity(self):
        raw={'choices':[{'message':{'content':'controlled'}}],'usage':{}}
        with patch.object(provider,'urlopen',return_value=io.BytesIO(json.dumps(raw).encode())):
            response=provider.respond([],[],model_override='planner-model')
        self.assertIsNone(response['usage']['provider_reported_model']);self.assertEqual(response['usage']['model_identity_evidence'],'request_only')
        self.assertIsNone(provider._NoProviderRedirect().redirect_request(None,None,302,'',{},'https://elsewhere.invalid/'))

    def test_unrelated_base_never_receives_groq_verifier_credentials(self):
        with patch.dict(os.environ,{'OPENAI_BASE_URL':'https://elsewhere.invalid/openai/v1'}),patch.object(provider,'urlopen') as network:
            report,code=verify(live=True)
        self.assertEqual(code,2);network.assert_not_called();self.assertNotIn('fictional-test-key',json.dumps(report))

    def test_acknowledgement_must_come_from_actual_tool_result_not_request_nonce(self):
        def guessing_transport(request,timeout):
            if request.get_method()=='POST':
                payload=json.loads(request.data)
                if payload['messages'][-1]['role']=='tool':
                    context=json.loads(payload['messages'][1]['content'])
                    guessed='probe-ok:'+context['nonce']+':'+context['role']
                    return io.BytesIO(json.dumps({'model':payload['model'],'choices':[{'finish_reason':'stop','message':{'content':json.dumps({'acknowledgement':guessed})}}],'usage':{}}).encode())
            return self.transport(request,timeout)
        with patch.object(provider,'urlopen',side_effect=guessing_transport):report,code=verify(live=True,probe_models=True)
        self.assertEqual(code,2);self.assertFalse(report['model_inference_verified'])
        self.assertTrue(report['role_checks'][0]['tool_call_verified']);self.assertFalse(report['role_checks'][0]['tool_roundtrip_verified'])

    def test_malformed_protected_credential_never_reaches_headers_or_error_reports(self):
        for value in ('fictional-key\ncontrolled-private-fragment','fictional-key\rcontrolled-private-fragment','fictional-key controlled-private-fragment','x'*4097):
            with self.subTest(length=len(value)),patch.dict(os.environ,{'OPENAI_API_KEY':value}),patch.object(provider,'urlopen') as network:
                report,code=verify(live=True)
                self.assertEqual(code,2);self.assertEqual(report['configuration']['status'],'invalid_configuration')
                self.assertNotIn('controlled-private-fragment',json.dumps(report));network.assert_not_called()
