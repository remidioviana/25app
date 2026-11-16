"""Check intended text/surface pairs; not a complete accessibility audit."""
from pathlib import Path
import json


def luminance(h):
    v=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
    return .2126*v[0]+.7152*v[1]+.0722*v[2]


rows=[]
for theme,surfaces,texts in [
    ('light',['#FBF8F0','#FFFDF8'],['#222B36','#535D69','#705716','#8B4A00','#A02D30','#21614E']),
    ('dark',['#171A20','#21262E'],['#F3EEE2','#C2C5CC','#E8CC83','#FFD08E','#FFB4AB','#A5DBBE']),
]:
    for surface in surfaces:
        for text in texts:
            a,b=sorted([luminance(surface),luminance(text)])
            ratio=(b+.05)/(a+.05)
            assert ratio>=4.5,(theme,text,surface,ratio)
            rows.append({'theme':theme,'text':text,'surface':surface,'ratio':round(ratio,2)})
for text,surface in [('#FFFDF8','#273340'),('#20242B','#E8CC83'),('#705716','#F0E9D9'),('#E8CC83','#302D24')]:
    a,b=sorted([luminance(surface),luminance(text)])
    ratio=(b+.05)/(a+.05)
    assert ratio>=4.5,(text,surface,ratio)
    rows.append({'theme':'action/selection','text':text,'surface':surface,'ratio':round(ratio,2)})
Path(__file__).with_name('contrast-check.json').write_text(json.dumps(rows,indent=2)+'\n')
print(f'PASS: {len(rows)} intended pairs, minimum {min(r["ratio"] for r in rows)}:1.')
