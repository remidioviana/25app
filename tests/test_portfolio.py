import copy
import json
from pathlib import Path
import unittest
from scripts.check_portfolio import validate_manifest

ROOT=Path(__file__).resolve().parents[1]


class PortfolioTests(unittest.TestCase):
    def setUp(self):
        self.manifest=json.loads((ROOT/'project/portfolio.json').read_text())

    def test_actual_registry_is_consistent(self):
        self.assertEqual(validate_manifest(self.manifest),[])

    def test_reordered_or_renamed_product_is_rejected(self):
        self.manifest['products'][0]['name']='Invented product'
        self.assertTrue(any('identity' in e for e in validate_manifest(self.manifest)))
        other=copy.deepcopy(self.manifest)
        other['products'][0],other['products'][1]=other['products'][1],other['products'][0]
        self.assertTrue(any('original order' in e for e in validate_manifest(other)))

    def test_unsupported_completion_claim_requires_actual_artifacts(self):
        product=self.manifest['products'][3]
        product['released']=True
        product['release_evidence']=['does-not-exist.ipa']
        errors=validate_manifest(self.manifest)
        self.assertTrue(any('supporting evidence' in e for e in errors))
        self.assertTrue(any('acceptance' in e for e in errors))

    def test_evidence_cannot_escape_repository(self):
        product=self.manifest['products'][1]
        product['agent_verified']=True
        product['live_agent_evidence']=['../../../../etc/passwd']
        self.assertTrue(any('supporting evidence' in e for e in validate_manifest(self.manifest)))

    def test_other_apps_public_source_receipt_cannot_validate_an_untested_app(self):
        product=self.manifest['products'][13]
        product['public_source_read_verified']=True
        product['public_source_read_evidence']=['project/evidence/public-source-reads.json']
        self.assertTrue(any('receipt for this app' in e for e in validate_manifest(self.manifest)))

    def test_other_apps_live_graph_cannot_validate_an_untested_app(self):
        product=self.manifest['products'][0]
        product['live_graph_diagnostic_verified']=True
        product['live_graph_diagnostic_evidence']=['project/evidence/groq-munagasah-rag-verified.json']
        self.assertTrue(any('successful scoped RAG proof' in e for e in validate_manifest(self.manifest)))
    def test_tool_transport_probe_is_not_graph_rag_proof(self):
        product=self.manifest['products'][3]
        product['live_graph_diagnostic_verified']=True
        product['live_graph_diagnostic_evidence']=['project/evidence/groq-live-tool-probes.json']
        self.assertTrue(any('successful scoped RAG proof' in e for e in validate_manifest(self.manifest)))
