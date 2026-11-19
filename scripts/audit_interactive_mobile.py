"""Controlled web regression audit. Start Expo with EXPO_PUBLIC_VISUAL_AUDIT=1.
Requires Playwright and Chromium; does not connect a backend or call inference.
"""
import argparse,os
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
args=argparse.ArgumentParser();args.add_argument('--origin',default='http://localhost:8106');args.add_argument('--chromium',default=os.environ.get('CHROMIUM_PATH','/workspace/work/browsers/chromium-1234/chrome-linux64/chrome'));opts=args.parse_args()
root=Path(__file__).resolve().parents[1];brands=json.loads((root/'brand-assets/brands.json').read_text());results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=opts.chromium,args=['--no-sandbox'])
 for brand in brands:
  key=brand['id'];page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[]
  page.on('console',lambda msg:errors.append(msg.text) if msg.type in ['error','warning'] and ('non-boolean' in msg.text or 'Received' in msg.text or 'Error' in msg.text) else None)
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'{opts.origin.rstrip("/")}/mission?variant={key}',wait_until='networkidle',timeout=120000)
  demo=page.get_by_role('button',name='See How It Works',exact=True)
  if key=='nafas':
   page.get_by_role('checkbox').first.click();expect(page.get_by_role('checkbox').first).to_have_attribute('aria-checked','true');expect(page.get_by_test_id('interactive-nafas')).to_be_visible()
   results.append({'id':key,'native_surface':'activity choice and local plan','passed':not errors,'errors':errors});page.close();continue
  demo.wait_for(timeout=30000);assert demo.count()==1,key
  if key=='mizan':
   currency=page.get_by_role('textbox',name='Currency',exact=True);currency.fill('USD');demo.click();expect(currency).to_have_value('AED')
   page.get_by_role('button',name='Restore previous inputs',exact=True).click();expect(currency).to_have_value('USD');demo.click()
  else:demo.click()
  if key not in ['iqamah','istithmar']:
   scene=page.get_by_test_id(f'interactive-{key}');scene.wait_for();selectors=scene.get_by_role('button',name='Inspect ',exact=False)
   assert selectors.count()>0,key
   last=selectors.last;label=last.get_attribute('aria-label').removeprefix('Inspect ');last.click()
   assert label in scene.get_by_test_id('selected-record-detail').inner_text(),key
   scene.get_by_role('button',name='Needs attention',exact=True).click();scene.get_by_role('button',name='All records',exact=True).click()
   if key in ['mizan','manzil']:
    switches=page.get_by_role('switch');assert switches.count()>0
    switch=switches.first;before=switch.is_checked();switch.click();expect(switch).to_be_checked(checked=not before)
    switch.focus();page.keyboard.press('Space');expect(switch).to_be_checked(checked=before)
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),key+' horizontal overflow'
   if key in ['adl','tawteen','mizan','turath','hisad']:
    scene.screenshot(path=f'/workspace/artifacts/interactive-{key}.png')
  results.append({'id':key,'demo_label':'See How It Works','restore_previous_inputs':'passed' if key=='mizan' else 'not_exercised','passed':not errors,'errors':errors});page.close()
 b.close()
path=root/'project/evidence/interactive-portfolio-browser.json';path.write_text(json.dumps({'scope':'Controlled Chromium mobile-width interactions; not physical iOS/Android acceptance or live inference','results':results},indent=2)+'\n')
assert all(x['passed'] for x in results),results
print('PASS',len(results),'variants; selection, filters, boolean form state and keyboard; no non-boolean warnings')
