import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function start(w:ReturnType<typeof workspace>){w.run('currentRun={id:"active",status:"running"};watch("active");')}
test('transient status read failures recover without restarting the mission',async()=>{
 const w=workspace();let reads=0;w.setAPI(async(path,method='GET')=>{assert.equal(path,'/api/runs/active');assert.equal(method,'GET');if(++reads===1)throw Error('Offline');return {id:'active',status:'completed'}});start(w);
 await w.timers.at(-1)!.callback();assert.equal(w.timers.at(-1)!.delay,1800);assert.equal(w.state().currentRun.status,'running');
 await w.timers.at(-1)!.callback();assert.equal(reads,2);assert.equal(w.state().currentRun.status,'completed');assert.equal(w.state().renders,1);
 assert.equal(w.timers.at(-1)!.cancelled,true);
});
test('status reads use a bounded exponential backoff and preserve the known run',async()=>{
 const w=workspace();let reads=0;w.setAPI(async()=>{reads++;throw Object.assign(Error('Unavailable'),{status:503})});start(w);
 for(const delay of [900,1800,3600,7200]){const timer=w.timers.at(-1)!;assert.equal(timer.delay,delay);await timer.callback();}
 assert.equal(reads,4);assert.equal(w.timers.length,4);assert.equal(w.state().currentRun.status,'running');assert.match(w.state().notices.at(-1),/Status updates stopped/);
});
test('successful active status reads reset the retry budget and interval',async()=>{
 const w=workspace();let reads=0;w.setAPI(async()=>{if(++reads%2)throw Error('Offline');return {id:'active',status:'running'}});start(w);
 await w.timers.at(-1)!.callback();await w.timers.at(-1)!.callback();assert.equal(w.timers.at(-1)!.delay,900);
 await w.timers.at(-1)!.callback();assert.equal(w.timers.at(-1)!.delay,1800);
});
test('authentication, missing runs and quota responses stop without automatic retry',async()=>{
 for(const status of [400,401,403,404,429]){const w=workspace();w.setAPI(async()=>{throw Object.assign(Error('Rejected'),{status})});start(w);await w.timers.at(-1)!.callback();assert.equal(w.timers.length,1);assert.match(w.state().notices.at(-1),/Status updates stopped/);}
});
test('scheduled status retries cannot read or modify a reopened workspace',async()=>{
 const w=workspace();let reads=0;w.setAPI(async()=>{reads++;throw Error('Offline')});start(w);await w.timers.at(-1)!.callback();const retry=w.timers.at(-1)!;
 w.run('openAgent("b");openAgent("a");currentRun={id:"active",status:"running"};');await retry.callback();assert.equal(reads,1);assert.equal(w.state().renders,0);
});
test('API errors retain their HTTP status even when the error body is not JSON',async()=>{
 for(const json of [async()=>({error:'Not authorized'}),async()=>{throw SyntaxError('HTML body')}]){
  const w=workspace();w.setFetch(async()=>({ok:false,status:401,json}));await assert.rejects(w.run('apiOriginal("/api/runs/active")'),(error:any)=>error.status===401);
 }
});
