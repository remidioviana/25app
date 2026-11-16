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
 def test_repair_and_critic_revision_share_the_same_three_write_limit(self):
  self.revise=True;_,record=self.execute()
  self.assertEqual(record['status'],'completed',record['error'])
  self.assertEqual(self.writes,3);self.assertEqual(len(self.calls),6)
  self.assertEqual(record['result']['decision'],'requires_human_review')
