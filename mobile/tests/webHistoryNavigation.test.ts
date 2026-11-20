import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function deferred(){let resolve!:(value:any)=>void,reject!:(error:Error)=>void;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function row(id:string){return {id,goal:id,status:'completed',created:'2026-11-20T10:00:00Z'}}
test('older history loads cannot overwrite a newer visit to the same tab',async()=>{
 const w=workspace(),old=deferred(),latest=deferred();let reads=0;w.setAPI(()=>++reads===1?old.promise:latest.promise);
 const pending=w.run('tab="history";renderHistory()');w.run('tab="input";');const fresh=w.run('tab="history";renderHistory()');
 latest.resolve({runs:[row('newest mission')]});await fresh;old.resolve({runs:[row('older mission')]});await pending;
 assert.match(w.nodes['#left'].innerHTML,/newest mission/);assert.ok(!w.nodes['#left'].innerHTML.includes('older mission'));
});
test('late history errors do not replace a new list or produce an unrelated notice',async()=>{
 const w=workspace(),old=deferred();let reads=0;w.setAPI(()=>++reads===1?old.promise:Promise.resolve({runs:[row('current mission')]}));
 const pending=w.run('tab="history";renderHistory()');w.run('tab="input";');await w.run('tab="history";renderHistory()');old.reject(Error('Old failure'));await pending;
 assert.match(w.nodes['#left'].innerHTML,/current mission/);assert.deepEqual(w.state().notices,[]);
});
test('current history load failures replace the loading state with a recovery message',async()=>{
 const w=workspace();w.setAPI(async()=>{throw Error('Offline')});await w.run('tab="history";renderHistory()');assert.match(w.nodes['#left'].innerHTML,/Reopen History to retry/);assert.deepEqual(w.state().notices,['Offline']);
});
for(const tab of ['docs','schedules'])test(`stale ${tab} load failures stay silent after leaving and reopening the tab`,async()=>{
 const w=workspace(),old=deferred();let reads=0;w.setAPI(()=>++reads===1?old.promise:Promise.resolve({documents:[],schedules:[]}));
 const pending=w.run(`tab="${tab}";renderLeft()`);w.run('tab="input";renderLeft();');await w.run(`tab="${tab}";renderLeft()`);old.reject(Error('Old failure'));await pending;assert.deepEqual(w.state().notices,[]);
});
