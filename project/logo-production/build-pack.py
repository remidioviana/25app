"""Create exact-name vector wordmarks and self-contained transparent logo compositions.
Symbols are original image-generation outputs; this script never edits their pixels.
"""
import base64,hashlib,html,json,math,pathlib,struct,zipfile
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'brand-assets/production';OUT.mkdir(exist_ok=True)
brands=json.loads((ROOT/'brand-assets/brands.json').read_text())
source=(ROOT/'mobile/src/experience/designs.ts').read_text();designs=json.loads(source[source.index('={',source.index('export const designs'))+1:].strip().rstrip(';'))
briefs={a['id']:a for a in json.loads((ROOT/'project/logo-production/briefs.json').read_text())['items']}
stacked={'iqamah','majlis','sawm','nafas','turath'}
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def asset(path):return {'path':str(path.relative_to(ROOT)),'sha256':digest(path),'bytes':path.stat().st_size}
def contrast(a,b):
 def lum(color):
  v=[int(color[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4 for x in v];return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))
 x,y=sorted([lum(a),lum(b)]);return(y+.05)/(x+.05)
def wordmark(id,text):
 fontpath=ROOT/'mobile/assets/typefaces'/f'{id}.ttf';data=fontpath.read_bytes();font=TTFont(fontpath);glyphs=font.getGlyphSet();face=hb.Face(data);shaper=hb.Font(face);shaper.scale=(face.upem,face.upem);hb.ot_font_set_funcs(shaper);buf=hb.Buffer();buf.add_str(text);buf.guess_segment_properties();hb.shape(shaper,buf,{'kern':True,'liga':True})
 bounds=BoundsPen(glyphs);paths=[];x=y=0
 for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
  assert info.codepoint!=0,(id,'Missing glyph');name=font.getGlyphName(info.codepoint);glyph=glyphs[name];px=x+pos.x_offset;py=y+pos.y_offset;pen=SVGPathPen(glyphs);glyph.draw(pen);glyph.draw(TransformPen(bounds,(1,0,0,1,px,py)))
  if pen.getCommands():paths.append(f'<path transform="translate({px} {py})" d="{pen.getCommands()}"/>')
  x+=pos.x_advance;y+=pos.y_advance
 assert bounds.bounds;left,bottom,right,top=bounds.bounds;pad=(top-bottom)*.06;box=(left-pad,-top-pad,right-left+2*pad,top-bottom+2*pad)
 assert all(math.isfinite(v)for v in box)and box[2]>0 and box[3]>0
 return ''.join(paths),box,{'font':asset(fontpath),'family':font['name'].getDebugName(1),'shaping':'HarfBuzz with kerning and ligatures; glyph outlines from the licensed font','glyph_count':len(buf.glyph_infos),'text':text}
def svg(text,body,box):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}" role="img" aria-label="{html.escape(text,quote=True)}"><title>{html.escape(text)}</title>{body}</svg>\n'
missing=[b['id']for b in brands if not(ROOT/'mobile/assets/variants'/b['id']/'dimensional-logo.png').is_file()]
if missing:raise SystemExit('Symbols still missing: '+', '.join(missing))
registry={'scope':'25 isolated transparent symbols, exact-name outlined wordmarks and self-contained logo compositions. This is branding asset production, not app completion or native-device acceptance.','products':{}}
for b in brands:
 id=b['id'];name=b['name'];folder=OUT/id;folder.mkdir(exist_ok=True);symbol=ROOT/'mobile/assets/variants'/id/'dimensional-logo.png';raw=symbol.read_bytes();assert raw[:8]==b'\x89PNG\r\n\x1a\n';width,height=struct.unpack('>II',raw[16:24]);assert raw[25]==6,(id,'Symbol must be RGBA')
 paths,box,typography=wordmark(id,name);d=designs[id];colors={}
 for appearance,bg,fallback in [('light','#FFFFFF','#17222D'),('dark','#14181D','#F6F1E7')]:
  colors[appearance]=next((color for color in [d['ink'],d['bg'],fallback]if contrast(color,bg)>=4.5),fallback)
 files={};view=' '.join(str(round(x,4))for x in box);png=base64.b64encode(raw).decode();aspect=box[2]/box[3]
 for appearance,color in colors.items():
  group=f'<g fill="{color}" transform="scale(1 -1)">{paths}</g>'
  wordfile=folder/f'wordmark-on-{appearance}.svg';wordfile.write_text(svg(name,group,view));files['wordmark_'+appearance]=asset(wordfile)
  if id in stacked:
   W,H=800,600;sx,sy,ss=220,10,360;tw=min(680,aspect*128);th=tw/aspect;tx=(W-tw)/2;ty=430
  else:
   W,H=1200,340;sx,sy,ss=0,10,320;tw=min(820,aspect*140);th=tw/aspect;tx=350;ty=(H-th)/2
  body=f'<image x="{sx}" y="{sy}" width="{ss}" height="{ss}" href="data:image/png;base64,{png}"/><svg x="{tx}" y="{ty}" width="{tw}" height="{th}" viewBox="{view}">{group}</svg>'
  logofile=folder/f'logo-on-{appearance}.svg';logofile.write_text(svg(name,body,f'0 0 {W} {H}'));files['logo_'+appearance]=asset(logofile)
 concept=briefs.get(id,{'concept':'Approved institutional proposal folio','brief':'User-approved ivory folio, graphite spine and plain amber seal.'})
 metadata=ROOT/'project/logo-production/metadata'/f'{id}.json';origin=json.loads(metadata.read_text()).get('generated_original')if metadata.exists()else json.loads((ROOT/'brand-assets/dimensional-icons.json').read_text())['icons'][id]['brand_logo']['generated_original']
 registry['products'][id]={'name':name,'concept':concept['concept'],'brief':concept['brief'],'symbol':{**asset(symbol),'width':width,'height':height,'mode':'RGBA','generated_original':origin},'typography':typography,'files':files,'composition':'stacked'if id in stacked else'horizontal','wordmark_colors':colors,'font_license':str((ROOT/'mobile/assets/typefaces'/f'{id}-OFL.txt').relative_to(ROOT)),'physical_device_verified':False,'expert_originality_review':'not certified'}
 assert all(contrast(color,'#FFFFFF'if mode=='light'else'#14181D')>=4.5 for mode,color in colors.items())
(ROOT/'brand-assets/dimensional-logos.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
archive=pathlib.Path('/workspace/artifacts/25-logo-symbol-pack.zip');archive.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED)as z:
 manifest={}
 for id,a in registry['products'].items():
  entries={'symbol.png':a['symbol']['path'],**{pathlib.Path(f['path']).name:f['path']for f in a['files'].values()},'FONT-LICENSE.txt':a['font_license']}
  manifest[id]={'name':a['name'],'concept':a['concept'],'wordmark_text':a['typography']['text'],'files':{}}
  for filename,src in entries.items():
   file=ROOT/src;z.write(file,id+'/'+filename);manifest[id]['files'][filename]=digest(file)
 z.writestr('manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 z.writestr('README.txt','25 transparent symbol PNGs and 25 exact-name vector logo systems. Each folder includes symbol.png, two outlined wordmark SVGs, two self-contained logo SVGs and its font license. Symbols are dimensional raster artwork, not vector/3D scenes. All backgrounds are transparent. Light/dark filenames describe wordmark contrast, not an opaque backdrop. Native app delivery and device acceptance are separate.\n')
print('Built',len(registry['products']),'symbol/wordmark/logo sets. Archive:',archive,'bytes:',archive.stat().st_size)
