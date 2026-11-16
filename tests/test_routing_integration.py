"""Real graph and provider adapter, with only HTTP responses simulated."""
import io,json,os,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
import advanced,agent_runtime as engine,model_provider as provider,storage as db

@unittest.skipUnless(advanced.available(),'LangGraph is not installed')
class RoutingIntegrationTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'db.sqlite3';db.init()
  self.env=patch.dict(os.environ,{'OPENAI_API_KEY':'test-one,test-two,test-three','OPENAI_BASE_URL':'https://api.groq.com/openai/v1','AGENT_SEMANTIC_SEARCH':'0'});self.env.start()
  provider._KEY_CONFIG=();provider._KEY_INDEX=0;self.requests=[];self.auditor_attempts=0;self.failure=None
 def tearDown(self):self.env.stop();db.DB=self.old;self.temp.cleanup()
 def transport(self,request,timeout):
  payload=json.loads(request.data);role=payload['tools'][0]['function']['description'].rsplit(' ',1)[1]
  self.requests.append((role,payload['model'],request.get_header('Authorization')))
  if role=='critic' and payload['model']==provider.AUDIT_MODEL and self.failure:
   self.auditor_attempts+=1
   status=500 if self.failure=='mixed' and self.auditor_attempts==2 else 429
   raise HTTPError(request.full_url,status,'simulated',{},io.BytesIO(b''))
  values={'planner':{'objective':'Review supplied inputs','queries':[],'steps':['Analyze','Review'],'missing_information':[]},'specialist':{'summary':'Review the domain calculation.','claims':[],'next_steps':['Confirm source inputs']},'critic':{'verdict':'accept','issues':[],'follow_up_queries':[]}}
  raw={'choices':[{'finish_reason':'tool_calls','message':{'content':None,'tool_calls':[{'id':'call-'+str(len(self.requests)),'type':'function','function':{'name':'deliver_role_result','arguments':json.dumps(values[role])}}]}}],'usage':{'total_tokens':7}}
  if getattr(self,'report_identity',False):raw['model']=getattr(self,'reported_alias',None) or payload['model']
  return io.BytesIO(json.dumps(raw).encode())
 def execute(self,agent):
  run,_=db.create(agent,'Review the supplied inputs',engine.SPECS[agent]['example'],'team',True,None)
  with patch.object(provider,'urlopen',side_effect=self.transport):engine.execute(run)
  return db.get(run)
 def test_all_25_graphs_route_real_adapter(self):
  for agent in engine.SPECS:
   with self.subTest(agent=agent):
    self.requests=[];result=self.execute(agent)
    self.assertEqual(result['status'],'completed',result['error'])
    self.assertEqual([(r,m) for r,m,k in self.requests],[('planner',provider.FAST_MODEL),('specialist',provider.FAST_MODEL),('critic',provider.AUDIT_MODEL)])
    self.assertEqual(len({k for r,m,k in self.requests}),3)
    self.assertTrue(all(not x['usage']['fallback'] for x in result['result']['usage']))
 def test_auditor_fallback_persisted_in_graph_result(self):
  self.failure='all429';result=self.execute('mizan');self.assertEqual(result['status'],'completed',result['error'])
  self.assertEqual([m for r,m,k in self.requests if r=='critic'],[provider.AUDIT_MODEL]*3+[provider.FAST_MODEL])
  usage=result['result']['usage'][-1]['usage'];self.assertTrue(usage['fallback']);self.assertEqual(usage['fallback_reason'],'all_keys_http_429');self.assertEqual(usage['requested_model'],provider.AUDIT_MODEL)
 def test_mixed_failure_stops_graph_without_downgrade(self):
  self.failure='mixed';result=self.execute('mizan');self.assertEqual(result['status'],'failed')
  self.assertEqual([m for r,m,k in self.requests if r=='critic'],[provider.AUDIT_MODEL]*3)
  self.assertIsNone(result['result']);self.assertNotIn('test-',result['error'])

 def test_strict_graph_records_three_provider_reported_models(self):
  self.report_identity=True
  mapping={'AGENT_PLANNER_MODEL':'planner-test','AGENT_SPECIALIST_MODEL':'specialist-test','AGENT_AUDITOR_MODEL':'critic-test','AGENT_REQUIRE_DISTINCT_MODELS':'1'}
  with patch.dict(os.environ,mapping):result=self.execute('mizan')
  self.assertEqual(result['status'],'completed',result['error'])
  self.assertEqual(result['result']['verified_model_ids'],{'planner':'planner-test','specialist':'specialist-test','critic':'critic-test'})
 def test_strict_graph_rejects_returned_alias_collapse(self):
  self.report_identity=True;self.reported_alias='shared-test'
  with patch.dict(os.environ,{'AGENT_PLANNER_MODEL':'planner-test','AGENT_SPECIALIST_MODEL':'specialist-test','AGENT_AUDITOR_MODEL':'critic-test','AGENT_REQUIRE_DISTINCT_MODELS':'1'}):result=self.execute('mizan')
  self.assertEqual(result['status'],'failed');self.assertIsNone(result['result'])
  self.assertIn('three distinct',result['error'])
