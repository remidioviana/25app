"""Import integrity fingerprints do not imply source authenticity."""
import base64
import hashlib
import unittest
import document_import

class ImportProvenanceTests(unittest.TestCase):
    def extract(self,raw):
        return document_import.extract('clause.txt',base64.b64encode(raw).decode())

    def test_raw_file_and_extracted_text_have_separate_exact_fingerprints(self):
        raw=b'\xef\xbb\xbf'+ 'Cláusula — texto.\n'.encode('utf-8')
        result=self.extract(raw);proof=result['provenance']
        self.assertEqual(proof['raw_sha256'],hashlib.sha256(raw).hexdigest())
        self.assertEqual(proof['extracted_text_sha256'],hashlib.sha256(result['text'].encode('utf-8')).hexdigest())
        self.assertNotEqual(proof['raw_sha256'],proof['extracted_text_sha256'])
        self.assertEqual(proof['raw_bytes'],len(raw))
        self.assertFalse(proof['authenticity_verified'])
        self.assertIn('not retained',proof['scope'])

    def test_same_text_from_different_bytes_preserves_distinction(self):
        plain=self.extract(b'Clause 1')
        bom=self.extract(b'\xef\xbb\xbfClause 1')
        self.assertEqual(plain['text'],bom['text'])
        self.assertEqual(plain['provenance']['extracted_text_sha256'],bom['provenance']['extracted_text_sha256'])
        self.assertNotEqual(plain['provenance']['raw_sha256'],bom['provenance']['raw_sha256'])
