"""Opt-in browser audit. Requires Playwright and an Expo web server with EXPO_PUBLIC_VISUAL_AUDIT=1.
Uses only controlled transport and repository synthetic examples, never provider inference.
"""
import asyncio,json,pathlib,datetime,hashlib,os,subprocess
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2];apps=json.load(open(ROOT/'apps/apps.json'));briefs=json.load(open(ROOT/'mobile/src/experience/officialBriefs.json'));workbenches=json.load(open(ROOT/'mobile/src/experience/workbenches.json'));rows=[]
async def main():
 capture=pathlib.Path(os.environ['MATRIX_CAPTURE_DIR']) if os.environ.get('MATRIX_CAPTURE_DIR') else None
 if capture:capture.mkdir(parents=True,exist_ok=True)
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
  for a in apps:
   if a['id']=='nafas':
    context=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type in ('error','warning') else None)
    await page.goto(os.environ.get('EXPO_AUDIT_ORIGIN','http://127.0.0.1:8091')+'/workbench?variant=nafas',wait_until='networkidle');await page.get_by_text('Your breathing space.',exact=True).wait_for();assert not errors,errors

    if capture:await page.screenshot(path=str(capture/'nafas.png'))
    rows.append({'app':'nafas','status':'passed','scope':'Local breathing screen; detailed interaction evidence is signature-nafas-browser.json','provider_calls':0,'console_warnings_and_errors':errors});await context.close();continue
   id=a['id'];agent=json.load(open(ROOT/'agents'/id/'agent.json'));brief=briefs[id];context=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=await context.new_page();page.set_default_timeout(15000);errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type in ('error','warning') else None)
   async def transport(route):
    req=route.request;path=req.url.split('controlled-workspace.example')[-1];h={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}
    if req.method=='OPTIONS':await route.fulfill(status=204,headers=h);return
    requests.append(path)
    if path=='/api/config':data={'requires_token':True,'model_configured':True,'langgraph_available':True,'embedding_configured':False,'provider':{'status':'configured_unverified','configured':True,'configuration_valid':True,'inference_verified':False,'distinct_models':2,'roles':{'planner':'openai/gpt-oss-20b','specialist':'openai/gpt-oss-20b','critic':'openai/gpt-oss-120b'}}}
    elif path=='/api/me':data={'user':'controlled-ui-test'}
    elif path=='/api/agents':data={'agents':[agent]}
    elif path=='/api/agents/'+id+'/intake':data={'status':'ready_for_review','input':agent['example']}
    elif path=='/api/agents/'+id+'/sources':data={'sources':[],'reads':[]}if req.method=='GET'else{'document_id':'controlled-source','source_content':brief['quote'],'receipt':dict(brief,status='retrieved')}
    elif path=='/public/intelligence.json':data={}
    else:raise RuntimeError('Unexpected test request '+path)
    await route.fulfill(json=data,headers=h)
   await page.route('https://controlled-workspace.example/**',transport)
   await page.goto(os.environ.get('EXPO_AUDIT_ORIGIN','http://127.0.0.1:8091')+'/mission?variant='+id,wait_until='networkidle');connect=page.get_by_role('button',name='Connect for ',exact=False);await connect.click();await page.get_by_label('HTTPS server',exact=True).fill('https://controlled-workspace.example');await page.get_by_label('Workspace access token, not provider API key',exact=True).fill('ui-test-only');await page.get_by_role('button',name='Connect workspace',exact=True).click();await page.get_by_role('button',name='Prepare the case',exact=True).click();await page.get_by_role('button',name='Use these proposed inputs',exact=True).click()
   nav=page.get_by_role('button',name='Open navigation',exact=True)
   if await nav.count()and await nav.is_visible():await nav.click()
   await page.get_by_role('tab',name=workbenches[id]['tab'],exact=True).click();await page.get_by_text('HIMAYAH / DOCUMENT INSPECTOR',exact=True).wait_for() if id=='himayah' else await page.get_by_text('MUNAGASAH / BID CONTROL',exact=True).wait_for() if id=='munagasah' else await page.get_by_text('Interactive tools · entered records',exact=True).wait_for();assert not errors,(id,errors);assert not any('/runs' in x for x in requests)
   if capture:await page.screenshot(path=str(capture/(id+'.png')))
   rows.append({'app':id,'status':'passed','scope':'Actual browser rendering and local tool interaction using the existing repository synthetic example through controlled intake transport','case_input_sha256':hashlib.sha256(json.dumps(agent['example'],sort_keys=True).encode()).hexdigest(),'provider_calls':0,'external_actions':0,'console_warnings_and_errors':errors});print('Passed',id,flush=True);await context.close()
  await b.close()
 (ROOT/'project/evidence/signature-portfolio-browser-checks.json').write_text(json.dumps({'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'viewport':{'width':390,'height':844},'reduced_motion':True,'scope':'Controlled browser transport and synthetic inputs, not native-device, factual/legal or real-provider acceptance','apps':rows},indent=2)+'\n')
asyncio.run(main())
