import json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1];p=ROOT/'mobile/src/experience/designs.ts';raw=p.read_text();start=raw.index('{',raw.index('export const designs'))
d=json.loads(raw[start:raw.rfind('}')+1]);matrix=json.load(open(ROOT/'project/design-matrix/matrix.json'));identities=json.load(open(ROOT/'mobile/src/experience/identities.json'))
def rgb(h):return [int(h[i:i+2],16)for i in(1,3,5)]
def hx(a):return '#'+''.join(f'{round(x):02X}'for x in a)
def mix(a,b,t):return hx([x*(1-t)+y*t for x,y in zip(rgb(a),rgb(b))])
def lum(h):
 c=[x/255 for x in rgb(h)];c=[x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4 for x in c];return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
def contrast(a,b):x,y=sorted([lum(a),lum(b)]);return(y+.05)/(x+.05)
dark={'himayah','istithmar','munagasah','tawassul','adab','khibrat','sawm','mizan'}
report=[]
for id,v in d.items():
 primary,light,signal=matrix[id]['palette'];bg=primary if id in dark else light;ink=light if id in dark else primary
 original_ink=ink
 for tone in range(101):
  if contrast(ink,bg)>=6.5:break
  ink=mix(original_ink,'#FFFFFF'if id in dark else'#111111',tone/100)
 panel=mix(bg,ink,.055);accent=signal
 # Preserve the specified signal for artwork; use an accessible tonal derivation for text/actions.
 for i in range(101):
  if min(contrast(accent,bg),contrast(accent,panel))>=4.5:break
  accent=mix(signal,ink,i/100)
 muted=mix(ink,bg,.20)
 for tone in range(21):
  if min(contrast(muted,bg),contrast(muted,panel))>=4.5:break
  muted=mix(ink,bg,(20-tone)/100)
 line=mix(bg,ink,.30)
 v.update(bg=bg,ink=ink,accent=accent,panel=panel,muted=muted,line=line,dark=id in dark)
 identities[id].update(bg=bg,ink=ink,accent=accent,panel=panel,signal=signal,appearance='dark'if id in dark else'light',matrix_palette=[primary,light,signal])
 report.append({'app':id,'requested_palette':[primary,light,signal],'accessible_action_tone':accent,'minimum_accent_contrast':round(min(contrast(accent,bg),contrast(accent,panel)),3),'minimum_body_contrast':round(min(contrast(ink,bg),contrast(ink,panel)),3),'minimum_secondary_contrast':round(min(contrast(muted,bg),contrast(muted,panel)),3)})
p.write_text(raw[:start]+json.dumps(d,indent=2)+';\n');(ROOT/'mobile/src/experience/identities.json').write_text(json.dumps(identities,indent=2)+'\n');(ROOT/'project/evidence/matrix-palette-contrast.json').write_text(json.dumps({'scope':'sRGB contrast for specified palettes and derived text tones; physical-device appearance is not verified','apps':report},indent=2)+'\n');print('Applied 25 matrix palettes; minimum action contrast',min(x['minimum_accent_contrast']for x in report))
