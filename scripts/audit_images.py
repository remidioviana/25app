"""Audit every mobile raster and SVG asset; this is not a visual UI test."""
from pathlib import Path
import json,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
rows=[]
for p in sorted((ROOT/'mobile/assets').rglob('*')):
 if p.suffix.lower() in ('.png','.jpg','.jpeg','.webp'):
  with Image.open(p) as im:
   im.load();w,h=im.size
  expected=(1024,1024) if p.stem=='icon' else (1284,2778) if p.stem in ('splash','splash-icon') else (1080,1920) if p.stem=='hero' else None
  assert w<=h, f'Landscape: {p}'
  assert expected and (w,h)==expected, f'Unexpected dimensions: {p}: {(w,h)}'
  rows.append({'path':str(p.relative_to(ROOT)),'width':w,'height':h,'aspect_ratio':w/h})
 elif p.suffix=='.svg':
  svg=ET.parse(p).getroot();box=list(map(float,svg.attrib['viewBox'].split()));assert box[2]<=box[3],str(p)
assert len(rows)==77,len(rows)
report={'raster_count':len(rows),'landscape_count':0,'visual_inspection':'See VISUAL_AUDIT.json for actual viewport checks; dimension audit alone does not validate rendering.','assets':rows}
(ROOT/'docs/IMAGE_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'PASS: {len(rows)} raster images, exact required dimensions, zero landscape; SVG viewboxes square or portrait.')
