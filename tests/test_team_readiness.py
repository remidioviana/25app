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


class PortfolioLotSelectionTests(unittest.TestCase):
 def test_each_new_lot_is_bounded_and_offline_does_not_call_provider(self):
  for lot in (2,3,4,5):
   with self.subTest(lot=lot),patch('model_provider.urlopen') as network:
    report,code=verify(lot=lot)
    self.assertEqual(code,0);self.assertEqual(len(report['selected_apps']),5);network.assert_not_called()
 def test_unknown_or_oversized_selection_is_rejected_before_network(self):
  from scripts.verify_team import APP_SOURCES
  for app in (['unknown'],list(APP_SOURCES)[:6]):
   with patch('model_provider.urlopen') as network:
    _,code=verify(app=app);self.assertEqual(code,2);network.assert_not_called()
 def test_quota_in_a_mixed_key_failure_still_stops_the_lot(self):
  from scripts.verify_team import quota_failure
  self.assertTrue(quota_failure('Provider attempts failed: 401, 429.'))
  self.assertTrue(quota_failure('Provider attempts failed: connection_error, 429.'))
  self.assertFalse(quota_failure('Source returned HTTP 429'))
  self.assertFalse(quota_failure('Provider attempts failed: 401, 400.'))


class AppSpacingTests(unittest.TestCase):
 def test_app_pause_respects_elapsed_time_and_skips_first_app(self):
  from scripts.verify_team import pause_between_apps
  with patch('scripts.verify_team.time.sleep') as pause,patch('scripts.verify_team.time.monotonic',return_value=105):
   pause_between_apps(None,30);pause.assert_not_called()
   pause_between_apps(100,30);pause.assert_called_once_with(25)
  with patch('scripts.verify_team.time.sleep') as pause,patch('scripts.verify_team.time.monotonic',return_value=140):
   pause_between_apps(100,30);pause.assert_not_called()
 def test_invalid_interval_is_rejected_before_provider_access(self):
  for interval in (-1,61,True):
   with patch('model_provider.urlopen') as network:
    _,code=verify(min_app_interval_seconds=interval);self.assertEqual(code,2);network.assert_not_called()


class DiagnosticCheckpointTests(unittest.TestCase):
 def test_failed_replace_keeps_previous_complete_report(self):
  from pathlib import Path
  import tempfile,json
  from scripts.verify_team import save_checkpoint
  with tempfile.TemporaryDirectory() as directory:
   target=Path(directory)/'report.json';save_checkpoint({'apps':[{'app':'completed'}]},target)
   with patch.object(Path,'replace',side_effect=OSError('controlled interrupted publication')):
    with self.assertRaises(OSError):save_checkpoint({'apps':[{'app':'unfinished'}]},target)
   self.assertEqual(json.loads(target.read_text())['apps'][0]['app'],'completed')
