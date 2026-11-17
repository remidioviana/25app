"""Public startup briefings never borrow customer facts or foreign citations."""
import copy,unittest
from scripts.build_public_intelligence import validate_public_answer
class PublicIntelligenceValidationTests(unittest.TestCase):
 def answer(self):return {'outcome':'answered','draft':{'summary':'A bounded public reading.','claims':[{'text':'A published source fact.','basis':'evidence','citations':['official:public-0']}],'next_steps':['Check the source for the chosen route.']},'questions':[],'limitations':[]}
 def test_supported_public_claim_keeps_the_citation_and_outcome(self):
  a=self.answer();self.assertEqual(validate_public_answer(a,'official:public-0'),a)
 def test_no_personal_input_or_foreign_evidence_can_be_presented_as_public_intelligence(self):
  for kind in ('foreign','input','empty','summary'):
   a=self.answer()
   if kind=='foreign':a['draft']['claims'][0]['citations']=['another-app:0']
   if kind=='input':a['draft']['claims'][0]['basis']='input'
   if kind=='empty':a['draft']['claims']=[]
   if kind=='summary':a['draft']['summary']=' '
   with self.subTest(kind=kind),self.assertRaises(ValueError):validate_public_answer(a,'official:public-0')
 def test_limitations_are_not_promoted_to_an_unqualified_answer(self):
  a=self.answer();a['limitations']=['Current legal applicability was not established.'];out=validate_public_answer(copy.deepcopy(a),'official:public-0');self.assertEqual(out['outcome'],'inconclusive');self.assertEqual(out['limitations'],a['limitations'])

class PublicIntelligenceFeedTests(unittest.TestCase):
 def test_public_feed_is_read_only_and_does_not_expose_private_api_without_authorization(self):
  import json,threading,urllib.request,urllib.error
  from http.server import ThreadingHTTPServer
  from unittest.mock import patch
  import server
  http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler);thread=threading.Thread(target=http.serve_forever,daemon=True);thread.start()
  try:
   origin='http://127.0.0.1:'+str(http.server_port)
   with patch.object(server,'TOKEN','test-only-protected-workspace'):
    req=urllib.request.Request(origin+'/public/intelligence.json',headers={'Origin':'https://public-reader.example'})
    with urllib.request.urlopen(req) as response:
     body=json.load(response);self.assertEqual(response.headers.get('Access-Control-Allow-Origin'),'*');self.assertIn('himayah',body);self.assertTrue(set(body)<=set(server.SPECS));self.assertNotIn('test-only-protected-workspace',json.dumps(body))
    for path,method,expected in [('/api/agents','GET',401),('/public/intelligence.json','POST',405)]:
     with self.assertRaises(urllib.error.HTTPError) as caught:urllib.request.urlopen(urllib.request.Request(origin+path,method=method))
     self.assertEqual(caught.exception.code,expected)
  finally:http.shutdown();http.server_close();thread.join()
