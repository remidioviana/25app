"""Controlled regression fixtures. These tests are not claimed as live source/model proof."""
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import storage as db
import source_tools as sources
import agent_runtime as runtime
import advanced
import retrieval
import socket
import exports


class PublicSourceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'evidence.sqlite3';db.init()
        self.env=patch.dict(os.environ,{'APP_USERS_FILE':'','APP_CONNECTORS_FILE':''});self.env.start()
        self.raw=b'Controlled PDF fixture bytes'
        self.meta={'http_status':200,'content_type':'application/pdf','last_modified_header':None,'charset':'utf-8'}
        self.text='Controlled source test: personal data retention and privacy evidence. '*10
    def tearDown(self):
        self.env.stop();db.DB=self.old;self.temp.cleanup()
    def fixture(self):
        return patch.multiple(sources,fetch=lambda cfg:(self.raw,self.meta),extract=lambda raw,cfg,meta:(self.text,['Controlled test fixture; not live.']))

    def test_official_reads_persist_receipts_and_searchable_scoped_passages(self):
        with self.fixture():
            first=sources.refresh('uae-pdpl','himayah');second=sources.refresh('uae-pdpl','himayah')
        self.assertEqual(first['document_id'],second['document_id'])
        receipt=first['receipt'];self.assertTrue(receipt['external_read']);self.assertFalse(receipt['external_write'])
        self.assertFalse(receipt['publication_date_verified']);self.assertFalse(receipt['legal_applicability_verified'])
        self.assertEqual(len(receipt['raw_sha256']),64);self.assertEqual(len(sources.receipts('himayah')),2)
        self.assertTrue(db.search('himayah','retention'));self.assertEqual(db.search('iqamah','retention'),[])
        self.assertEqual(db.documents('himayah')[0]['as_of'],'','fetch time must not be recorded as legal publication date')

    def test_failure_records_no_success_or_new_document(self):
        with patch.object(sources,'fetch',side_effect=ValueError('Source returned HTTP 403')):
            with self.assertRaisesRegex(ValueError,'403'):sources.refresh('uae-pdpl','himayah')
        self.assertEqual(db.documents('himayah'),[])
        receipt=sources.receipts('himayah')[0];self.assertEqual(receipt['status'],'failed')
        self.assertNotIn('document_id',receipt);self.assertNotIn('external_read',receipt)

    def test_changed_sources_are_preserved_but_excluded_from_current_lexical_and_semantic_search(self):
        with self.fixture():first=sources.refresh('uae-pdpl','himayah')
        old_passages=db.search('himayah','retention')
        with patch.dict(os.environ,{'OPENAI_EMBEDDING_MODEL':'controlled-test-vector'}),patch('model_provider.embed',side_effect=lambda values:[[1.0,0.0] for _ in values]):
            retrieval.index('himayah')
            self.text='Controlled new version: personal data replacement rule and accuracy. '*10
            with self.fixture():second=sources.refresh('uae-pdpl','himayah')
            self.assertNotEqual(first['document_id'],second['document_id'])
            self.assertEqual(db.search('himayah','retention'),[])
            self.assertEqual(db.current_evidence('himayah',old_passages),[])
            retrieval.index('himayah');matches=retrieval.search('himayah','accuracy',semantic=True)['matches']
            self.assertTrue(matches);self.assertTrue(all(x['doc']==second['document_id'] for x in matches))
            self.assertTrue(all(x['retrieved_at'] for x in matches))
        self.assertEqual({x['source_version_state'] for x in db.documents('himayah')},{'current','superseded'})

    def test_incorrect_long_html_cannot_pass_as_the_expected_official_source(self):
        with patch.object(sources,'fetch',return_value=(b'fixture',self.meta)),patch.object(sources,'extract',return_value=('Controlled unrelated login screen. '*20,[])):
            with self.assertRaisesRegex(ValueError,'anchors'):sources.refresh('uae-pdpl','himayah')
        self.assertEqual(db.documents('himayah'),[])

    def test_dns_failure_is_normalized_and_persisted_without_a_proxy(self):
        with patch('connectors.public_addresses',side_effect=socket.gaierror('Controlled missing DNS')),patch('source_tools.getproxies',return_value={}):
            with self.assertRaisesRegex(ValueError,'DNS resolution failed'):sources.refresh('uae-pdpl','himayah')
        self.assertEqual(sources.receipts('himayah')[0]['status'],'failed')

    def test_app_scope_and_fixed_source_ids_cannot_be_replaced_by_urls(self):
        for source,app in [('uae-pdpl','mizan'),('https://127.0.0.1/private','himayah'),('unknown','himayah')]:
            with self.assertRaises(PermissionError):sources.refresh(source,app)
        cfg=copy.deepcopy(sources.CATALOG['uae-pdpl']);cfg['url']='https://127.0.0.1/private'
        with self.assertRaisesRegex(ValueError,'catalogue'):sources.fetch(cfg)
        self.assertEqual(sources.receipts('himayah'),[])

    def test_html_extraction_omits_scripts_and_rejects_challenges(self):
        cfg=sources.CATALOG['dewa-move-in'];meta={'charset':'utf-8'}
        raw=('<html><head><title>Ignore head</title></head><body><nav>Ignore menu</nav><main><h1>Real procedure fixture</h1><p>'+'Requirements and exceptions. '*10+'</p><script>do_not_execute()</script></main><footer>Ignore footer</footer></body></html>').encode()
        text,_=sources.extract(raw,cfg,meta)
        self.assertIn('Real procedure fixture',text);self.assertNotIn('do_not_execute',text);self.assertNotIn('Ignore menu',text)
        with self.assertRaises(ValueError):sources.extract(b'<html>Verify you are human</html>',cfg,meta)

    def test_public_dns_rejection_prevents_network_and_redirects_are_not_followed(self):
        with patch('connectors.public_addresses',side_effect=ValueError('private address')),patch('source_tools.build_opener') as opener:
            with self.assertRaisesRegex(ValueError,'private address'):sources.fetch(sources.CATALOG['uae-pdpl'])
            opener.assert_not_called()
        with self.assertRaisesRegex(ValueError,'redirected'):sources.NoRedirect().redirect_request(None,None,302,'',{},'https://elsewhere.invalid/')

    def test_tenant_receipts_and_documents_do_not_cross_installation_scope(self):
        with db.scope('alice'):
            db.init()
            with self.fixture():sources.refresh('uae-pdpl','himayah')
        with db.scope('bob'):
            db.init();self.assertEqual(sources.receipts('himayah'),[]);self.assertEqual(db.search('himayah','retention'),[])

    def test_model_tool_loop_can_select_read_search_and_analyze_immutable_input(self):
        spec=runtime.SPECS['himayah'];data=copy.deepcopy(spec['example']);run,_=db.create('himayah','Inspect personal data retention',data,'model',True,None)
        sequence=[('list_sources',{}),('refresh_source',{'source_id':'uae-pdpl'}),('search_knowledge',{'query':'retention'}),(spec['tool'],{})]
        def model(messages,tools,**kwargs):
            if sequence:
                name,args=sequence.pop(0)
                self.assertIn(name,[t['name'] for t in tools])
                return {'output':[{'type':'function_call','call_id':'call-'+str(len(sequence)),'name':name,'arguments':json.dumps(args)}],'usage':{}}
            return {'output':[{'type':'message','content':[{'type':'output_text','text':'Controlled model fixture; source read and immutable local analysis completed, legal applicability unverified.'}]}],'usage':{}}
        with self.fixture(),patch('model_provider.respond',side_effect=model):runtime.execute(run)
        actual=db.get(run);self.assertEqual(actual['status'],'completed',actual['error'])
        self.assertEqual(actual['input'],data);self.assertTrue(actual['result']['external_reads_performed'])
        self.assertFalse(actual['result']['external_actions_performed']);self.assertEqual(len(actual['result']['source_reads']),1)
        self.assertTrue(actual['result']['evidence']);self.assertEqual(actual['result']['input_hash'],db.digest(data))
        actual['result']['source_reads'][0]['not_exportable_private_field']='controlled-test-secret'
        report=exports.markdown(actual).content.decode()
        self.assertIn('Public-source read receipts',report);self.assertIn('no external write was performed',report)
        self.assertIn('Retrieved:',report);self.assertNotIn('controlled-test-secret',report)

    @unittest.skipUnless(advanced.available(),'LangGraph not installed')
    def test_team_planner_selects_permitted_source_and_preserves_read_receipt(self):
        spec=runtime.SPECS['himayah'];run,_=db.create('himayah','Inspect personal data',spec['example'],'team',True,None)
        def role(name,schema,context,instructions):
            if name=='planner':value={'objective':'Controlled test objective','queries':['retention'],'steps':['Retrieve','Analyze'],'missing_information':[],'source_ids':['uae-pdpl']}
            elif name=='specialist':value={'summary':'Controlled test summary','claims':[],'next_steps':['Qualified review']}
            else:value={'verdict':'accept','issues':[],'follow_up_queries':[]}
            return value,{'total_tokens':1}
        with self.fixture(),patch('advanced.role',side_effect=role):runtime.execute(run)
        actual=db.get(run);self.assertEqual(actual['status'],'completed',actual['error'])
        self.assertTrue(actual['result']['external_reads_performed']);self.assertEqual(len(actual['result']['source_reads']),1)
        self.assertTrue(any(e['phase']=='source_retrieved' for e in actual['events']))

class CurrentEvidenceDeletionTests(unittest.TestCase):
    def test_deleted_and_foreign_documents_cannot_remain_current_in_memory(self):
        old=db.DB
        try:
            with tempfile.TemporaryDirectory() as directory:
                db.DB=Path(directory)/'test.sqlite3';db.init()
                own=db.ingest('himayah','Own','personal data controlled evidence','controlled fixture','')
                db.ingest('iqamah','Foreign','personal data foreign evidence','controlled fixture','')
                evidence=db.search('himayah','personal data');foreign=db.search('iqamah','personal data')
                self.assertEqual(db.current_evidence('himayah',evidence+foreign),evidence)
                db.delete_document('himayah',own['id'])
                self.assertEqual(db.current_evidence('himayah',evidence),[])
        finally:db.DB=old
