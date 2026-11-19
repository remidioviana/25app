"""Package color alternatives without modifying approved production artwork."""
import base64
import hashlib
import html
import json
from pathlib import Path
import re
import shutil
import zipfile

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = Path('/workspace/artifacts/gold-preview')
UNCHANGED = {'iqamah', 'munagasah', 'sawm', 'turath', 'himam', 'hisad'}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    brands = json.loads((ROOT / 'brand-assets/brands.json').read_text())
    rows, cards = [], []
    OUT.mkdir(parents=True, exist_ok=True)
    for brand in brands:
        key = brand['id']
        source = ROOT / f'mobile/assets/variants/{key}/dimensional-logo.png'
        edited = key not in UNCHANGED
        target = HERE / f'{key}.png' if edited else source
        original, result = Image.open(source), Image.open(target)
        assert original.size == result.size and result.mode == 'RGBA', key
        a, b = [im.getchannel('A').point(lambda x: 255 if x >= 128 else 0) for im in (original, result)]
        intersection = ImageChops.darker(a, b).histogram()[255]
        union = ImageChops.lighter(a, b).histogram()[255]
        overlap = intersection / union
        assert overlap >= .97, (key, overlap)
        alpha = result.getchannel('A')
        w, h = result.size
        assert max(alpha.crop(box).getextrema()[1] for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]) <= 8, key
        meta = json.loads((HERE / f'{key}.json').read_text()) if edited else {}
        row = {'id': key, 'name': brand['name'], 'edited': edited,
               'accent': meta.get('accent', 'Existing gold — unchanged'),
               'source_sha256': digest(source), 'preview_sha256': digest(target),
               'alpha_core_iou': round(overlap, 6)}
        rows.append(row)
        dest = OUT / key
        dest.mkdir(exist_ok=True)
        shutil.copyfile(target, dest / 'symbol.png')
        shutil.copyfile(ROOT / f'mobile/assets/typefaces/{key}-OFL.txt', dest / 'FONT-LICENSE.txt')
        for theme in ('light', 'dark'):
            prod = ROOT / f'brand-assets/production/{key}'
            shutil.copyfile(prod / f'wordmark-on-{theme}.svg', dest / f'wordmark-on-{theme}.svg')
            logo = (prod / f'logo-on-{theme}.svg').read_text()
            if edited:
                payload = base64.b64encode(target.read_bytes()).decode()
                logo, count = re.subn(r'data:image/png;base64,[^"\s]+', 'data:image/png;base64,' + payload, logo)
                assert count == 1
            (dest / f'logo-on-{theme}.svg').write_text(logo)
        original_url = f'../../mobile/assets/variants/{key}/dimensional-logo.png'
        gold_url = f'{key}.png' if edited else original_url
        name = html.escape(brand['name'])
        status = 'Gold accent' if edited else 'Existing gold · unchanged'
        cards.append(f'<article><h2>{name}</h2><div class="pair"><figure><img src="{original_url}"><figcaption>Approved original</figcaption></figure><figure><img src="{gold_url}"><figcaption>{status}</figcaption></figure></div><img class="wordmark" src="../production/{key}/wordmark-on-light.svg"></article>')
    manifest = {'edition': 'Gold color comparison — not a replacement of approved production assets',
                'policy': 'Color accents on existing components; no intentional shape redesign. Original wordmarks preserved.',
                'brands': rows}
    (HERE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    shutil.copyfile(HERE / 'manifest.json', OUT / 'manifest.json')
    page = '''<!doctype html><html lang="en"><meta charset="utf-8"><title>25 identities · Gold color comparison</title><style>*{box-sizing:border-box}body{margin:0;background:#f6f3ed;color:#18202a;font-family:Arial,sans-serif;padding:36px}header{margin-bottom:24px}h1{font-size:32px;margin:0 0 8px}p{margin:0;color:#615d54}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}article{background:white;border:1px solid #e5dfd3;border-radius:16px;padding:16px}h2{font-size:16px;margin:0 0 14px}.pair{display:flex;gap:8px}figure{margin:0;flex:1;min-width:0}figure img{width:100%;height:140px;object-fit:contain}figcaption{text-align:center;font-size:10px;color:#777064;height:24px;margin-top:6px}.wordmark{display:block;width:85%;height:30px;object-fit:contain;margin:10px auto 0}</style><header><h1>25 identities · Gold accents</h1><p>Approved original → color alternative. Existing forms and wordmarks retained. Six identities already feature gold.</p></header><main class="grid">''' + ''.join(cards) + '</main></html>'
    (HERE / 'index.html').write_text(page)
    readme = 'Gold accent comparison edition\n\n19 color alternatives; six existing gold identities unchanged. Approved production assets remain intact. All 25 packages include transparent PNG symbols and light/dark SVG logo compositions with the original vector wordmarks. This is a visual comparison, not a product release.\n'
    (HERE / 'README.md').write_text(readme)
    (OUT / 'README.txt').write_text(readme)
    with zipfile.ZipFile('/workspace/artifacts/25-gold-accent-logo-pack.zip', 'w', zipfile.ZIP_DEFLATED) as pack:
        for file in sorted(OUT.rglob('*')):
            if file.is_file():
                pack.write(file, file.relative_to(OUT))
    print(json.dumps({'count': len(rows), 'edited': sum(r['edited'] for r in rows), 'minimum_alpha_core_iou': min(r['alpha_core_iou'] for r in rows)}))


if __name__ == '__main__':
    main()
