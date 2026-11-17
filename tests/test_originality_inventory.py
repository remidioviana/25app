"""Artifact identity and provenance are mechanical checks, not a creative jury."""
import hashlib,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class OriginalityInventoryTests(unittest.TestCase):
 def test_each_product_uses_its_own_original_art_and_licensed_typeface(self):
  apps={a['id'] for a in json.loads((ROOT/'apps/apps.json').read_text())}
  art=json.loads((ROOT/'project/evidence/original-artwork-inventory.json').read_text())['assets'];fonts=json.loads((ROOT/'project/evidence/typeface-inventory.json').read_text())['typefaces']
  for rows in (art,fonts):
   self.assertEqual({r['app'] for r in rows},apps);self.assertEqual(len({r['sha256'] for r in rows}),25)
   for row in rows:self.assertEqual(hashlib.sha256((ROOT/row['file']).read_bytes()).hexdigest(),row['sha256'])
  self.assertEqual(len({r['source_family'] for r in fonts}),25)
  for row in fonts:self.assertIn('SIL OPEN FONT LICENSE',(ROOT/row['license_file']).read_text().upper())
 def test_prepared_guides_cite_their_actual_captured_source_without_impersonating_live_role_results(self):
  briefs=json.loads((ROOT/'mobile/src/experience/officialBriefs.json').read_text());guides=json.loads((ROOT/'mobile/src/experience/sourceGuides.json').read_text())
  self.assertEqual(set(guides),set(briefs));self.assertEqual(len({x['title'] for x in guides.values()}),25)
  for app,g in guides.items():
   self.assertEqual(g['source_id'],briefs[app]['source_id']);self.assertEqual(g['source_text_sha256'],briefs[app]['text_sha256']);self.assertEqual(g['origin'],'assistant_prepared_from_official_read')
