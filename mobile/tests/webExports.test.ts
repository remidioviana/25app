import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function deferred(){let resolve!:(value:any)=>void,reject!:(error:Error)=>void;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function setup(format:string){const w=workspace(),button={dataset:{export:format},disabled:false,onclick:null as any};w.lists['[data-export]']=[button];w.run('currentRun={id:"old",agent:"a",status:"completed",events:[]};renderResultOriginal();$("#export-date").value="2026-12-01";');return {w,button:format==='json'?w.nodes['#export']:button}}
for(const format of ['json','markdown','csv','ics']){
 test(`${format} export submits once and releases the temporary download URL`,async()=>{
  const {w,button}=setup(format),response=deferred();let calls=0,url='';
  const transport=(path:string)=>{calls++;url=path;return response.promise};w.setAPI(transport);w.setFetch(transport);
  const pending=button.onclick();await button.onclick();assert.equal(calls,1);
  response.resolve(format==='json'?{artifact:'saved'}:{ok:true,blob:async()=>new Blob(['report'])});await pending;
  assert.equal(w.downloads.length,1);assert.equal(w.downloads[0].download,format==='json'?'a-old.json':`a.${format==='markdown'?'md':format}`);
  assert.equal(url.includes('?date='),format==='ics');assert.equal(button.disabled,false);
  w.timers.at(-1)!.callback();assert.deepEqual(w.revoked,[w.downloads[0].href]);
 });
 test(`${format} export cannot download or show errors after navigation`,async()=>{
  for(const failure of [false,true])for(const destination of ['other','reopened','newer']){
   const {w,button}=setup(format),response=deferred();w.setAPI(()=>response.promise);w.setFetch(()=>response.promise);
   const pending=button.onclick();if(destination==='newer')w.run('runRequest++;currentRun={id:"new",status:"completed"};');else{w.run('openAgent("b");');if(destination==='reopened')w.run('openAgent("a");');}
   if(failure)response.reject(Error('Export failed'));else response.resolve(format==='json'?{}:{ok:true,blob:async()=>new Blob(['report'])});
   await pending;assert.deepEqual(w.downloads,[]);assert.deepEqual(w.state().notices,[]);assert.equal(button.disabled,false);
  }
 });
}
test('navigation while the export body is loading suppresses the eventual download',async()=>{
 const {w,button}=setup('csv'),body=deferred(),started=deferred();w.setFetch(async()=>({ok:true,blob:()=>{started.resolve(true);return body.promise}}));
 const pending=button.onclick();await started.promise;w.run('openAgent("b");');body.resolve(new Blob(['report']));await pending;assert.deepEqual(w.downloads,[]);
});
test('a current export failure allows retry and missing calendar date sends no request',async()=>{
 const {w,button}=setup('ics');let calls=0;w.setFetch(async()=>{calls++;throw Error('Export failed')});w.nodes['#export-date'].value='';await button.onclick();assert.equal(calls,0);assert.equal(button.disabled,false);
 w.nodes['#export-date'].value='2026-12-01';await button.onclick();assert.equal(calls,1);assert.equal(w.state().notices.at(-1),'Export failed');assert.equal(button.disabled,false);
});

test('download initiation failures still release the object URL and allow retry',async()=>{
 const {w,button}=setup('json');w.setAPI(async()=>({artifact:'saved'}));
 w.run('document.createElement=()=>({click:()=>{throw Error("Download blocked")}})');
 await button.onclick();assert.equal(w.state().notices.at(-1),'Download blocked');assert.equal(button.disabled,false);
 w.timers.at(-1)!.callback();assert.deepEqual(w.revoked,['blob:test-1']);
});
