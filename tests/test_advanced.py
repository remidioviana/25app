import copy
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import storage as db
import advanced
import retrieval
import agent_runtime as engine


def mock_role(name,schema,context,instructions):
    if name=='planner':v={'objective':'Analisar dados','queries':['evidência'],'steps':['Calcular','Revisar'],'missing_information':[]}
    elif name=='specialist':v={'summary':'Resultado calculado a partir dos dados informados.','claims':[{'text':'A ferramenta produziu a análise.','basis':'calculation','citations':[]}],'next_steps':['Conferir os dados']}
    else:v={'verdict':'accept','issues':[],'follow_up_queries':[]}
    return v,{'total_tokens':10}

class AdvancedTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'db.sqlite3';db.init()
        self.env=patch.dict(os.environ,{'OPENAI_EMBEDDING_MODEL':'test-embedding','AGENT_SEMANTIC_SEARCH':'0'});self.env.start()
    def tearDown(self):self.env.stop();db.DB=self.old;self.temp.cleanup()
    def newrun(self,agent='mizan'):
        return db.create(agent,'Analisar dados',engine.SPECS[agent]['example'],'team',True,None)[0]
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_all_25_actual_langgraph_mocked_model_roles(self):
        with patch('advanced.role',side_effect=mock_role):
            for a in engine.SPECS:
                with self.subTest(agent=a):
                    run=self.newrun(a);engine.execute(run);r=db.get(run)
                    self.assertEqual(r['status'],'completed',r['error']);self.assertEqual(r['result']['decision'],'reviewed_by_model')
                    self.assertEqual(len(r['result']['usage']),3)
        self.assertTrue((db.DB.parent/'langgraph-checkpoints.sqlite3').exists())
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_critic_revision_bound(self):
        def f(name,*args):
            if name=='critic':return {'verdict':'revise','issues':['Needs human review'],'follow_up_queries':[]},{'total_tokens':10}
            return mock_role(name,*args)
        with patch('advanced.role',side_effect=f):
            run=self.newrun();engine.execute(run);r=db.get(run)
        self.assertEqual(r['status'],'completed',r['error']);self.assertEqual(r['result']['decision'],'requires_human_review')
        self.assertEqual(sum(x['role']=='critic' for x in r['result']['usage']),3)
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_resume_does_not_replay_successful_roles(self):
        calls=[]
        def f(name,*args):
            calls.append(name)
            if name=='critic':raise RuntimeError('Test outage')
            return mock_role(name,*args)
        run=self.newrun()
        with patch('advanced.role',side_effect=f):engine.execute(run)
        self.assertEqual(db.get(run)['status'],'failed')
        with db.connect() as c:c.execute("UPDATE runs SET status='queued' WHERE id=?",(run,))
        with patch('advanced.role',side_effect=mock_role) as model:engine.execute(run)
        r=db.get(run);self.assertEqual(r['status'],'completed',r['error']);self.assertEqual(model.call_count,1)
        self.assertEqual(model.call_args.args[0],'critic')
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_unknown_citation_rejected(self):
        def f(name,*args):
            v,u=mock_role(name,*args)
            if name=='specialist':v['claims'][0]={'text':'Inventado','basis':'evidence','citations':['fake:0']}
            return v,u
        with patch('advanced.role',side_effect=f):
            run=self.newrun();engine.execute(run)
        self.assertEqual(db.get(run)['status'],'failed');self.assertIn('Citation',db.get(run)['error'])
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_retrieval_feedback_loop(self):
        count=0
        def f(name,*args):
            nonlocal count
            if name=='critic':
                count+=1
                return {'verdict':'needs_evidence' if count==1 else 'accept','issues':[],'follow_up_queries':['budget']},{'total_tokens':10}
            return mock_role(name,*args)
        db.ingest('mizan','Budget','Budget evidence','reference','2026-11-14')
        with patch('advanced.role',side_effect=f):run=self.newrun();engine.execute(run)
        r=db.get(run);self.assertEqual(r['status'],'completed',r['error']);self.assertTrue(r['result']['evidence']);self.assertEqual(count,2)
    def test_vector_validation(self):
        for v in [[],[0,0],[float('nan'),0],[True,0],['1',2]]:
            with self.assertRaises(ValueError):retrieval.vector(v)
    def test_semantic_index_scope_and_delete(self):
        doc=db.ingest('mizan','Gastos','alimentação e transporte','source','')
        db.ingest('hisad','Privado','outra alimentação','private','')
        with patch('model_provider.embed',return_value=[[1.,0.]]):
            result=retrieval.index('mizan');self.assertEqual(result['indexed_chunks'],1)
            result=retrieval.search('mizan','dining',True);self.assertEqual(result['method'],'bm25+cosine+rrf')
            self.assertEqual(len(result['matches']),1);self.assertEqual(result['matches'][0]['doc'],doc['id'])
            self.assertEqual(retrieval.search('hisad','dining',True)['matches'],[])
        db.delete_document('mizan',doc['id'])
        with db.connect() as c:self.assertEqual(c.execute('SELECT COUNT(*) FROM embeddings').fetchone()[0],0)
    def test_index_reuses_same_model(self):
        db.ingest('mizan','Budget','Budget 500','source','')
        with patch('model_provider.embed',return_value=[[1.,0.]]) as m:
            retrieval.index('mizan');retrieval.index('mizan');self.assertEqual(m.call_count,1)
    def test_dimension_mismatch_is_explicit(self):
        db.ingest('mizan','Budget','Budget 500','source','')
        with patch('model_provider.embed',return_value=[[1.,0.]]):retrieval.index('mizan')
        with patch('model_provider.embed',return_value=[[1.,0.,0.]]):
            with self.assertRaises(ValueError):retrieval.search('mizan','query',True)
    def test_structured_role_contract(self):
        with patch('model_provider.respond',return_value={'output':[{'type':'message'}]}):
            with self.assertRaises(ValueError):advanced.role('planner',advanced.PLAN,{},'')

