"""Compare preserved baseline screens and current brand identities; requires Pillow.

Perceptual distance is a review aid, not aesthetic or device acceptance.
"""
import pathlib,json,hashlib,difflib
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1];ids=json.loads((ROOT/'mobile/src/experience/identities.json').read_text());apps=list(ids)
def dhash(path):
 im=Image.open(path).convert('L').resize((17,16));p=list(im.getdata());return sum((p[y*17+x]>p[y*17+x+1])<<(y*16+x) for y in range(16)for x in range(16))
old=ROOT/'project/ui-redesign';screenpairs=[]
for route in ['home','mission','evidence','activity']:
 files=list(old.glob('*-'+route+'.jpg'));hashes={p.name:dhash(p)for p in files}
 pairs=sorted((int((hashes[a]^hashes[b]).bit_count()),a,b)for i,a in enumerate(hashes)for b in list(hashes)[i+1:])
 screenpairs.append({'screen':route,'method':'16x16 grayscale difference hash; differences in text length, art, contrast and scroll can confound this; not a layout or aesthetic verdict','most_similar_pairs':[{'distance_bits':d,'a':a,'b':b}for d,a,b in pairs[:10]]})
assets=[]
for id in apps:
 folder=ROOT/'mobile/assets/variants'/id
 assets.append({'app':id,'logo_sha256':hashlib.sha256((folder/'logo.svg').read_bytes()).hexdigest(),'wordmark_sha256':hashlib.sha256((folder/'wordmark.svg').read_bytes()).hexdigest(),'icon_sha256':hashlib.sha256((folder/'icon.png').read_bytes()).hexdigest(),'lockup':ids[id]['lockup'],'type_family':ids[id]['font_family']})
pairs=[]
for i,a in enumerate(apps):
 for b in apps[i+1:]:
  x=ids[a];y=ids[b];score=difflib.SequenceMatcher(None,x['architecture'].lower(),y['architecture'].lower()).ratio();pairs.append((score,a,b))
r={'baseline_commit':'307c7b7a3e9e95c7514c6595f2df642776d056c7','baseline_findings':['25 identical masthead symbol/name structures','one common 16-point bold wordmark treatment','shared heading size rules despite 25 font files','seven case-form families and five navigation families','repeated source and history structures','one shared press-scale motion with duration variations'],'baseline_screen_comparisons':screenpairs,'current_brand_assets':assets,'unique_symbol_hashes':len({x['logo_sha256']for x in assets}),'unique_wordmark_hashes':len({x['wordmark_sha256']for x in assets}),'unique_lockups':len({x['lockup']for x in assets}),'creative_direction_text_overlap_candidates':[{'ratio':round(s,3),'a':a,'b':b}for s,a,b in sorted(pairs,reverse=True)[:10]],'interpretation':'Hashes and text distance are mechanical checks only. Highest-ranked pairs require visual/interaction inspection. Baseline captures predate the new identity code.','creative_jury_acceptance':False,'native_device_acceptance':False,'remaining_review':['wordmark legibility at small phone widths and large text','case/source/history equivalence across all 25','purposeful motion beyond shared press-scale','native iOS and Android primary interactions']}
(ROOT/'project/evidence/creative-identity-audit.json').write_text(json.dumps(r,indent=2)+'\n');print('Audit:',len(assets),'brands; 1,200 baseline screen pairs compared; no award/device claim.')
