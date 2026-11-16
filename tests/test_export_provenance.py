"""Offline tests for preservation of saved agent results during report export."""
import unittest
import exports

class ExportProvenanceTests(unittest.TestCase):
    def run_data(self):
        return {'id':'run-id','agent':'mizan','status':'completed','example':False,'goal':'Inspect supplied data',
                'review':'pending','result':{'analysis':{},'analysis_hash':'saved-hash','external_actions_performed':False}}

    def test_team_claims_routing_and_warnings_survive_export(self):
        run=self.run_data();run['result'].update({
            'draft':{'summary':'Summary','claims':[{'text':'Recorded claim','basis':'evidence','citations':['doc:0']}],'next_steps':['Check source']},
            'usage':[{'role':'critic','usage':{'model':'llama-3.3-70b-versatile','requested_model':'openai/gpt-oss-120b','fallback':True,'fallback_reason':'all_keys_http_429','total_tokens':32}}],
            'critique':{'verdict':'revise','issues':['Unresolved']},'decision':'requires_human_review',
            'retrieval_warnings':['No vector search'],'evidence':[{'title':'Source','citation':'doc:0','source':'Supplied','as_of':'','text':'Saved excerpt'}]})
        text=exports.export(run,'markdown').content.decode()
        for expected in ['Recorded claim','doc:0','Saved excerpt','Check source','openai/gpt-oss-120b','llama-3.3-70b-versatile','all_keys_http_429','requires_human_review','pending','No vector search','saved-hash']:
            self.assertIn(expected,text)

    def test_local_export_does_not_invent_model_execution(self):
        text=exports.export(self.run_data(),'markdown').content.decode()
        self.assertNotIn('Recorded model routing',text)
        self.assertNotIn('Structured claims',text)
        self.assertIn('not_recorded',text)
        self.assertIn('No external action was performed.',text)

    def test_provider_metadata_allowlist(self):
        run=self.run_data();run['result']['usage']=[None,{'role':'critic','usage':{'model':'test-model','authorization':'fictional-sensitive-value','raw_response':'not-for-export'}}]
        text=exports.export(run,'markdown').content.decode()
        self.assertIn('test-model',text)
        self.assertNotIn('fictional-sensitive-value',text)
        self.assertNotIn('not-for-export',text)

    def test_json_fences_cannot_be_closed_by_embedded_backticks(self):
        lines=exports.json_section('Claims',{'text':'``` and ```` within a value'})
        self.assertEqual(lines[2],'`````json')
        self.assertEqual(lines[-2],'`````')

    def test_unknown_or_true_external_action_status_is_not_reported_as_false(self):
        for value in (None,True):
            run=self.run_data();run['result']['external_actions_performed']=value
            text=exports.export(run,'markdown').content.decode()
            self.assertNotIn('No external action was performed.',text)
            self.assertIn('External-action status:',text)

    def test_claim_links_preserve_exact_passage_and_expose_missing_references(self):
        result={'draft':{'claims':[
            {'text':'Model assertion','basis':'evidence','citations':['doc:0','missing:1']},
            {'text':'User statement','basis':'input','citations':[]}]},
            'evidence':[{'citation':'doc:0','doc':'doc','chunk':0,'title':'Agreement clause','text':'Exact recorded clause.','source':'Uploaded agreement',
                         'as_of':'2026-01-01','authorization':'must-not-export'}]}
        links=exports.claim_evidence_links(result)
        self.assertEqual(links[0]['passages'][0]['text'],'Exact recorded clause.')
        self.assertTrue(links[0]['passages'][0]['recorded_passage_found'])
        self.assertEqual(links[0]['passages'][1],{'citation':'missing:1','recorded_passage_found':False})
        self.assertFalse(links[0]['factual_support_verified'])
        self.assertEqual(links[1]['passages'],[])
        self.assertNotIn('authorization',links[0]['passages'][0])
        run=self.run_data();run['result'].update(result)
        text=exports.export(run,'markdown').content.decode()
        self.assertIn('Claim-to-passage traceability',text)
        self.assertIn('missing:1',text)
        self.assertNotIn('must-not-export',text)

    def test_passage_fingerprint_tracks_unicode_text_without_normalizing(self):
        def link(text):
            return exports.claim_evidence_links({'draft':{'claims':[{'citations':['d:2']}]},
                'evidence':[{'citation':'d:2','doc':'d','chunk':2,'text':text}]})[0]['passages'][0]
        import hashlib
        original=link('Cláusula 2 — obrigação.\n')
        self.assertEqual(original['doc'],'d')
        self.assertEqual(original['chunk'],2)
        self.assertEqual(original['passage_sha256'],hashlib.sha256('Cláusula 2 — obrigação.\n'.encode('utf-8')).hexdigest())
        self.assertNotEqual(original['passage_sha256'],link('Cláusula 2 — obrigação.')['passage_sha256'])
