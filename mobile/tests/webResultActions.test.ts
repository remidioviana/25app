import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function deferred(){let resolve!:(value:any)=>void,reject!:(error:Error)=>void;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function result(w:ReturnType<typeof workspace>){w.run('currentRun={id:"old",status:"running",events:[]};renderResultOriginal();')}
test('late result actions cannot replace a different workspace, reopened app or newer run',async()=>{
 for(const action of ['cancel','retry','accept','reject'])for(const destination of ['other','reopened','newer']){
  const w=workspace(),response=deferred();w.setAPI(()=>response.promise);result(w);
  const pending=w.nodes['#'+action].onclick();
  if(destination==='newer')w.run('runRequest++;currentRun={id:"new",status:"completed"};');
  else{w.run('openAgent("b");');if(destination==='reopened')w.run('openAgent("a");');}
  response.resolve({id:'old',status:'completed'});await pending;
  assert.equal(w.state().currentRun?.id,destination==='newer'?'new':undefined);
  assert.equal(w.state().renders,0);assert.deepEqual(w.state().notices,[]);
 }
});
test('result actions submit once and apply a confirmed response to the current run',async()=>{
 const w=workspace(),response=deferred();let writes=0;w.setAPI(()=>{writes++;return response.promise});result(w);
 const pending=w.nodes['#accept'].onclick();await w.nodes['#accept'].onclick();assert.equal(writes,1);
 response.resolve({id:'old',status:'completed',review:'accepted'});await pending;
 assert.equal(w.state().currentRun.review,'accepted');assert.equal(w.state().renders,1);
});
test('failed current actions restore polling while stale failures stay silent',async()=>{
 for(const navigate of [false,true]){
  const w=workspace(),response=deferred();w.setAPI(()=>response.promise);result(w);
  const pending=w.nodes['#cancel'].onclick();if(navigate)w.run('openAgent("b");');
  response.reject(Error('Request failed'));await pending;
  assert.deepEqual(w.state().notices,navigate?[]:['Request failed']);
  if(!navigate){assert.equal(w.nodes['#cancel'].disabled,false);assert.equal(w.timers.at(-1)?.delay,900);}
 }
});
