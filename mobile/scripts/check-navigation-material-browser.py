"""Actual Expo Web navigation fallback, not an Android/iOS device emulator."""
import asyncio,pathlib,json,datetime,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
async def main():
 apps={a['id']:a for a in json.loads((ROOT/'apps/apps.json').read_text())};benches=json.loads((ROOT/'mobile/src/experience/workbenches.json').read_text());rows=[]
 async with async_playwright()as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
  for id in ('himayah','munagasah','jomrok','majlis','turath'):
   context=await browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=await context.new_page();page.set_default_timeout(20000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text)if m.type in('warning','error')else None)
   await page.goto(os.environ.get('EXPO_AUDIT_ORIGIN','http://127.0.0.1:8091')+'/?variant='+id,wait_until='networkidle');
   if id=='munagasah':
    assert await page.locator('img').evaluate_all('(items)=>items.some(i=>i.src.includes("dimensional-logo")&&i.complete&&i.naturalWidth>0)')
    await page.screenshot(path=str(ROOT/'project/dimensional-design/munagasah-approved-home.png'))
   await page.get_by_role('button',name='Open navigation',exact=True).click();panel=page.get_by_test_id('navigation-material');await panel.wait_for();assert await panel.get_by_role('tab').count()==5;assert await panel.get_by_text(apps[id]['name'],exact=True).is_visible();background=await panel.evaluate('(el)=>getComputedStyle(el).backgroundColor');assert background!='rgba(0, 0, 0, 0)';assert background!='transparent'
   if id=='himayah':await page.screenshot(path=str(ROOT/'project/evidence/navigation-solid-web.png'))
   await panel.get_by_role('tab',name=benches[id]['tab'],exact=True).click();await panel.wait_for(state='hidden');await page.get_by_role('button',name='Open navigation',exact=True).click();await page.get_by_role('button',name='Close navigation',exact=True).click();await panel.wait_for(state='hidden');assert not errors,errors
   rows.append({'app':id,'tab_count':5,'computed_solid_background':background,'can_navigate_and_close':True,'console_warnings_and_errors':errors});await context.close()
  await browser.close()
 (ROOT/'project/evidence/navigation-material-browser.json').write_text(json.dumps({'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Actual Web solid fallback with five drawer navigation families; not native Liquid Glass, Android elevation, installed icons or a physical-device accessibility test.','apps':rows},indent=2)+'\n');print('Passed five solid navigation drawers, route selection, closing and console checks.')
asyncio.run(main())
