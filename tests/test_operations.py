import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
from http.server import ThreadingHTTPServer
import io
import json
import os
from pathlib import Path
import sqlite3
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch,MagicMock
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import zipfile
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import storage as db
import identity
import scheduling
import document_import
import connectors
import agent_runtime as engine
import server
import manage

class StoreCase(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.old=db.DB;db.DB=Path(self.temp.name)/'store.sqlite3';db.init()
        self.userfile=Path(self.temp.name)/'users.json';self.userfile.write_text(json.dumps({u:{'token_sha256':hashlib.sha256((u+'-token').encode()).hexdigest()} for u in ('alice','bob')}))
        self.env=patch.dict(os.environ,{'APP_USERS_FILE':str(self.userfile),'APP_CONNECTORS_FILE':''});self.env.start()
    def tearDown(self):self.env.stop();db.DB=self.old;self.temp.cleanup()
    def data(self):return engine.SPECS['mizan']['example']

class TenantTests(StoreCase):
    def test_identity_hashes_and_header_cannot_choose_user(self):
        self.assertEqual(identity.authenticate('Bearer alice-token'),'alice')
        with self.assertRaises(PermissionError):identity.authenticate('Bearer missing')
    def test_database_and_memory_isolation(self):
        with db.scope('alice'):
            db.init();run,_=db.create('mizan','A',self.data(),'local',False,'same-key');engine.execute(run)
            with db.connect() as c:c.execute("UPDATE runs SET review='accepted' WHERE id=?",(run,))
            db.ingest('mizan','Private','Alice secret budget','private','')
            self.assertEqual(len(db.memory('mizan')),1)
        with db.scope('bob'):
            db.init();self.assertIsNone(db.get(run));self.assertEqual(db.memory('mizan'),[]);self.assertEqual(db.search('mizan','budget'),[])
            other,_=db.create('mizan','B',self.data(),'local',False,'same-key');self.assertNotEqual(run,other)
    def test_worker_context_propagates(self):
        with db.scope('alice'):
            db.init();run,_=db.create('mizan','worker',self.data(),'local',True,None);future=engine.submit(run)
        future.result(timeout=10)
        self.assertIsNone(db.get(run))
        with db.scope('alice'):self.assertEqual(db.get(run)['status'],'completed')
    def test_scope_path_traversal(self):
        for scope in ['../bob','ALICE','/tmp','a/b','']:
            with self.assertRaises(ValueError):
                with db.scope(scope):pass
    def test_concurrent_idempotency(self):
        with db.scope('alice'):db.init()
        def create(i):
            with db.scope('alice'):return db.create('mizan','Same',self.data(),'local',True,'race')[0]
        with ThreadPoolExecutor(max_workers=8) as pool:ids=list(pool.map(create,range(16)))
        self.assertEqual(len(set(ids)),1)
    def test_operator_provisioning_stores_only_hash(self):
        path=Path(self.temp.name)/'new-users.json';token=manage.add_user(path,'carol')
        self.assertNotIn(token,path.read_text());self.assertEqual(json.loads(path.read_text())['carol']['token_sha256'],hashlib.sha256(token.encode()).hexdigest())
        with self.assertRaises(ValueError):manage.add_user(path,'carol')
    def test_backup_is_consistent_sqlite(self):
        with db.scope('alice'):
            db.init();db.create('mizan','Backup',self.data(),'local',True,None);dest=manage.backup(Path(self.temp.name)/'backup')
        with sqlite3.connect(dest/db.DB.name) as c:self.assertEqual(c.execute('SELECT COUNT(*) FROM runs').fetchone()[0],1)

class ScheduleTests(StoreCase):
    def setUp(self):super().setUp();self.at=scheduling.timestamp('2026-11-14T15:00:00+00:00')
    def new(self,every=0,count=1):return scheduling.create('mizan','Scheduled',self.data(),'local',True,'2026-11-14T15:00:00+00:00',every,count)
    def test_once_persists_and_runs_once(self):
        self.new();self.assertEqual(scheduling.tick(self.at-1,submit=lambda _:None),[])
        created=scheduling.tick(self.at,submit=engine.execute);self.assertEqual(len(created),1);self.assertEqual(db.get(created[0])['status'],'completed')
        self.assertEqual(scheduling.tick(self.at+10,submit=engine.execute),[])
    def test_two_tickers_do_not_duplicate_occurrence(self):
        self.new()
        with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(lambda _:scheduling.tick(self.at,submit=lambda _:None),range(2)))
        self.assertEqual(sum(len(x) for x in results),1);self.assertEqual(len(db.recent('mizan')),1)
    def test_missed_periods_coalesce_and_count_is_finite(self):
        self.new(60,2);scheduling.tick(self.at+600,submit=engine.execute)
        schedule=scheduling.list_schedules('mizan')[0];self.assertEqual(schedule['remaining'],1);self.assertEqual(schedule['next_at'],self.at+660)
        scheduling.tick(self.at+660,submit=engine.execute);self.assertEqual(scheduling.list_schedules('mizan')[0]['enabled'],0)
    def test_submit_failure_does_not_lose_occurrence(self):
        self.new()
        with self.assertRaises(RuntimeError):scheduling.tick(self.at,submit=lambda _:(_ for _ in ()).throw(RuntimeError('crash')))
        self.assertEqual(len(db.recent('mizan')),1);scheduling.tick(self.at+1,submit=engine.execute)
        self.assertEqual(db.recent('mizan')[0]['status'],'completed')
    def test_disable_and_scope(self):
        with db.scope('alice'):db.init();schedule=self.new()
        with db.scope('bob'):db.init();self.assertFalse(scheduling.disable(schedule))
        with db.scope('alice'):self.assertTrue(scheduling.disable(schedule));self.assertEqual(scheduling.tick(self.at,submit=engine.execute),[])
    def test_final_recurring_occurrence_keeps_a_listable_timestamp(self):
        value='9999-12-31T23:30:00+00:00'
        at=scheduling.timestamp(value)
        scheduling.create('mizan','Scheduled',self.data(),'local',True,value,3600,1)
        created=scheduling.tick(at,submit=lambda _:None)
        self.assertEqual(len(created),1)
        row=scheduling.list_schedules('mizan')[0]
        self.assertEqual(row['enabled'],0)
        self.assertEqual(row['remaining'],0)
        self.assertEqual(row['next_at'],at)
        self.assertEqual(scheduling.tick(at+1,submit=lambda _:None),[])
    def test_concurrent_creation_preserves_active_schedule_limit(self):
        for _ in range(49):self.new()
        barrier=threading.Barrier(8)
        def attempt(_):
            barrier.wait()
            try:self.new();return True
            except ValueError as exc:
                self.assertIn('50 active schedules',str(exc));return False
        with ThreadPoolExecutor(max_workers=8) as pool:created=list(pool.map(attempt,range(8)))
        self.assertEqual(sum(created),1)
        self.assertEqual(sum(row['enabled'] for row in scheduling.list_schedules('mizan')),50)
    def test_utc_calendar_bounds_rejected_before_persistence(self):
        for value in ['0001-01-01T00:00:00+01:00','9999-12-31T23:59:00-01:00']:
            with self.subTest(value=value),self.assertRaisesRegex(ValueError,'UTC years'):
                scheduling.create('mizan','Scheduled',self.data(),'local',True,value)
        self.assertEqual(scheduling.list_schedules('mizan'),[])
        for value in ['0001-01-01T01:00:00+01:00','9999-12-31T22:00:00-01:00']:
            scheduling.create('mizan','Scheduled',self.data(),'local',True,value)
        self.assertEqual(len(scheduling.list_schedules('mizan')),2)
    def test_timezone_and_limits(self):
        with self.assertRaises(ValueError):scheduling.timestamp('2026-11-14T15:00:00')
        for every,count in [(1,1),(0,2),(60,101),(True,1)]:
            with self.assertRaises(ValueError):self.new(every,count)

