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
