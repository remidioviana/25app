"""A follow-up retrieval must reach the writer without requiring manual review."""
from pathlib import Path
import os
import tempfile
import unittest
from unittest.mock import patch
import advanced
import agent_runtime as engine
import storage as db

@unittest.skipUnless(advanced.available(),'LangGraph is not installed')
class FollowupContextTests(unittest.TestCase):
 def test_new_targeted_passage_displaces_old_context_and_closes_review(self):
  old=db.DB
  try:
   with tempfile.TemporaryDirectory() as directory:
    db.DB=Path(directory)/'test.sqlite3';db.init()
    db.ingest('mizan','Initial','initial budget overview','controlled fixture','')
    target=db.ingest('mizan','Target','specific reimbursement evidence','controlled fixture','')
    writes=[];reviews=0
    def role(name,schema,context,instructions):
     nonlocal reviews
     if name=='planner':value={'objective':'Find the specific evidence','queries':['initial'],'steps':['Analyze'],'missing_information':[]}
     elif name=='specialist':
      writes.append([x['citation'] for x in context['evidence']])
      item=context['evidence'][0]
      value={'summary':'Controlled evidence analysis','claims':[{'text':item['text'],'basis':'evidence','citations':[item['citation']]}],'next_steps':[]}
     else:
      reviews+=1;found=any(x['doc']==target['id'] for x in context['evidence'])
      value={'verdict':'accept' if found else 'needs_evidence','issues':[] if found else ['Retrieve the specific reimbursement evidence'],'follow_up_queries':[] if found else ['reimbursement']}
     return value,{'total_tokens':7}
    run,_=db.create('mizan','Controlled diagnostic',engine.SPECS['mizan']['example'],'team',True,None)
    with patch.dict(os.environ,{'AGENT_MAX_EVIDENCE_PASSAGES':'1'}),patch.object(advanced,'role',side_effect=role):engine.execute(run)
    record=db.get(run);self.assertEqual(record['status'],'completed',record['error'])
    self.assertEqual(record['result']['decision'],'reviewed_by_model');self.assertEqual(reviews,2)
    self.assertNotEqual(writes[0],writes[1]);self.assertTrue(writes[1][0].startswith(target['id']))
    self.assertEqual(len(record['result']['evidence']),2)
    self.assertEqual(len(record['result']['usage']),5)
  finally:db.DB=old