if __name__=='__main__':unittest.main(verbosity=2)

class LangChainBindingTests(unittest.TestCase):
    @unittest.skipUnless(advanced.available(),'LangGraph/LangChain não instalado')
    def test_tool_data_is_immutable_and_unknown_args_rejected(self):
        from langchain_tools import build_tools
        spec=engine.SPECS['mizan'];data=copy.deepcopy(spec['example']);tools=build_tools(spec,data)
        data['transactions'][0]['amount']=99999
        self.assertEqual(tools['analyze'].invoke({})['total'],450)
        with self.assertRaises(Exception):tools['analyze'].invoke({'input':{}})

class EvidenceBudgetTests(unittest.TestCase):
    @unittest.skipUnless(advanced.available(),'LangGraph is not installed')
    def test_invalid_evidence_limit_fails_before_any_provider_call(self):
        for limit in ('0','25','private-invalid-value'):
            with self.subTest(limit=limit),patch.dict(os.environ,{'AGENT_MAX_EVIDENCE_PASSAGES':limit}),patch('model_provider.respond') as model:
                with self.assertRaises(ValueError) as caught:advanced.run({'id':'test','agent':'himayah'}, {},lambda:None)
                self.assertNotIn('private-invalid-value',str(caught.exception));model.assert_not_called()

class RoleSchemaChoiceTests(unittest.TestCase):
    def test_role_payload_rejects_unknown_claim_basis_and_verdict(self):
        from validation import validate
        for basis in ('input','calculation','evidence'):
            value={'summary':'short','claims':[{'text':'claim','basis':basis,'citations':[]}],'next_steps':[]}
            validate(value,advanced.DRAFT)
        value['claims'][0]['basis']='source'
        with self.assertRaisesRegex(ValueError,'permitted choices'):validate(value,advanced.DRAFT)
        for verdict in ('accept','revise','needs_evidence'):
            validate({'verdict':verdict,'issues':[],'follow_up_queries':[]},advanced.CRITIC)
        with self.assertRaisesRegex(ValueError,'permitted choices'):
            validate({'verdict':'approved','issues':[],'follow_up_queries':[]},advanced.CRITIC)
    def test_real_adapter_receives_enumerated_role_contract(self):
        response={'output':[{'type':'function_call','name':'deliver_role_result','arguments':json.dumps({'summary':'short','claims':[{'text':'claim','basis':'source','citations':[]}],'next_steps':[]})}],'usage':{}}
        with patch('model_provider.respond',return_value=response) as model:
            with self.assertRaisesRegex(ValueError,'permitted choices'):advanced.role('specialist',advanced.DRAFT,{},'')
        schema=model.call_args.args[1][0]['parameters']
        self.assertEqual(schema['properties']['claims']['items']['properties']['basis']['enum'],['input','calculation','evidence'])

class ReviewerStructuredOutputTests(unittest.TestCase):
    def test_reviewer_validates_json_without_registering_a_fake_tool(self):
        value={'verdict':'accept','issues':[],'follow_up_queries':[]}
        with patch.dict(os.environ,{'AGENT_AUDITOR_MODEL':'openai/gpt-oss-120b'}),patch('model_provider.respond',return_value={'output_text':json.dumps(value),'output':[],'usage':{'total_tokens':3}}) as model:
            actual,usage=advanced.role('critic',advanced.CRITIC,{},'Audit')
        self.assertEqual(actual,value);self.assertEqual(model.call_args.args[1],[])
        self.assertEqual(model.call_args.kwargs['response_schema'],advanced.CRITIC)
    def test_reviewer_rejects_invalid_json_schema_values_and_tool_calls(self):
        responses=[{'output_text':'not JSON','output':[]},
                   {'output_text':json.dumps({'verdict':'approved','issues':[],'follow_up_queries':[]}),'output':[]},
                   {'output_text':json.dumps({'verdict':'accept','issues':[],'follow_up_queries':[]}),'output':[{'type':'function_call'}]}]
        for response in responses:
            with self.subTest(response=response),patch.dict(os.environ,{'AGENT_AUDITOR_MODEL':'openai/gpt-oss-120b'}),patch('model_provider.respond',return_value=response):
                with self.assertRaises(ValueError):advanced.role('critic',advanced.CRITIC,{},'Audit')