class ImportTests(unittest.TestCase):
    def test_utf8_csv_and_preview(self):
        r=document_import.extract('dados.csv',base64.b64encode('categoria,valor\nalimentação,50'.encode()).decode())
        self.assertIn('alimentação | 50',r['text'])
    def test_csv_rejects_malformed_quoting_in_isolated_import(self):
        for raw in (b'item,amount\n"unfinished,10',b'item,amount\n"value"unexpected,10'):
            with self.subTest(raw=raw),self.assertRaisesRegex(ValueError,'Invalid CSV'):
                document_import.extract('records.csv',base64.b64encode(raw).decode())
    def test_csv_preserves_valid_quoted_commas_newlines_and_quotes(self):
        raw=b'item,notes\r\n"Travel, local","Line one\nLine two with ""quotes"""\r\n'
        result=document_import.extract('records.csv',base64.b64encode(raw).decode())
        self.assertIn('Travel, local | Line one\nLine two with "quotes"',result['text'])
    def test_docx_text(self):
        content=io.BytesIO()
        with zipfile.ZipFile(content,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Contrato de teste</w:t></w:r></w:p></w:body></w:document>')
        r=document_import.extract('test.docx',base64.b64encode(content.getvalue()).decode());self.assertEqual(r['text'],'Contrato de teste')
    def test_docx_preserves_inline_tabs_and_line_breaks(self):
        content=io.BytesIO()
        xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Amount</w:t><w:tab/><w:t>500 AED</w:t><w:br/><w:t>Due tomorrow</w:t></w:r><w:r><w:cr/><w:t>Reference A</w:t></w:r></w:p><w:p><w:r><w:t>Next paragraph</w:t></w:r></w:p></w:body></w:document>'
        with zipfile.ZipFile(content,'w') as z:z.writestr('word/document.xml',xml)
        result=document_import.extract('records.docx',base64.b64encode(content.getvalue()).decode())
        expected='Amount\t500 AED\nDue tomorrow\nReference A\nNext paragraph'
        self.assertEqual(result['text'],expected)
        self.assertEqual(result['provenance']['extracted_text_sha256'],hashlib.sha256(expected.encode()).hexdigest())
    def test_pdf_text_and_page_marker(self):
        try:from reportlab.pdfgen.canvas import Canvas
        except ImportError:self.skipTest('reportlab needed only to generate test fixture')
        content=io.BytesIO();c=Canvas(content);c.drawString(30,700,'Budget 500 AED');c.save()
        r=document_import.extract('test.pdf',base64.b64encode(content.getvalue()).decode());self.assertIn('[Page 1]',r['text']);self.assertIn('Budget 500 AED',r['text'])
    def test_empty_pdf_rejected(self):
        try:from pypdf import PdfWriter
        except ImportError:self.skipTest('pypdf absent')
        pdf=PdfWriter();pdf.add_blank_page(300,300);content=io.BytesIO();pdf.write(content)
        with self.assertRaisesRegex(ValueError,'no extractable text'):document_import.extract('blank.pdf',base64.b64encode(content.getvalue()).decode())
    def test_invalid_formats_base64_and_limits(self):
        for name,data in [('bad.exe',b'bin'),('bad.pdf',b'notpdf'),('bad.txt',b'\x00')]:
            with self.assertRaises(ValueError):document_import.extract(name,base64.b64encode(data).decode())
        with self.assertRaises(ValueError):document_import.extract('x.txt','!invalid')
        with self.assertRaises(ValueError):document_import.parse(b'x'*2000001,'.txt')
    def test_docx_entities_rejected(self):
        content=io.BytesIO()
        with zipfile.ZipFile(content,'w') as z:z.writestr('word/document.xml','<!DOCTYPE x><x/>')
        with self.assertRaisesRegex(ValueError,'XML entities'):document_import.parse(content.getvalue(),'.docx')

class ConnectorTests(StoreCase):
    def config(self):
        cfg={'finance':{'url':'https://api.example.com/snapshot','users':['alice'],'agents':['mizan'],'json_pointer':'/data'}}
        path=Path(self.temp.name)/'connectors.json';path.write_text(json.dumps(cfg));os.environ['APP_CONNECTORS_FILE']=str(path);return cfg
    def test_authorized_read_validates_schema_and_receipt(self):
        self.config()
        with db.scope('alice'):
            db.init()
            with patch('connectors.fetch_json',return_value={'data':self.data()}):r=connectors.pull('finance','mizan',engine.SPECS['mizan'])
            self.assertEqual(r['receipt']['input_hash'],db.digest(self.data()));self.assertTrue(r['receipt']['read_only']);self.assertNotIn('url',r['receipt'])
        with db.scope('bob'):
            self.assertEqual(connectors.allowed('mizan'),[])
            with self.assertRaises(PermissionError):connectors.pull('finance','mizan',engine.SPECS['mizan'])
    def test_bad_snapshot_does_not_get_receipt(self):
        self.config()
        with db.scope('alice'):
            db.init()
            with patch('connectors.fetch_json',return_value={'data':{}}):
                with self.assertRaises(ValueError):connectors.pull('finance','mizan',engine.SPECS['mizan'])
    def test_connector_rejects_duplicate_json_fields_and_closes_connection(self):
        conn=MagicMock();response=conn.getresponse.return_value;response.status=200
        response.getheader.return_value='application/json';response.read.return_value=b'{"data":{"amount":10,"amount":99}}'
        with patch('connectors.public_addresses',return_value=['8.8.8.8']),patch('connectors.PinnedHTTPS',return_value=conn):
            with self.assertRaisesRegex(ValueError,'duplicate keys'):connectors.fetch_json({'url':'https://example.com/snapshot'})
        conn.close.assert_called_once()
    def test_private_and_mixed_dns_rejected(self):
        for addresses in [['127.0.0.1'],['10.0.0.1'],['169.254.169.254'],['::1'],['8.8.8.8','192.168.1.1']]:
            with patch('socket.getaddrinfo',return_value=[(2,1,6,'',(ip,443)) for ip in addresses]):
                with self.assertRaises(ValueError):connectors.public_addresses('example.com')
    def test_redirect_and_response_size_rejected(self):
        for status,body in [(302,b'{}'),(200,b'x'*(connectors.MAX_BYTES+1))]:
            conn=MagicMock();response=conn.getresponse.return_value;response.status=status;response.getheader.return_value='application/json';response.read.return_value=body
            with patch('connectors.public_addresses',return_value=['8.8.8.8']),patch('connectors.PinnedHTTPS',return_value=conn):
                with self.assertRaises(ValueError):connectors.fetch_json({'url':'https://example.com/snapshot'})
    def test_only_fixed_https_urls(self):
        for url in ['http://example.com','https://x:y@example.com','https://example.com:444','file:///etc/passwd']:
            with self.assertRaises(ValueError):connectors.fetch_json({'url':url})
    def test_transport_get_only_and_secret_not_in_output(self):
        conn=MagicMock();response=conn.getresponse.return_value;response.status=200;response.getheader.return_value='application/json';response.read.return_value=b'{"data":42}'
        with patch.dict(os.environ,{'CONNECTOR_TEST_TOKEN':'dummy-secret'}),patch('connectors.public_addresses',return_value=['8.8.8.8']),patch('connectors.PinnedHTTPS',return_value=conn):
            r=connectors.fetch_json({'url':'https://example.com/snapshot','token_env':'CONNECTOR_TEST_TOKEN'})
        self.assertEqual(r,{'data':42});self.assertEqual(conn.request.call_args.args[0],'GET');self.assertTrue(conn.close.called)
    def test_json_pointer_rejects_invalid_types_and_escapes(self):
        data={'~2':'invalid escape','~':'literal tilde','':'empty key','~1':'literal sequence'}
        for path in (None,False,0,[],{},'/~2','/~','/~01~2'):
            with self.subTest(path=path),self.assertRaises(ValueError):connectors.pointer(data,path)
        self.assertIs(connectors.pointer(data,''),data)
        self.assertEqual(connectors.pointer(data,'/'),'empty key')
        self.assertEqual(connectors.pointer(data,'/~0'),'literal tilde')
        self.assertEqual(connectors.pointer(data,'/~01'),'literal sequence')
    def test_invalid_pointer_cannot_create_a_success_receipt(self):
        cfg={'url':'https://example.com/data','users':['alice'],'agents':['mizan'],'json_pointer':False}
        with db.scope('alice'):
            db.init()
            with patch('connectors.configured',return_value={'finance':cfg}),patch('connectors.fetch_json',return_value=self.data()):
                with self.assertRaisesRegex(ValueError,'must be a string'):connectors.pull('finance','mizan',engine.SPECS['mizan'])
            with db.connect() as connection:
                self.assertIsNone(connection.execute("SELECT name FROM sqlite_master WHERE name='connector_receipts'").fetchone())
    def test_json_pointer_rejects_noncanonical_array_indexes(self):
        data={'rows':['first','second']}
        for token in ('-1','01','+1',' 1','1 ','-','1.0',''):
            with self.subTest(token=token),self.assertRaises(ValueError):
                connectors.pointer(data,'/rows/'+token)
        self.assertEqual(connectors.pointer(data,'/rows/0'),'first')
        self.assertEqual(connectors.pointer(data,'/rows/1'),'second')
        self.assertEqual(connectors.pointer({'-1':'literal key','01':'another key'},'/-1'),'literal key')
        self.assertEqual(connectors.pointer({'01':'another key'},'/01'),'another key')
    def test_json_pointer_escaping(self):self.assertEqual(connectors.pointer({'a/b':[{'~x':3}]},'/a~1b/0/~0x'),3)

class TenantHTTPTests(StoreCase):
    def setUp(self):
        super().setUp();self.http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler);self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start();self.base=f'http://127.0.0.1:{self.http.server_port}'
    def tearDown(self):self.http.shutdown();self.http.server_close();self.thread.join();super().tearDown()
    def request(self,path,user='alice',method='GET',data=None):
        req=Request(self.base+path,method=method,data=json.dumps(data).encode() if data is not None else None,
          headers={'Content-Type':'application/json','Authorization':'Bearer '+user+'-token','X-User':'bob'})
        try:
            with urlopen(req) as r:return r.status,json.load(r)
        except HTTPError as e:return e.code,json.load(e)
    def test_run_uuid_and_all_mutation_routes_are_isolated(self):
        with patch('server.submit',side_effect=engine.execute):status,run=self.request('/api/agents/mizan/runs',method='POST',data={'goal':'A','input':self.data(),'example':True})
        self.assertEqual(status,202)
        for suffix,method in [('', 'GET'),('/export','GET'),('/cancel','POST'),('/retry','POST'),('/review','POST')]:
            self.assertEqual(self.request('/api/runs/'+run['id']+suffix,'bob',method,{} if method=='POST' else None)[0],404)
        self.assertEqual(self.request('/api/me')[1]['user'],'alice')
    def test_document_and_schedule_isolation(self):
        _,doc=self.request('/api/agents/mizan/documents',method='POST',data={'title':'A','text':'private budget','source':'s','as_of':''})
        self.assertEqual(self.request('/api/agents/mizan/search','bob','POST',{'query':'budget'})[1]['matches'],[])
        self.assertFalse(self.request('/api/agents/mizan/documents/'+doc['id'],'bob','DELETE')[1]['deleted'])
        _,schedule=self.request('/api/agents/mizan/schedules',method='POST',data={'goal':'A','input':self.data(),'first_at':'2027-01-01T12:00:00+00:00'})
        self.assertFalse(self.request('/api/schedules/'+schedule['id']+'/disable','bob','POST',{})[1]['disabled'])
    def test_invalid_token_and_preview(self):
        self.assertEqual(self.request('/api/agents','bad')[0],401)
        status,result=self.request('/api/import/preview',method='POST',data={'filename':'data.txt','base64':base64.b64encode(b'Budget 500').decode()})
        self.assertEqual(status,200);self.assertEqual(result['text'],'Budget 500')

if __name__=='__main__':unittest.main(verbosity=2)
