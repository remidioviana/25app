// Install jsdom in a development environment; this test does not claim visual/browser QA.
const {JSDOM,VirtualConsole}=require('jsdom');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'agent-dom-'));
const port=18451;
const base=`http://127.0.0.1:${port}`;
const server=spawn(process.env.PYTHON||'python3',['server.py'],{cwd:root,env:{...process.env,PORT:String(port),AGENT_DATA_DIR:temp,OPENAI_API_KEY:'',APP_USERS_FILE:'',APP_CONNECTORS_FILE:'',APP_TOKEN:'',HOST:'127.0.0.1'}});
let dom;
const errors=[];
async function until(fn,label){for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,25))}throw Error('Timeout: '+label)}
(async()=>{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('Server exited '+c)))});
  const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
  dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:base,runScripts:'outside-only',virtualConsole:console});
  const w=dom.window;w.structuredClone=structuredClone;w.crypto.randomUUID=randomUUID;w.fetch=(url,opts)=>fetch(new URL(url,base),opts);
  w.eval(fs.readFileSync(path.join(root,'public/app.js'),'utf8'));
  const $=s=>w.document.querySelector(s);
  await until(()=>w.document.querySelectorAll('.card').length===25,'catalog');
  const ids=[...w.document.querySelectorAll('[data-agent]')].map(x=>x.dataset.agent);
  for(const id of ids){
    $(`[data-agent="${id}"]`).click();
    assert.ok($('#mode option[value="team"]'),'Team option missing');
    assert.equal($('#example').checked,false,'Runtime must start empty');$('#toggle-view').click();$('#payload').value=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'agents',id,'agent.json'),'utf8')).example);$('#payload').dispatchEvent(new w.Event('input'));$('#example').checked=true;$('#example').dispatchEvent(new w.Event('change'));

    $('#run').click();await until(()=>$('#accept'),'result '+id);
    assert.ok($('#right').textContent.includes('Completed'));
    assert.ok($('[data-export="markdown"]'));assert.ok($('[data-export="csv"]'));
    if(id==='mizan'){
      assert.ok($('#right').textContent.includes('450'));
      $('#accept').click();await until(()=>$('#right').textContent.includes('accepted'),'accepted result');
      $('[data-tab="docs"]').click();await until(()=>$('#doc-title'),'document form');
      const file=$('#doc-file');const content=Buffer.from('Texto importado via arquivo');Object.defineProperty(file,'files',{configurable:true,value:[{name:'importado.txt',size:content.length,arrayBuffer:async()=>content.buffer.slice(content.byteOffset,content.byteOffset+content.length)}]});file.dispatchEvent(new w.Event('change'));await until(()=>$('#doc-text').value.includes('Texto importado'),'file preview');
      $('#doc-title').value='Orçamento de teste';$('#doc-source').value='Teste automatizado';$('#doc-text').value='Alimentação tem orçamento de 500 AED.';$('#save-doc').click();
      await until(()=>$('[data-delete]'),'indexed document');$('#doc-query').value='alimentação';$('#search-doc').click();await until(()=>$('#matches').textContent.includes('500 AED'),'document retrieval');
      $('[data-tab="history"]').click();await until(()=>$('[data-run]'),'history');
      $('[data-tab="schedules"]').click();await until(()=>$('#create-schedule'),'schedule form');$('#create-schedule').click();await until(()=>$('[data-disable-schedule]'),'schedule creation');$('[data-disable-schedule]').click();await until(()=>$('#left').textContent.includes('Finished'),'schedule disable');
    }
    $('#back').click();await until(()=>w.document.querySelectorAll('.card').length===25,'back');
  }
  $('[data-agent="hisad"]').click();$('#toggle-view').click();$('#payload').value='{invalid';$('#run').click();await until(()=>$('#toast').textContent.includes('JSON'),'invalid JSON');
  assert.deepEqual(errors,[]);
  process.stdout.write('PASS: 25 UI flows via DOM + real local HTTP API; forms, exports, team option, review, history, retrieval, document import, schedule create/disable, invalid JSON. Not visual QA.\n');
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1}).finally(()=>{dom?.window.close();server.kill();fs.rmSync(temp,{recursive:true,force:true})});
