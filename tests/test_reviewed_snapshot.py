"""Snapshot provenance and scope checks; no external source or model calls."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import storage as db
import source_tools
from scripts import reviewed_snapshot as snapshots

class ReviewedSnapshotTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.old=db.DB;self.addCleanup(setattr,db,'DB',self.old)
  db.DB=Path(self.temp.name)/'test.sqlite3';db.init()
  self.path=Path(self.temp.name)/'snapshot.json'
  text='Controlled personal data snapshot. '*10
  self.value={'snapshot_version':1,'text':text,'receipt':{'source_id':'uae-pdpl','url':source_tools.CATALOG['uae-pdpl']['url'],
     'status':'retrieved','http_status':200,'characters':len(text),'text_sha256':hashlib.sha256(text.encode()).hexdigest(),
     'raw_sha256':'a'*64,'fetched_at':'2026-01-01T00:00:00+00:00'}}
  mapping=patch.dict(snapshots.SNAPSHOTS,{'uae-pdpl':self.path});mapping.start();self.addCleanup(mapping.stop)
 def write(self,value=None):self.path.write_text(json.dumps(value or self.value))
 def test_import_preserves_old_acquisition_without_network_or_publication_claim(self):
  self.write()
  with patch.object(source_tools,'fetch') as network:result=snapshots.ingest('uae-pdpl','himayah');network.assert_not_called()
  receipt=result['receipt'];self.assertEqual(receipt['status'],'imported_reviewed_snapshot')
  self.assertEqual(receipt['original_fetched_at'],'2026-01-01T00:00:00+00:00')
  self.assertFalse(receipt['external_read']);self.assertFalse(receipt['fresh_source_fetch_verified'])
  self.assertFalse(receipt['publication_date_verified']);self.assertFalse(receipt['legal_applicability_verified'])
  evidence=db.search('himayah','personal data');self.assertTrue(evidence)
  self.assertEqual(evidence[0]['retrieved_at'],'2026-01-01T00:00:00+00:00')
  self.assertEqual(db.search('iqamah','personal data'),[]);self.assertEqual(db.documents('himayah')[0]['as_of'],'')
 def test_tampering_wrong_origin_and_future_or_naive_time_are_rejected(self):
  for change in ['text','url','source','future','naive']:
   value=copy.deepcopy(self.value)
   if change=='text':value['text']+='tampered'
   if change=='url':value['receipt']['url']='https://unapproved.invalid/legal'
   if change=='source':value['receipt']['source_id']='dewa-move-in'
   if change=='future':value['receipt']['fetched_at']='2999-01-01T00:00:00+00:00'
   if change=='naive':value['receipt']['fetched_at']='2026-01-01T00:00:00'
   self.write(value)
   with self.subTest(change=change),self.assertRaises(ValueError):snapshots.ingest('uae-pdpl','himayah')
   self.assertEqual(db.documents('himayah'),[])
 def test_snapshot_cannot_replace_existing_app_evidence_or_cross_scope(self):
  self.write();db.ingest('himayah','Existing','Existing source text','existing','')
  with self.assertRaisesRegex(ValueError,'never replaced'):snapshots.ingest('uae-pdpl','himayah')
  with self.assertRaises(PermissionError):snapshots.ingest('uae-pdpl','iqamah')
  self.assertEqual(len(db.documents('himayah')),1)

 def test_snapshot_runs_actual_graph_retrieval_with_controlled_model_roles(self):
  import advanced
  if not advanced.available():self.skipTest('LangGraph is not installed')
  import agent_runtime as engine
  from domain_tools import TOOLS
  from scripts.verify_team import assess
  self.write();snapshots.ingest('uae-pdpl','himayah')
  def role(name,schema,context,instructions):
   if name=='planner':value={'objective':'Controlled diagnostic','queries':['personal data'],'steps':['Analyze'],'missing_information':[]}
   elif name=='specialist':value={'summary':'Controlled snapshot diagnostic','claims':[{'text':'Controlled personal data snapshot.','basis':'evidence','citations':[context['evidence'][0]['citation']]}],'next_steps':[]}
   else:value={'verdict':'accept','issues':[],'follow_up_queries':[]}
   return value,{'provider_reported_model':name+'-test','total_tokens':7}
  data=engine.SPECS['himayah']['example'];run,_=db.create('himayah','Diagnostic',data,'team',True,None)
  with patch.object(advanced,'role',side_effect=role),patch.object(source_tools,'fetch') as network:
   engine.execute(run);network.assert_not_called()
  record=db.get(run);self.assertEqual(record['status'],'completed',record['error'])
  row=assess(record['result'],data,TOOLS['himayah'](data));self.assertTrue(row['graph_rag_diagnostic_verified'])
  self.assertFalse(row['primary_domain_workflow_verified'])
