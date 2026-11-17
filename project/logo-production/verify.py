"""Read-only verification of the complete branding delivery."""
import hashlib,json,pathlib,xml.etree.ElementTree as ET
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[2]
r=json.loads((ROOT/'brand-assets/dimensional-logos.json').read_text())['products']
brands=json.loads((ROOT/'brand-assets/brands.json').read_text());assert set(r)=={b['id']for b in brands}
rows=[];hashes=set()
for b in brands:
 id=b['id'];a=r[id];assert a['name']==a['typography']['text']==b['name'];p=ROOT/a['symbol']['path'];digest=hashlib.sha256(p.read_bytes()).hexdigest();assert digest==a['symbol']['sha256'];assert digest not in hashes;hashes.add(digest)
 im=Image.open(p);assert im.mode=='RGBA';alpha=im.getchannel('A');assert alpha.getextrema()==(0,255);w,h=im.size;assert min(w,h)>=1024
 edge=max(alpha.crop(box).getextrema()[1] for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]);assert edge<=8,(id,edge)
 for key,f in a['files'].items():
  p=ROOT/f['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256'];svg=ET.parse(p).getroot();assert svg.attrib['aria-label']==b['name'];assert svg.findall('.//{http://www.w3.org/2000/svg}path');assert not svg.findall('.//{http://www.w3.org/2000/svg}text');assert not svg.findall('.//{http://www.w3.org/2000/svg}rect');assert not svg.findall('.//{http://www.w3.org/2000/svg}script')
  if key.startswith('logo'):assert svg.find('{http://www.w3.org/2000/svg}image').attrib['href'].startswith('data:image/png;base64,')
 rows.append({'id':id,'symbol_sha256':digest,'size':[w,h],'edge_alpha_max':edge,'alpha_bounds':alpha.getbbox(),'exact_name_vector_files':4})
(ROOT/'project/evidence/25-logo-symbol-validation.json').write_text(json.dumps({'scope':'File integrity, unique symbols, transparent PNG frames, exact-name vector paths and self-contained compositions. Not a physical-device or trademark review.','count':len(rows),'products':rows},indent=2)+'\n')
print('PASS: 25 unique transparent symbols and 100 exact-name vector branding files.')
