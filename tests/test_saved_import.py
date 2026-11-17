"""Saved imports keep provenance through retrieval, isolation and deletion."""
import base64
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import document_import
import retrieval
import storage as db

class SavedImportTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.old=db.DB;self.addCleanup(setattr,db,'DB',self.old)
  db.DB=Path(self.temp.name)/'db.sqlite3';db.init()
  self.receipt=document_import.extract('clause.txt',base64.b64encode(b'Controlled clause text').decode())['provenance']
 def test_receipt_persists_across_reinit_and_is_deleted_with_document(self):
  doc=db.ingest('himayah','Clause','Controlled clause text','fixture','',import_receipt=self.receipt)
  db.init()
  self.assertEqual(db.documents('himayah')[0]['import_provenance'],self.receipt)
  self.assertEqual(db.search('himayah','clause')[0]['import_provenance'],self.receipt)
  self.assertEqual(db.documents('iqamah'),[])
  self.assertTrue(db.delete_document('himayah',doc['id']))
  with db.connect() as connection:self.assertEqual(connection.execute('SELECT COUNT(*) FROM document_imports').fetchone()[0],0)
 def test_semantic_only_retrieval_preserves_receipt_and_tenant_isolation(self):
  with db.scope('alice'):
   db.init();db.ingest('himayah','Clause','Controlled clause text','fixture','',import_receipt=self.receipt)
   with patch.dict(os.environ,{'OPENAI_EMBEDDING_MODEL':'controlled-embedding'}),patch('model_provider.embed',return_value=[[1.,0.]]):
    retrieval.index('himayah')
    result=retrieval.search('himayah','unmatchedconcept',True)
   self.assertEqual(result['matches'][0]['import_provenance'],self.receipt)
  with db.scope('bob'):
   db.init();self.assertEqual(db.documents('himayah'),[])
   with db.connect() as connection:self.assertEqual(connection.execute('SELECT COUNT(*) FROM document_imports').fetchone()[0],0)
