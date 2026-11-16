// Empty-start regression with controlled transport. Not live integration/agent proof.
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const agents=require('../apps/apps.json').map(app=>require(path.join(root,'agents',app.id,'agent.json')));
const errors=[],posted=[];const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://workspace.test',runScripts:'outside-only',virtualConsole:console});
const w=dom.window;w.structuredClone=structuredClone;w.crypto.randomUUID=()=> 'test-only-idempotency';
w.fetch=async(url,options={})=>{
 const u=new URL(url,'https://workspace.test');
 if(u.pathname==='/api/config')return {ok:true,json:async()=>({requires_token:false,model_configured:false})};
 if(u.pathname==='/api/agents')return {ok:true,json:async()=>({agents})};
 if(u.pathname.endsWith('/connectors'))return {ok:true,json:async()=>({connectors:[]})};
 if(options.method==='POST'){posted.push({url:u.pathname,body:JSON.parse(options.body)});return {ok:false,json:async()=>({error:'Test transport stops after observing explicit submission.'})};}
 throw Error('Unexpected test request: '+u.pathname);
};
const $=s=>w.document.querySelector(s);
const until=async(fn,label)=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10))}throw Error('Timeout '+label)};
function asserted(value){if(value===null||value==='')return false;if(Array.isArray(value))return value.length>0;if(typeof value==='object')return Object.values(value).some(asserted);return true}
(async()=>{
 w.eval(fs.readFileSync(path.join(root,'public/app.js'),'utf8'));
 await until(()=>w.document.querySelectorAll('[data-agent]').length===25,'catalog');
 for(const spec of agents){
  $(`[data-agent="${spec.id}"]`).click();assert.equal($('#example').checked,false,spec.id);
  assert.match($('#input-provenance').textContent,/No task data/);
  assert.ok(!$('#right').textContent.includes('artifact is available'));
  $('#toggle-view').click();assert.equal(asserted(JSON.parse($('#payload').value)),false,spec.id);
  const before=posted.length;$('#run').click();await until(()=>!$('#run').disabled,'empty guard');assert.equal(posted.length,before,spec.id);
  assert.match($('#toast').textContent,/Provide your own inputs/);
  // A fixture is explicit test input, never auto-loaded or treated as authentic.
  $('#payload').value=JSON.stringify(spec.example);$('#payload').dispatchEvent(new w.Event('input'));
  $('#example').checked=true;$('#example').dispatchEvent(new w.Event('change'));
  $('#run').click();await until(()=>posted.length===before+1,'explicit test submission');
  assert.deepEqual(posted.at(-1).body.input,spec.example);assert.equal(posted.at(-1).body.example,true);
  await until(()=>!$('#run').disabled,'submission settled');$('#reset').click();
  assert.equal($('#example').checked,false);assert.equal(asserted(JSON.parse($('#payload').value)),false,spec.id);
  assert.match($('#right').textContent,/Run analysis/);
  $('#back').click();await until(()=>w.document.querySelectorAll('[data-agent]').length===25,'back');
 }
 assert.deepEqual(errors,[]);
 process.stdout.write('PASS: 25 empty starts and clears; no implicit zero/false/fictional records, untouched Run blocked, explicit test fixtures remain marked demo. Controlled transport only.\n');
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1}).finally(()=>dom.window.close());
