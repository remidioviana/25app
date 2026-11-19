import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function deferred(){let resolve!:(value:any)=>void,reject!:(error:Error)=>void;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
test('late run starts cannot populate another workspace or a reopened instance of the same app',async()=>{
 for(const reopen of [false,true]){
  const w=workspace(),response=deferred();w.setAPI(()=>response.promise);w.run('hasInputs=true;');const pending=w.run('runTask()');
  w.run('openAgent("b");');if(reopen)w.run('openAgent("a");');
  response.resolve({id:'old',status:'completed'});await pending;
  assert.equal(w.state().currentRun,null);assert.equal(w.state().renders,0);assert.deepEqual(w.state().notices,[]);
 }
});
test('an older start cannot override a newer start or re-enable its pending action',async()=>{
 const w=workspace(),first=deferred(),second=deferred();let calls=0;w.setAPI(()=>++calls===1?first.promise:second.promise);w.run('hasInputs=true;');
 const old=w.run('runTask()'),latest=w.run('runTask()');first.resolve({id:'old',status:'completed'});await old;
 assert.equal(w.nodes['#run'].disabled,true);assert.equal(w.state().renders,0);
 second.resolve({id:'latest',status:'completed'});await latest;
 assert.equal(w.state().currentRun.id,'latest');assert.equal(w.state().renders,1);assert.equal(w.nodes['#run'].disabled,false);
});
test('stale run failures do not show error notices after workspace navigation',async()=>{
 const w=workspace(),response=deferred();w.setAPI(()=>response.promise);w.run('hasInputs=true;');const pending=w.run('runTask()');
 w.run('openAgent("b");openAgent("a");');response.reject(new Error('old failure'));await pending;assert.deepEqual(w.state().notices,[]);
});
test('in-flight polling cannot update a reopened workspace even for the same run ID',async()=>{
 const w=workspace(),response=deferred();w.setAPI(()=>response.promise);w.run('currentRun={id:"old",status:"running"};watch("old");');
 const callback=w.timers.find(x=>x.delay===900)!.callback,pending=callback();
 w.run('openAgent("b");openAgent("a");currentRun={id:"old",status:"running"};');response.resolve({id:'old',status:'completed'});await pending;
 assert.equal(w.state().currentRun.status,'running');assert.equal(w.state().renders,0);
});
test('document searches cannot populate the next workspace with late evidence',async()=>{
 const w=workspace(),response=deferred();w.setAPI((url:string)=>url.endsWith('/documents')?Promise.resolve({documents:[]}):response.promise);
 await w.run('tab="docs";renderDocs()');w.run('$("#doc-query").value="evidence";$("#semantic-search").checked=false;');
 const pending=w.nodes['#search-doc'].onclick();w.run('openAgent("b");');response.resolve({matches:[]});await pending;
 assert.equal(w.nodes['#matches']?.innerHTML,undefined);assert.deepEqual(w.state().notices,[]);
});
test('document save completions do not redraw or notify another workspace',async()=>{
 const w=workspace(),response=deferred();const calls:string[]=[];w.setAPI((url:string,method:string='GET')=>{calls.push(url);return method==='GET'?Promise.resolve({documents:[]}):response.promise});
 await w.run('tab="docs";renderDocs()');w.run('$("#doc-title").value="Source";$("#doc-text").value="Evidence";$("#doc-source").value="source:1";$("#doc-date").value="2026-11-19";');const pending=w.nodes['#save-doc'].onclick();w.run('openAgent("b");');response.resolve({});await pending;
 assert.equal(calls.length,2);assert.deepEqual(w.state().notices,[]);
});
test('a failed replacement start resumes polling the previously displayed active run',async()=>{
 const w=workspace(),response=deferred();w.run('currentRun={id:"existing",status:"running"};watch("existing");hasInputs=true;');w.setAPI(()=>response.promise);
 const pending=w.run('runTask()');response.reject(new Error('replacement failed'));await pending;
 assert.equal(w.state().currentRun.id,'existing');const active=w.timers.filter(x=>x.delay===900&&!x.cancelled);assert.equal(active.length,1);
 w.setAPI(()=>Promise.resolve({id:'existing',status:'completed'}));await active[0].callback();
 assert.equal(w.state().currentRun.status,'completed');assert.equal(w.state().renders,1);
});
test('only the latest document search may render excerpts or errors',async()=>{
 const w=workspace(),first=deferred(),second=deferred();let calls=0;
 w.setAPI((url:string)=>url.endsWith('/documents')?Promise.resolve({documents:[]}):++calls===1?first.promise:second.promise);
 await w.run('tab="docs";renderDocs()');w.run('$("#doc-query").value="first";$("#semantic-search").checked=false;');
 const old=w.nodes['#search-doc'].onclick();w.run('$("#doc-query").value="second";');const latest=w.nodes['#search-doc'].onclick();
 second.resolve({matches:[{title:'Latest',text:'Current evidence',citation:'ref:2'}]});await latest;
 first.resolve({matches:[{title:'Stale',text:'Old evidence',citation:'ref:1'}]});await old;
 assert.match(w.nodes['#matches'].innerHTML,/Latest/);assert.doesNotMatch(w.nodes['#matches'].innerHTML,/Stale/);
});
test('query changes invalidate pending searches even when the original text is restored',async()=>{
 const w=workspace(),response=deferred();w.setAPI((url:string)=>url.endsWith('/documents')?Promise.resolve({documents:[]}):response.promise);
 await w.run('tab="docs";renderDocs()');w.run('$("#doc-query").value="first";$("#semantic-search").checked=false;');const pending=w.nodes['#search-doc'].onclick();
 w.run('$("#doc-query").value="edited";');w.nodes['#doc-query'].oninput();w.run('$("#doc-query").value="first";');w.nodes['#doc-query'].oninput();
 response.reject(new Error('stale search error'));await pending;assert.equal(w.nodes['#matches'].innerHTML,'');assert.deepEqual(w.state().notices,[]);
});
test('an older document panel cannot replace a newly opened panel in the same workspace',async()=>{
 const w=workspace(),old=deferred();let calls=0;w.setAPI(()=>++calls===1?old.promise:Promise.resolve({documents:[]}));
 const first=w.run('tab="docs";renderDocs()');await w.run('tab="input";tab="docs";renderDocs()');
 old.resolve({documents:[{id:'old',title:'STALE SOURCE',source:'ref:1',as_of:''}]});await first;
 assert.doesNotMatch(w.nodes['#left'].innerHTML,/STALE SOURCE/);
});
test('older intake responses cannot replace a newer proposal or enable its pending button',async()=>{
 const w=workspace(),old=deferred(),latest=deferred();let calls=0;w.setAPI(()=>++calls===1?old.promise:latest.promise);w.run('config.model_configured=true;goal="First";');
 const first=w.run('prepareIntake()');w.run('goal="Second";');const second=w.run('prepareIntake()');
 old.resolve({status:'needs_information',questions:['Old question']});await first;
 assert.equal(w.nodes['#intake'].disabled,true);assert.equal(w.nodes['#intake-result'].innerHTML,'');
 latest.resolve({status:'needs_information',questions:['Latest question']});await second;
 assert.match(w.nodes['#intake-result'].innerHTML,/Latest question/);assert.equal(w.nodes['#intake'].disabled,false);
});
test('editing and restoring the goal invalidates a pending proposal without trapping the action disabled',async()=>{
 const w=workspace(),response=deferred();w.setAPI((url:string)=>url.endsWith('/connectors')?Promise.resolve({connectors:[]}):response.promise);
 w.run('config.model_configured=true;goal="First";renderInputOriginal();');const pending=w.run('prepareIntake()');
 w.nodes['#goal'].oninput({target:{value:'Edited'}});w.nodes['#goal'].oninput({target:{value:'First'}});
 response.resolve({status:'needs_information',questions:['Stale question']});await pending;
 assert.equal(w.nodes['#intake-result'].innerHTML,'');assert.equal(w.nodes['#intake'].disabled,false);
});
