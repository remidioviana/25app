"""Check declared intended text/surface combinations, not full rendered accessibility."""
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]


def luminance(color):
    v=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
    return .2126*v[0]+.7152*v[1]+.0722*v[2]


for app in ('istithmar','munagasah','sahil'):
    css=(ROOT/f'design/{app}/styles.css').read_text()
    tokens={name:(light,dark) for name,light,dark in re.findall(r'--([\w-]+):light-dark\((#[\da-fA-F]{6}),(#[\da-fA-F]{6})\)',css)}
    pairs=[]
    for mode,theme in enumerate(('light','dark')):
        for name in ('ink','muted','accent','error'):
            for surface in ('bg','surface'):
                text=tokens[name][mode];bg=tokens[surface][mode]
                a,b=sorted((luminance(text),luminance(bg)));ratio=(b+.05)/(a+.05)
                assert ratio>=4.5,(app,theme,name,surface,ratio)
                pairs.append({'theme':theme,'text_token':name,'surface_token':surface,'ratio':round(ratio,2)})
        for name,surface in [('on' if 'on' in tokens else 'accent-ink','accent'),('accent','soft')]:
            a,b=sorted((luminance(tokens[name][mode]),luminance(tokens[surface][mode])));ratio=(b+.05)/(a+.05)
            assert ratio>=4.5,(app,theme,name,surface,ratio)
            pairs.append({'theme':theme,'text_token':name,'surface_token':surface,'ratio':round(ratio,2)})
    (ROOT/f'design/{app}/contrast-check.json').write_text(json.dumps(pairs,indent=2)+'\n')
    print(f'{app}: {len(pairs)} intended pairs passed; minimum {min(p["ratio"] for p in pairs)}:1.')
