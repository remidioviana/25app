"""Backend dossier checks must preserve the native distinction and reject ambiguity."""
import copy
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import storage as db
import agent_runtime as engine
from domain_tools import checklist,day

class DossierConsistencyTests(unittest.TestCase):
 def base(self):return {'as_of':'2026-11-16','requirements':['absent','old','today','unknown'],
    'documents':[{'name':'old','expires':'2026-11-15','reference':'old.pdf:1'},
                 {'name':'today','expires':'2026-11-16','reference':'today.pdf:2'},
                 {'name':'unknown','expires':'','reference':''}]}
 def test_missing_expired_and_unknown_remain_separate(self):
  result=checklist(self.base())
  self.assertEqual(result['counts'],{'missing':1,'expired':1,'present_unverified':2})
  self.assertEqual(result['missing'],['absent']);self.assertEqual(result['expired'],['old'])
  self.assertEqual(result['requires_attention'],['absent','old'])
  self.assertEqual(result['checks'][2]['status'],'present_unverified')
  self.assertIsNone(result['checks'][3]['expires']);self.assertEqual(result['checks'][3]['reference'],'')
 def test_duplicate_names_are_not_silently_overwritten(self):
  value=self.base();value['documents'].append({'name':'old','expires':'2028-01-01','reference':'new.pdf:1'})
  with self.assertRaisesRegex(ValueError,'duplicate document'):checklist(value)
  value=self.base();value['requirements'].append('old')
  with self.assertRaisesRegex(ValueError,'duplicate checklist'):checklist(value)
 def test_empty_checklists_and_blank_names_are_rejected(self):
  for change in ('empty','blank_requirement','blank_document'):
   value=self.base()
   if change=='empty':value['requirements']=[]
   if change=='blank_requirement':value['requirements'][0]=' '
   if change=='blank_document':value['documents'][0]['name']=' '
   with self.subTest(change=change),self.assertRaises(ValueError):checklist(value)
 def test_dates_reject_basic_week_datetime_normalized_and_invalid_leap_forms(self):
  for value in ('20261116','2026-W47-1','2026-11-16T00:00:00Z','2026-02-30','1900-02-29','0000-01-01','2026-1-01'):
   with self.subTest(value=value),self.assertRaises(ValueError):day(value)
  self.assertEqual(day('2000-02-29').isoformat(),'2000-02-29')
 def test_matching_is_exact_and_original_data_is_unchanged(self):
  value=self.base();value['documents'][0]['name']='OLD';original=copy.deepcopy(value)
  result=checklist(value);self.assertIn('old',result['missing']);self.assertEqual(value,original)
 def test_team_rejects_ambiguous_dossier_before_provider_request(self):
  old=db.DB
  try:
   with tempfile.TemporaryDirectory() as directory:
    db.DB=Path(directory)/'test.sqlite3';db.init()
    for app in ('iqamah','sahil'):
     value=self.base();value['documents']*=2
     run,_=db.create(app,'Controlled diagnostic',value,'team',True,None)
     with patch('model_provider.respond') as provider:engine.execute(run);provider.assert_not_called()
     result=db.get(run);self.assertEqual(result['status'],'failed');self.assertIn('duplicate document',result['error'])
  finally:db.DB=old
