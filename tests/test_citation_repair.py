"""Deterministic citation rejection may trigger bounded correction, never invented proof."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import storage as db
import advanced
import agent_runtime as engine

@unittest.skipUnless(advanced.available(),'LangGraph is not installed')
class CitationRepairTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.old=db.DB;self.addCleanup(setattr,db,'DB',self.old);db.DB=Path(self.temp.name)/'test.sqlite3';db.init()
  db.ingest('mizan','Controlled budget evidence','Budget evidence for this controlled diagnostic.','controlled fixture','')
  self.calls=[];self.writes=0;self.always_invalid=False;self.revise=False;self.feedback=[]
 def role(self,name,schema,context,instructions):
  self.calls.append(name)
  if schema is advanced.FINAL_RESPONSE:
   return {'outcome':'inconclusive','draft':{'summary':'Final bounded response','claims':[],'next_steps':[]},'questions':[],'limitations':['Evidence is insufficient for the requested conclusion.']},{'total_tokens':7}
  if name=='planner':value={'objective':'Controlled diagnostic','queries':['budget'],'steps':['Analyze'],'missing_information':[]}
  elif name=='specialist':
   self.writes+=1;self.feedback.append(context.get('validation_feedback'))
   citations=[] if self.writes==1 or self.always_invalid else [context['evidence'][0]['citation']]
   value={'summary':'Controlled diagnostic','claims':[{'text':'Controlled budget evidence.','basis':'evidence','citations':citations}],'next_steps':[]}
  else:value={'verdict':'revise' if self.revise else 'accept','issues':[],'follow_up_queries':[]}
  return value,{'total_tokens':7,'provider_reported_model':name+'-controlled'}
 def execute(self):
  run,_=db.create('mizan','Controlled diagnostic',engine.SPECS['mizan']['example'],'team',True,None)
  with patch.object(advanced,'role',side_effect=self.role):engine.execute(run)
  return run,db.get(run)
 def test_invalid_citation_is_revised_with_actual_evidence_and_recorded_usage(self):
  _,record=self.execute();self.assertEqual(record['status'],'completed',record['error'])
  self.assertEqual(self.calls,['planner','specialist','specialist','critic'])
  self.assertIsNotNone(self.feedback[1]);self.assertEqual(record['result']['writer_attempts'],2)
  self.assertEqual(sum(x['usage']['total_tokens'] for x in record['result']['usage']),28)
  self.assertEqual(sum(e['phase']=='draft_rejected' for e in record['events']),1)
  self.assertEqual(record['result']['draft']['claims'][0]['citations'],[record['result']['evidence'][0]['citation']])
 def test_persistent_invalid_citations_stop_and_retry_cannot_reset_attempt_budget(self):
  self.always_invalid=True;run,record=self.execute()
  self.assertEqual(record['status'],'failed');self.assertEqual(self.writes,3);self.assertNotIn('critic',self.calls)
  self.assertIsNone(record['result'])
  with db.connect() as c:c.execute("UPDATE runs SET status='queued' WHERE id=?",(run,))
  with patch.object(advanced,'role') as model:engine.execute(run);model.assert_not_called()
  self.assertEqual(db.get(run)['status'],'failed')
 def test_citation_repair_is_followed_by_final_auditor_without_repeated_rewrites(self):
  self.revise=True;_,record=self.execute()
  self.assertEqual(record['status'],'completed',record['error'])
  self.assertEqual(self.writes,2);self.assertEqual(len(self.calls),5)
  self.assertEqual(record['result']['decision'],'inconclusive')

 def test_revision_feedback_goes_directly_to_final_model(self):
  count=0
  def role(name,schema,context,instructions):
   nonlocal count
   if schema is advanced.FINAL_RESPONSE:return self.role(name,schema,context,instructions)
   if name=='specialist':
    self.calls.append(name);self.writes+=1
    citations=[] if self.writes==3 else [context['evidence'][0]['citation']]
    return {'summary':'Validated prior version' if self.writes<3 else 'Rejected final revision','claims':[{'text':'Budget evidence','basis':'evidence','citations':citations}],'next_steps':[]},{'total_tokens':7}
   if name=='critic':
    self.calls.append(name);count+=1
    return {'verdict':'accept' if count==3 else 'revise','issues':[],'follow_up_queries':[]},{'total_tokens':7}
   return self.role(name,schema,context,instructions)
  run,_=db.create('mizan','Controlled diagnostic',engine.SPECS['mizan']['example'],'team',True,None)
  with patch.object(advanced,'role',side_effect=role):engine.execute(run)
  record=db.get(run);self.assertEqual(record['status'],'completed',record['error'])
  result=record['result'];self.assertEqual(result['decision'],'inconclusive')
  self.assertFalse(result['prior_valid_draft_retained']);self.assertTrue(result['draft']['summary'].startswith('Final bounded response'))
  self.assertEqual(result['critique']['verdict'],'revise');self.assertEqual(len(self.calls),4)
  self.assertEqual(self.writes,1)
  self.assertEqual(result['draft']['claims'],[]);self.assertFalse(result['unresolved_draft_validation'])
 def test_domain_report_policy_does_not_request_unavailable_tools(self):
  spec=engine.SPECS['sahil'];original=spec['instructions']
  self.assertIn('Execute the domain tool before finalizing.',original)
  self.assertNotIn('Execute the domain tool before finalizing.',advanced.report_policy(spec))
  self.assertIn('has already executed',advanced.report_policy(spec))
  self.assertIn('after this planning step',advanced.report_policy(spec,planning=True))
  self.assertEqual(spec['instructions'],original)
