"""Final 120B responses must resolve issues or explicitly preserve uncertainty."""
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import advanced
import agent_runtime as engine
import storage as db
import model_provider as provider

@unittest.skipUnless(advanced.available(),'LangGraph missing')
class FinalResolutionTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.old=db.DB;self.addCleanup(setattr,db,'DB',self.old)
  db.DB=Path(self.temp.name)/'db.sqlite3';db.init()
  self.outcome='inconclusive';self.bad_citation=False;self.calls=[]
 def role(self,name,schema,context,instructions):
  self.calls.append((name,schema))
  if schema is advanced.FINAL_RESPONSE:
   value={'outcome':self.outcome,'draft':{'summary':'120B final answer','claims':[], 'next_steps':[]},
     'questions':['Supply the contract clause.'] if self.outcome=='needs_information' else [],
     'limitations':['The supplied sources do not establish this conclusion.'] if self.outcome=='inconclusive' else []}
   if self.bad_citation:value['draft']['claims']=[{'text':'Unsupported','basis':'evidence','citations':['invented:0']}]
  elif name=='planner':value={'objective':'Analyze','queries':[],'steps':[],'missing_information':[]}
  elif name=='specialist':value={'summary':'Unresolved initial draft','claims':[],'next_steps':[]}
  else:value={'verdict':'revise','issues':['Unresolved claim'],'follow_up_queries':[]}
  return value,{'total_tokens':3}
 def run_graph(self):
  run,_=db.create('mizan','Analyze',engine.SPECS['mizan']['example'],'team',True,None)
  with patch.object(advanced,'role',side_effect=self.role):engine.execute(run)
  return db.get(run)
 def test_unresolved_review_becomes_explicit_inconclusive_final_answer(self):
  run=self.run_graph();self.assertEqual(run['status'],'completed',run['error'])
  result=run['result'];self.assertEqual(result['decision'],'inconclusive')
  self.assertIn('120B final answer',result['narrative']);self.assertIn('do not establish',result['narrative'])
  self.assertNotIn('Unresolved initial draft',result['narrative'])
  self.assertEqual(sum(schema is advanced.FINAL_RESPONSE for _,schema in self.calls),1)
  self.assertEqual(self.calls[-1],('critic',advanced.FINAL_RESPONSE))
  self.assertNotEqual(result['decision'],'reviewed_by_model')
 def test_missing_information_is_a_concrete_question_not_human_review(self):
  self.outcome='needs_information';run=self.run_graph()
  self.assertEqual(run['status'],'completed',run['error'])
  self.assertEqual(run['result']['decision'],'needs_information')
  self.assertIn('Supply the contract clause.',run['result']['narrative'])
 def test_final_model_can_correct_and_complete_the_answer(self):
  self.outcome='answered';run=self.run_graph()
  self.assertEqual(run['status'],'completed',run['error'])
  self.assertEqual(run['result']['decision'],'reviewed_by_model')
  self.assertEqual(run['result']['draft']['summary'],'120B final answer')
 def test_final_model_cannot_deliver_invented_citations(self):
  self.bad_citation=True;run=self.run_graph()
  self.assertEqual(run['status'],'failed');self.assertIsNone(run['result'])
  self.assertIn('Final response validation failed',run['error'])

class FinalTransportTests(unittest.TestCase):
 def response(self):
  value={'outcome':'inconclusive','draft':{'summary':'Limited','claims':[],'next_steps':[]},'questions':[],'limitations':['Missing evidence']}
  return {'output_text':json.dumps(value),'output':[],'usage':{'provider_reported_model':provider.AUDIT_MODEL,'total_tokens':4}}
 def test_terminal_resolver_forces_120b_and_disables_fallback(self):
  with patch.dict(os.environ,{'AGENT_AUDITOR_MODEL':provider.FAST_MODEL}),patch.object(provider,'respond',return_value=self.response()) as call:
   advanced.role('critic',advanced.FINAL_RESPONSE,{},'Finalize')
  self.assertEqual(call.call_args.kwargs['model_override'],provider.AUDIT_MODEL)
  self.assertFalse(call.call_args.kwargs['allow_fallback'])
 def test_reported_wrong_identity_is_rejected(self):
  response=self.response();response['usage']['provider_reported_model']=provider.FAST_MODEL
  with patch.object(provider,'respond',return_value=response):
   with self.assertRaisesRegex(ValueError,'not produced'):advanced.role('critic',advanced.FINAL_RESPONSE,{},'Finalize')
