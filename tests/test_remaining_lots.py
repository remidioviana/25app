"""Controlled fixtures for every remaining app; not live model acceptance."""
from pathlib import Path
import json
import os
import tempfile
import unittest
from unittest.mock import patch
import advanced
import agent_runtime as engine
import source_tools as sources
import storage as db
import exports
from scripts.verify_remaining_portfolio import controlled_role

@unittest.skipUnless(advanced.available(),'LangGraph is not installed')
class RemainingLotTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.old=db.DB;self.addCleanup(setattr,db,'DB',self.old)
  db.DB=Path(self.temp.name)/'test.sqlite3';db.init()
  self.env=patch.dict(os.environ,{'AGENT_REQUIRE_DISTINCT_MODELS':'0','AGENT_SEMANTIC_SEARCH':'0'});self.env.start();self.addCleanup(self.env.stop)
 def source(self,agent):
  choices=sources.available(agent)
  return next((x for x in choices if agent=='gurbah' and x['id']=='dewa-move-in'),choices[0])
 def fixture(self,cfg):
  anchors=cfg.get('anchors',['move-in','activation'])
  if cfg['kind']=='pdf':
   from io import BytesIO
   from pypdf import PdfWriter
   from pypdf.generic import DictionaryObject,NameObject,DecodedStreamObject
   writer=PdfWriter();page=writer.add_blank_page(width=612,height=792)
   font=DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})
   page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):font})})
   stream=DecodedStreamObject();stream.set_data(('BT /F1 12 Tf 20 700 Td ('+(' '.join(anchors)+' controlled transport fixture. ')*15+') Tj ET').encode())
   page[NameObject('/Contents')]=stream;output=BytesIO();writer.write(output)
   return output.getvalue(),{'charset':'utf-8','http_status':200,'content_type':'application/pdf','last_modified_header':None}
  raw=('<main><h1>Controlled fixture</h1><p>'+(' '.join(anchors)+' controlled official-source transport fixture. ')*15+'</p></main>').encode()
  return raw,{'charset':'utf-8','http_status':200,'content_type':'text/html','last_modified_header':None}
 def test_all_twenty_sources_graphs_final_resolution_and_exports(self):
  products=json.loads((Path(__file__).resolve().parents[1]/'project/portfolio.json').read_text())['products'][5:]
  for product in products:
   agent=product['id']
   with self.subTest(agent=agent):
    chosen=self.source(agent)
    with patch.object(sources,'fetch',side_effect=self.fixture):receipt=sources.refresh(chosen['id'],agent)['receipt']
    run,_=db.create(agent,product['primary_task']+' '+ ' '.join(sources.CATALOG[chosen['id']].get('anchors',['activation'])),engine.SPECS[agent]['example'],'team',True,None)
    contexts=[]
    def controlled(name,schema,context,instructions):
     if name=='critic':contexts.append(context)
     return controlled_role(name,schema,context,instructions)
    with patch.object(advanced,'role',side_effect=controlled):engine.execute(run)
    saved=db.get(run);self.assertEqual(saved['status'],'completed',saved['error'])
    self.assertEqual(saved['result']['decision'],'inconclusive')
    self.assertFalse(saved['result']['external_actions_performed'])
    self.assertFalse(saved['result']['external_reads_performed'])
    self.assertTrue(all(x['fetched_in_this_run'] is False for x in saved['result']['source_reads']))
    self.assertEqual(len(saved['result']['usage']),4)
    self.assertTrue(all(c['source_reads'][0]['source_scope']==receipt['source_scope'] for c in contexts))
    report=exports.export(saved,'markdown').content.decode()
    self.assertIn(receipt['raw_sha256'],report);self.assertIn(receipt['source_scope'],report)
 def test_every_app_has_a_fixed_https_source_and_new_sources_are_app_scoped(self):
  for agent in engine.SPECS:
   self.assertTrue(sources.available(agent),agent)
   self.assertTrue(all(x['url'].startswith('https://') for x in sources.available(agent)))
  for source_id,cfg in sources.CATALOG.items():
   if 'himayah' not in cfg['agents']:
    with self.subTest(source=source_id),patch.object(sources,'fetch') as fetch:
     with self.assertRaises(PermissionError):sources.refresh(source_id,'himayah')
     fetch.assert_not_called()
 def test_unrelated_content_cannot_validate_new_source(self):
  with patch.object(sources,'fetch',return_value=(('<main><p>'+'unrelated content '*30+'</p></main>').encode(),{'charset':'utf-8','http_status':200,'content_type':'text/html'})):
   with self.assertRaisesRegex(ValueError,'anchors'):sources.refresh('who-stress-guide','nafas')
  self.assertEqual(db.documents('nafas'),[])
  self.assertEqual(sources.receipts('nafas')[0]['status'],'failed')
