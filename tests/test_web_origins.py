import json,os,tempfile,threading,unittest
from pathlib import Path
from unittest.mock import patch
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer
import server,storage
class WebOriginTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.patches=[patch.dict(os.environ,{'APP_ALLOWED_WEB_ORIGINS':'https://review.example,http://localhost:8091','APP_USERS_FILE':''}),patch.object(server,'TOKEN','controlled-test-token'),patch.object(storage,'DB',Path(self.temp.name)/'db.sqlite3')]
  for p in self.patches:p.start()
  self.http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler);self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start();self.base='http://127.0.0.1:'+str(self.http.server_port)
 def tearDown(self):
  self.http.shutdown();self.http.server_close();self.thread.join()
  for p in reversed(self.patches):p.stop()
  self.temp.cleanup()
 def request(self,path,method='GET',headers=None):
  try:r=urlopen(Request(self.base+path,method=method,headers=headers or {}),timeout=5)
  except HTTPError as e:r=e
  return r.status,dict(r.headers),r.read()
 def test_exact_approved_preflight_succeeds_without_bypassing_actual_request_authentication(self):
  code,h,body=self.request('/api/agents/himayah/documents','OPTIONS',{'Origin':'https://review.example','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type,idempotency-key'})
  self.assertEqual(code,204);self.assertEqual(body,b'');self.assertEqual(h['Access-Control-Allow-Origin'],'https://review.example');self.assertEqual(h['Vary'],'Origin');self.assertNotIn('Access-Control-Allow-Credentials',h)
  code,h,_=self.request('/api/me',headers={'Origin':'https://review.example'});self.assertEqual(code,401)
  code,h,raw=self.request('/api/me',headers={'Origin':'https://review.example','Authorization':'Bearer controlled-test-token','Sec-Fetch-Site':'cross-site'});self.assertEqual(code,200);self.assertEqual(json.loads(raw)['user'],'default')
 def test_unapproved_origin_suffix_spoof_and_unapproved_headers_stay_blocked(self):
  for origin in ['https://review.example.attacker.invalid','https://attacker.invalid','null']:
   code,h,_=self.request('/api/config',headers={'Origin':origin});self.assertEqual(code,403);self.assertNotIn('Access-Control-Allow-Origin',h)
  code,_,_=self.request('/api/me','OPTIONS',{'Origin':'https://review.example','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'x-unapproved'});self.assertEqual(code,403)
 def test_default_is_same_origin_and_invalid_configuration_does_not_enable_wildcards(self):
  with patch.dict(os.environ,{'APP_ALLOWED_WEB_ORIGINS':'*,https://user:password@review.example,https://review.example/path,http://public.example,https://review.example?query=1'}):
   self.assertEqual(server.allowed_web_origins(),set());code,h,_=self.request('/api/config',headers={'Origin':'https://review.example'});self.assertEqual(code,403);self.assertNotIn('Access-Control-Allow-Origin',h)
  with patch.dict(os.environ,{'APP_ALLOWED_WEB_ORIGINS':''}):
   code,_,_=self.request('/api/config',headers={'Origin':self.base});self.assertEqual(code,200)
