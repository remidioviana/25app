"""Keep mobile's generated folding semantics aligned with the actual backend runtime."""
import json
from pathlib import Path
import unittest
import unicodedata


class MobileCasefoldTests(unittest.TestCase):
    def test_full_mapping_matches_backend_unicode_contract(self):
        table = json.loads((Path(__file__).resolve().parents[1] / 'mobile/src/experience/casefold.json').read_text())
        self.assertEqual(table['unicode_version'], unicodedata.unidata_version)
        expected = {str(i): chr(i).casefold() for i in range(0x110000) if chr(i).casefold() != chr(i)}
        self.assertEqual(table['mappings'], expected)
