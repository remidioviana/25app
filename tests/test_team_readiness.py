"""Acceptance evidence must distinguish a live graph diagnostic from a product launch."""
import unittest
from unittest.mock import patch
import storage as db
from scripts.verify_team import assess,verify

class TeamReadinessTests(unittest.TestCase):
 def fixture(self):
  original={'synthetic':'input'};analysis={'calculated':True}
  result={'input_hash':db.digest(original),'analysis_hash':db.digest(analysis),'analysis':analysis,
          'usage':[{'role':role,'usage':{'provider_reported_model':model,'total_tokens':7}}
                   for role,model in [('planner','first'),('specialist','first'),('critic','second')]],
          'evidence':[{'citation':'actual:0'}],
          'draft':{'claims':[{'basis':'evidence','citations':['actual:0']}]},
          'external_actions_performed':False,'decision':'reviewed_by_model'}
  return result,original,analysis
 def test_offline_diagnostic_never_imports_engine_or_contacts_provider(self):
  with patch('model_provider.urlopen') as network:
   report,code=verify();network.assert_not_called()
  self.assertEqual(code,0);self.assertFalse(report['live_requested']);self.assertEqual(report['apps'],[])
 def test_valid_diagnostic_is_not_three_models_or_domain_acceptance(self):
  row=assess(*self.fixture());self.assertTrue(row['graph_rag_diagnostic_verified'])
  self.assertFalse(row['three_distinct_models_verified']);self.assertFalse(row['primary_domain_workflow_verified'])
  self.assertFalse(row['factual_correctness_verified']);self.assertEqual(row['reported_total_tokens'],21)
 def test_foreign_or_missing_citations_and_changed_inputs_fail_diagnostic(self):
  for change in ['foreign','missing','input','analysis','external']:
   result,original,analysis=self.fixture()
   if change=='foreign':result['draft']['claims'][0]['citations']=['foreign:1']
   if change=='missing':result['draft']['claims']=[]
   if change=='input':result['input_hash']='tampered'
   if change=='analysis':result['analysis']={'changed':True}
   if change=='external':result['external_actions_performed']=True
   with self.subTest(change=change):self.assertFalse(assess(result,original,analysis)['graph_rag_diagnostic_verified'])
 def test_missing_role_or_missing_provider_identity_cannot_pass(self):
  for change in ['role','identity']:
   result,original,analysis=self.fixture()
   if change=='role':result['usage'].pop()
   else:result['usage'][0]['usage'].pop('provider_reported_model')
   with self.subTest(change=change),self.assertRaises(ValueError):assess(result,original,analysis)


class DiagnosticPacingTests(unittest.TestCase):
 def test_role_requests_are_spaced_and_original_transport_is_restored(self):
  from scripts.verify_team import paced_roles
  import model_provider as provider
  with patch.object(provider,'respond',return_value={'controlled':True}) as original,patch('scripts.verify_team.time.monotonic',side_effect=[10,10,25]),patch('scripts.verify_team.time.sleep') as pause:
   with paced_roles(15):
    self.assertEqual(provider.respond([],[],role='critic'),{'controlled':True})
    provider.respond([],[],role='specialist')
   self.assertIs(provider.respond,original);self.assertEqual(original.call_count,2);pause.assert_called_once_with(15)
 def test_failed_role_restores_transport_without_automatic_retry(self):
  from scripts.verify_team import paced_roles
  import model_provider as provider
  with patch.object(provider,'respond',side_effect=RuntimeError('controlled quota')) as original:
   with self.assertRaises(RuntimeError):
    with paced_roles(15):provider.respond([],[])
   self.assertIs(provider.respond,original);self.assertEqual(original.call_count,1)
