"""Literal screening evidence must remain reproducible and bounded."""
import hashlib
import unittest
from domain_tools import contract

class ContractProvenanceTests(unittest.TestCase):
 def rule(self,phrase,required=False):return {'label':'supplied rule','phrase':phrase,'required':required}
 def test_unicode_offsets_and_quote_offsets_reproduce_original_text(self):
  text='😀 cláusula: SHARE DATA. Privacy terms.'
  result=contract({'text':text,'rules':[self.rule('share data')]})
  hit=result['findings'][0]['matches'][0]
  self.assertEqual(text[hit['start']:hit['end']],'SHARE DATA')
  self.assertEqual(text[hit['quote_start']:hit['quote_end']],hit['quote'])
  self.assertTrue(hit['quote_contains_entire_match'])
  self.assertEqual(result['input_text_sha256'],hashlib.sha256(text.encode()).hexdigest())
  self.assertEqual(result['offset_unit'],'unicode_code_points')
 def test_rule_limits_do_not_convert_found_match_into_missing_requirement(self):
  result=contract({'text':'x '*1000,'rules':[self.rule('x',True) for _ in range(12)]})
  self.assertEqual(sum(len(x['matches']) for x in result['findings']),1000)
  self.assertTrue(all(x['match_found'] for x in result['findings']))
  self.assertTrue(all(not x['flagged'] for x in result['findings']))
  self.assertTrue(all(x['matches_truncated'] for x in result['findings']))
  self.assertEqual(result['findings'][-1]['matches'],[])
 def test_large_phrase_bounds_quote_without_misrepresenting_its_span(self):
  text='a'*10000
  result=contract({'text':text,'rules':[self.rule(text)]})
  hit=result['findings'][0]['matches'][0]
  self.assertEqual(hit['end'],10000);self.assertEqual(len(hit['quote']),600)
  self.assertFalse(hit['quote_contains_entire_match'])
  self.assertEqual(hit['quote'],text[hit['quote_start']:hit['quote_end']])
 def test_empty_and_whitespace_phrases_are_rejected_and_regex_is_literal(self):
  for phrase in ('',' \n '):
   with self.subTest(phrase=phrase),self.assertRaises(ValueError):contract({'text':'terms','rules':[self.rule(phrase)]})
  result=contract({'text':'acb','rules':[self.rule('a.b',True)]})
  self.assertFalse(result['findings'][0]['match_found']);self.assertTrue(result['findings'][0]['flagged'])
