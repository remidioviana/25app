import copy
import json
import os
from pathlib import Path
import tempfile
import threading
import time
import unittest
from unittest.mock import patch
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import storage as db
import agent_runtime as engine
from domain_tools import TOOLS
from validation import validate
import server

class Suite(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'test.sqlite3';db.init()
    def tearDown(self): db.DB=self.old;self.temp.cleanup()
    def example(self,a): return copy.deepcopy(engine.SPECS[a]['example'])
    def run_agent(self,a,mode='local',example=True):
        run,_=db.create(a,'Analisar dados de teste',self.example(a),mode,example,None);engine.execute(run);return db.get(run)
    def test_all_25_execute_and_verify(self):
        self.assertEqual(len(engine.SPECS),25)
        for a,spec in engine.SPECS.items():
            with self.subTest(agent=a):
                validate(spec['example'],spec['schema']);run=self.run_agent(a)
                self.assertEqual(run['status'],'completed',run['error'])
                self.assertEqual(run['result']['analysis'],TOOLS[a](spec['example']))
                self.assertEqual(run['result']['analysis_hash'],db.digest(run['result']['analysis']))
                self.assertTrue(any(e['phase']=='verifying' for e in run['events']))
    def test_tawassul_proposal_uses_approved_matching_facts_in_english(self):
        data={'account':'Controlled customer','needs':['logistics','reporting'],'products':[
            {'name':'Operations','tags':['logistics'],'approved_fact':'Organizes approved tasks.'},
            {'name':'Unmatched','tags':['billing'],'approved_fact':'Must not enter this proposal.'}]}
        result=TOOLS['tawassul'](data)
        self.assertTrue(result['draft'].startswith('Proposal for Controlled customer'))
        self.assertIn('Organizes approved tasks.',result['draft'])
        self.assertNotIn('Must not enter this proposal.',result['draft'])
        self.assertEqual(result['uncovered_needs'],['reporting']);self.assertFalse(result['sent'])
    def test_contract_offsets_and_missing_clause(self):
        d=self.example('himayah');r=TOOLS['himayah'](d);self.assertEqual(r['flag_count'],2)
        d['text']+=' The retention period is 30 days.';self.assertEqual(TOOLS['himayah'](d)['flag_count'],1)
        hit=r['findings'][1]['matches'][0];self.assertEqual(d['text'][hit['start']:hit['end']],'share data')
    def test_document_expiry_and_absence(self):
        r=TOOLS['sahil'](self.example('sahil'));self.assertEqual(r['checks'][0]['status'],'expired');self.assertIn('address',r['missing'])
    def test_business_costs(self):
        r=TOOLS['istithmar'](self.example('istithmar'));self.assertEqual(r['comparison'][0]['name'],'Option B — example');self.assertEqual(r['comparison'][0]['total'],22600)
    def test_tender_coverage_and_deadline(self):
        r=TOOLS['munagasah'](self.example('munagasah'));self.assertEqual(r['coverage_percent'],66.7);self.assertEqual(r['days_to_deadline'],17)
    def test_workforce_no_division_by_zero(self):
        d=self.example('tawteen');d['employees']=[];self.assertIsNone(TOOLS['tawteen'](d)['current_percent'])
        d['target_percent']=101
        with self.assertRaises(ValueError):TOOLS['tawteen'](d)
    def test_claims_sum_and_timeline(self):
        r=TOOLS['adl'](self.example('adl'));self.assertEqual(r['claimed_total'],5250);self.assertEqual(r['timeline'][0]['date'],'2026-09-01')
    def test_proposal_uncovered_needs(self):self.assertEqual(TOOLS['tawassul'](self.example('tawassul'))['uncovered_needs'],['reporting'])
    def test_campaign_unapproved_claim(self):self.assertFalse(TOOLS['adab'](self.example('adab'))['claim_review'][0]['approved_exact_match'])
    def test_refund_outside_limit(self):
        r=TOOLS['khidmah'](self.example('khidmah'));self.assertTrue(r['policy_eligible']);self.assertFalse(r['within_delegation_limit']);self.assertFalse(r['refund_issued'])
    def test_customs_estimate(self):
        r=TOOLS['jomrok'](self.example('jomrok'));self.assertEqual(r['estimated_duty'],525);self.assertEqual(r['missing_fields'],['hs_code'])
    def test_skills_missing_is_not_rejection(self):self.assertEqual(TOOLS['khibrat'](self.example('khibrat'))['rubric'][1]['status'],'not_evidenced')
    def test_dependency_cycles_and_unknowns(self):
        for a in ['majlis','gurbah']:
            d=self.example(a);d['tasks'][0]['depends_on']=[d['tasks'][1]['id']]
            with self.assertRaises(ValueError):TOOLS[a](d)
            d['tasks'][0]['depends_on']=['missing']
            with self.assertRaises(ValueError):TOOLS[a](d)
    def test_calendar_never_truncates_fractional_minutes(self):
        for agent in ('rafiq','sawm'):
            for field in ('buffer','duration'):
                data=self.example(agent)
                if field=='buffer':data['buffer_minutes']=0.9
                else:data['tasks'][0]['minutes']=1.9
                with self.subTest(agent=agent,field=field),self.assertRaisesRegex(ValueError,'whole number of minutes'):
                    TOOLS[agent](data)
            data=self.example(agent);data['buffer_minutes']=0.0
            data['tasks']=[{'title':'Controlled task','minutes':1.0}]
            self.assertEqual(len(TOOLS[agent](data)['planned_blocks']),1)
    def test_calendar_preserves_busy_buffer(self):
        for a in ['rafiq','sawm']:
            d=self.example(a);r=TOOLS[a](d)
            for block in r['planned_blocks']:
                for busy in d['busy']:
                    self.assertTrue(block['end']<=busy['start'] or block['start']>=busy['end'])
            d['tasks']=[{'title':'Longa','minutes':9999}];self.assertEqual(TOOLS[a](d)['unscheduled'],['Longa'])
    def test_ledgers_deduplicate_and_decimal(self):
        r=TOOLS['manzil'](self.example('manzil'));self.assertEqual(r['total'],149.9);self.assertEqual(r['duplicate_ids_excluded'],['receipt1'])
        r=TOOLS['mizan'](self.example('mizan'));self.assertEqual(r['by_category'][1]['remaining'],-50)
    def test_restaurant_filters(self):
        r=TOOLS['thawg'](self.example('thawg'));self.assertTrue(r['shortlist'][0]['eligible_on_supplied_data']);self.assertFalse(r['shortlist'][1]['eligible_on_supplied_data'])
    def test_utility_normalized(self):
        d=self.example('amanah-eco');self.assertEqual(TOOLS['amanah-eco'](d)['normalized_change_percent'],-10)
        d['previous_usage']=0;self.assertIsNone(TOOLS['amanah-eco'](d)['normalized_change_percent'])
    def test_wellbeing_range(self):
        d=self.example('nafas');self.assertEqual(len(TOOLS['nafas'](d)['routine']),3);d['days']=15
        with self.assertRaises(ValueError):TOOLS['nafas'](d)
    def test_recycling_hazardous_route(self):self.assertEqual(len(TOOLS['tadweer'](self.example('tadweer'))['routes']),1)
    def test_heritage_missing_source(self):
        d=self.example('turath');d['topics']=['unknown'];r=TOOLS['turath'](d);self.assertEqual(r['lessons'],[]);self.assertEqual(r['missing_topics'],['unknown'])
    def test_accessibility_unknown_not_confirmed(self):
        r=TOOLS['himam'](self.example('himam'));self.assertTrue(r['routes'][0]['confirmed_by_supplied_data']);self.assertFalse(r['routes'][1]['confirmed_by_supplied_data'])
    def test_food_expiry_allergens_and_capacity(self):
        d=self.example('hisad');r=TOOLS['hisad'](d);self.assertTrue(r['matches'][0]['eligible_for_review']);self.assertFalse(r['matches'][1]['eligible_for_review'])
        d['lot']['expires']=d['as_of'];self.assertTrue(all(not x['eligible_for_review'] for x in TOOLS['hisad'](d)['matches']))
        d['lot']['expires']='2026-11-14T18:00:00'
        with self.assertRaises(ValueError):TOOLS['hisad'](d)
    def test_schema_rejects_bool_as_number(self):
        d=self.example('istithmar');d['years']=True
        with self.assertRaises(ValueError):validate(d,engine.SPECS['istithmar']['schema'])
    def test_missing_schema_field(self):
        for a,spec in engine.SPECS.items():
            d=self.example(a);d.pop(next(iter(d)))
            with self.assertRaises(ValueError):validate(d,spec['schema'])
    def test_rag_scope_citations_and_delete(self):
        a=db.ingest('himayah','Contrato','Retenção de dados: 30 dias.','contrato:1','2026-11-14')
        db.ingest('hisad','Privado','Retenção de dados: segredo.','other','')
        hits=db.search('himayah','retenção');self.assertEqual(len(hits),1);self.assertEqual(hits[0]['citation'],a['id']+':0')
        self.assertTrue(db.delete_document('himayah',a['id']));self.assertEqual(db.search('himayah','retenção'),[])
    def test_memory_only_accepted_real_same_agent(self):
        run=self.run_agent('mizan',example=False);self.assertEqual(db.memory('mizan'),[])
        with db.connect() as c:c.execute("UPDATE runs SET review='accepted' WHERE id=?",(run['id'],))
        self.assertEqual(len(db.memory('mizan')),1);self.assertEqual(db.memory('manzil'),[])
    def test_idempotency_and_conflict(self):
        args=('mizan','g',self.example('mizan'),'local',True,'key')
        a,new=db.create(*args);b,new2=db.create(*args);self.assertEqual(a,b);self.assertTrue(new);self.assertFalse(new2)
        with self.assertRaises(ValueError):db.create('mizan','changed',args[2],'local',True,'key')
    def test_cancelled_is_not_executed(self):
        run,_=db.create('mizan','g',self.example('mizan'),'local',True,None)
        with db.connect() as c:c.execute("UPDATE runs SET status='cancelled' WHERE id=?",(run,))
        engine.execute(run);self.assertIsNone(db.get(run)['result'])
    def test_model_tool_loop_mocked(self):
        tool=engine.SPECS['mizan']['tool'];responses=[{'output':[{'type':'function_call','name':tool,'arguments':'{}','call_id':'call1'}]}, {'output':[{'type':'message','content':[{'type':'output_text','text':'Síntese baseada na ferramenta.'}]}],'usage':{'total_tokens':100}}]
        with patch('model_provider.respond',side_effect=responses) as mocked:
            run=self.run_agent('mizan','model');self.assertEqual(run['status'],'completed',run['error']);self.assertEqual(mocked.call_count,2)
            self.assertEqual(run['result']['analysis']['total'],450)
    def test_model_cannot_replace_data(self):
        tool=engine.SPECS['mizan']['tool'];bad={'output':[{'type':'function_call','name':tool,'arguments':'{"input":{}}','call_id':'bad'}]}
        with patch('model_provider.respond',return_value=bad):run=self.run_agent('mizan','model')
        self.assertEqual(run['status'],'failed');self.assertIsNone(run['result'])
    def test_model_cannot_fabricate_success_without_tool(self):
        answer={'output':[{'type':'message','content':[{'type':'output_text','text':'Tudo pronto'}]}]}
        with patch('model_provider.respond',return_value=answer):run=self.run_agent('mizan','model')
        self.assertEqual(run['status'],'failed')
    def test_restart_requeues_and_processes(self):
        run,_=db.create('mizan','g',self.example('mizan'),'local',True,None)
        with db.connect() as c:c.execute("UPDATE runs SET status='running' WHERE id=?",(run,))
        with patch('agent_runtime.submit',side_effect=engine.execute):engine.recover()
        self.assertEqual(db.get(run)['status'],'completed')

class HTTPTests(Suite):
    # Reuse only fixtures, not the domain test suite.
    def setUp(self):
        super().setUp();self.http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler);self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start();self.base=f'http://127.0.0.1:{self.http.server_port}'
    def tearDown(self):
        self.http.shutdown();self.http.server_close();self.thread.join();super().tearDown()
    def request(self,path,method='GET',data=None,headers=None):
        req=Request(self.base+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Content-Type':'application/json',**(headers or {})})
        try:
            with urlopen(req) as r:return r.status,json.load(r) if 'json' in r.headers.get('Content-Type','') else r.read()
        except HTTPError as e:return e.code,json.load(e)
    def test_http_all_agents(self):
        status,body=self.request('/api/agents');self.assertEqual(status,200);self.assertEqual(len(body['agents']),25)
        with patch('server.submit',side_effect=engine.execute):
            for a,spec in engine.SPECS.items():
                status,run=self.request('/api/agents/'+a+'/runs','POST',{'goal':'Teste','input':spec['example'],'example':True})
                self.assertEqual(status,202);self.assertEqual(run['status'],'completed')
                status,page=self.request('/apps/'+a);self.assertEqual(status,200)
    def test_http_protect_private_files(self):
        for path in ['/server.py','/data/agents-v2.sqlite3','/../server.py','/agents/mizan/agent.json']:
            self.assertEqual(self.request(path)[0],404)
    def test_http_excessive_json_nesting_is_a_client_error(self):
        raw=b'{"input":'+b'['*30000+b'0'+b']'*30000+b'}'
        req=Request(self.base+'/api/agents/mizan/runs',data=raw,method='POST',headers={'Content-Type':'application/json'})
        with patch('server.submit') as submit:
            with self.assertRaises(HTTPError) as caught:urlopen(req)
            self.assertEqual(caught.exception.code,400)
            self.assertIn('nesting',json.load(caught.exception)['error'])
            submit.assert_not_called()
        self.assertEqual(self.request('/api/agents')[0],200)
    def test_http_malformed_and_cross_origin(self):
        self.assertEqual(self.request('/api/agents/mizan/runs','POST',[])[0],400)
        self.assertEqual(self.request('/api/agents/mizan/runs','POST',{}, {'Origin':'https://evil.example'})[0],403)
    def test_http_review_hash_binding_and_repeat(self):
        run=self.run_agent('mizan');path='/api/runs/'+run['id']+'/review'
        self.assertEqual(self.request(path,'POST',{'decision':'accepted','artifact_hash':'wrong'})[0],409)
        data={'decision':'accepted','artifact_hash':run['artifact_hash']}
        self.assertEqual(self.request(path,'POST',data)[0],200);self.assertEqual(self.request(path,'POST',data)[0],409)
    def test_http_token(self):
        with patch('server.TOKEN','test-secret'):
            self.assertEqual(self.request('/api/agents')[0],401)
            self.assertEqual(self.request('/api/agents',headers={'Authorization':'Bearer test-secret'})[0],200)

    def test_http_report_exports(self):
        run=self.run_agent('mizan')
        for fmt in ['markdown','csv']:
            status,content=self.request('/api/runs/'+run['id']+'/export/'+fmt)
            self.assertEqual(status,200);self.assertGreater(len(content),80)
        run=self.run_agent('rafiq')
        status,content=self.request('/api/runs/'+run['id']+'/export/ics?date=2026-12-01')
        self.assertEqual(status,200);self.assertIn(b'BEGIN:VCALENDAR',content)

# Avoid rerunning inherited domain tests in the HTTP fixture.
for name in list(vars(Suite)):
    if name.startswith('test_') and name not in HTTPTests.__dict__:setattr(HTTPTests,name,None)

if __name__=='__main__':unittest.main(verbosity=2)
