import asyncio,pathlib,json,datetime,subprocess,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2];out=ROOT/'project/ui-signatures'
async def main():
 rows=[]
 async with async_playwright()as p:
  b=await p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
  for app in ('himayah','nafas'):
   for route in ('','mission','evidence','activity','workbench'):
    context=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(os.environ.get('EXPO_AUDIT_ORIGIN','http://127.0.0.1:8091')+'/'+route+'?variant='+app,wait_until='networkidle');await page.screenshot(path=str(out/(app+'-'+(route or'home')+'.png')));assert not errors,errors
    rows.append({'app':app,'route':'/'+route,'file':app+'-'+(route or'home')+'.png','state':'Initial local screen; no invented customer records or agent results','page_errors':errors});await context.close()
  await b.close()
 (out/'manifest.json').write_text(json.dumps({'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'scope':'Actual Expo Web screenshots at 390 x 844 with reduced motion; initial local screens, not physical devices or full primary acceptance','screens':rows},indent=2)+'\n')
 cards=''.join('<article><h2>'+r['app'].title()+' · '+r['route']+'</h2><a href="'+r['file']+'"><img loading="lazy" src="'+r['file']+'" alt="'+r['app']+' '+r['route']+' initial mobile screen"></a></article>'for r in rows)
 (out/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signature UI checkpoint</title><style>body{font:16px system-ui;background:#15191b;color:#f3f0e9;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px}img{width:100%;max-width:390px;border-radius:18px}h2{font-size:18px}p{max-width:850px;line-height:1.6}</style><h1>Himayah &amp; Nafas signature checkpoint</h1><p>Actual Expo Web initial states. No customer input, model result, physical-device verification or full product acceptance is implied. Source and capture conditions: manifest.json.</p><main>'+cards+'</main></html>')
asyncio.run(main())
