import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import intake
import storage as db
from agent_runtime import SPECS

class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'db.sqlite3';db.init()
        self.config=patch('model_provider.configured',return_value=True);self.config.start()
    def tearDown(self):self.config.stop();db.DB=self.old;self.temp.cleanup()
    def response(self,name,args):return {'output':[{'type':'function_call','name':name,'arguments':json.dumps(args),'call_id':'test'}]}
    def test_all_25_proposals_validate_and_never_start_run(self):
        for agent,spec in SPECS.items():
            with self.subTest(agent=agent),patch('model_provider.respond',return_value=self.response('propose_input',{'input':spec['example'],'uncertainties':[],'citations':[]})):
                result=intake.prepare(agent,spec,'Pedido de teste com dados fornecidos')
                self.assertEqual(result['status'],'ready_for_review');self.assertFalse(result['run_started']);self.assertEqual(db.recent(agent),[])
    def test_missing_information_instead_of_fake_data(self):
        with patch('model_provider.respond',return_value=self.response('ask_missing_information',{'questions':['Qual é a moeda?']})):
            result=intake.prepare('mizan',SPECS['mizan'],'Analise meu orçamento')
        self.assertEqual(result['status'],'needs_information');self.assertNotIn('input',result)
    def test_unknown_citation_and_extra_input_rejected(self):
        args={'input':SPECS['mizan']['example'],'uncertainties':[],'citations':['other-user:0']}
        with patch('model_provider.respond',return_value=self.response('propose_input',args)):
            with self.assertRaises(ValueError):intake.prepare('mizan',SPECS['mizan'],'Pedido')
        args['citations']=[];args['input']=dict(args['input'],unexpected=True)
        with patch('model_provider.respond',return_value=self.response('propose_input',args)):
            with self.assertRaises(ValueError):intake.prepare('mizan',SPECS['mizan'],'Pedido')
    def test_no_examples_sent_to_model(self):
        with patch('model_provider.respond',return_value=self.response('ask_missing_information',{'questions':['Quais transações?']})) as call:
            intake.prepare('mizan',SPECS['mizan'],'Analise meu orçamento')
        context=json.loads(call.call_args.args[0][1]['content']);self.assertEqual(set(context),{'request','evidence'})
        self.assertNotIn('example',json.dumps(context))

if __name__=='__main__':unittest.main()
