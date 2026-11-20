import test from 'node:test';
import assert from 'node:assert/strict';
import {historyRequests} from '../src/historyRequests';
import type {Run,RunSummary} from '../src/types';
function deferred<T=any>(){let resolve!:(value:T)=>void,reject!:(error:Error)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function setup(api:Parameters<typeof historyRequests>[0]){const rows:RunSummary[][]=[],errors:string[]=[],opened:Run[]=[];const requests=historyRequests(api,'mizan',{runs:value=>rows.push(value),error:value=>errors.push(value),open:value=>opened.push(value)});return {requests,rows,errors,opened}}
const run={id:'case',status:'completed'} as Run,summary={id:'case',status:'completed'} as RunSummary;
test('history refetches on each focus and ignores list responses from earlier visits',async()=>{
 const old=deferred();let reads=0;const w=setup({runs:()=>++reads===1?old.promise:Promise.resolve({runs:[summary]}),run:async()=>run});const pending=w.requests.start();w.requests.dispose();await w.requests.start();old.resolve({runs:[]});await pending;assert.equal(reads,2);assert.deepEqual(w.rows.at(-1),[summary]);
});
test('leaving history prevents late case responses and failures from opening or reporting',async()=>{
 for(const fail of [false,true]){const response=deferred(),w=setup({runs:async()=>({runs:[]}),run:()=>response.promise});await w.requests.start();const pending=w.requests.open('case');w.requests.dispose();if(fail)response.reject(Error('Old error'));else response.resolve(run);await pending;assert.deepEqual(w.opened,[]);assert.deepEqual(w.errors,['']);}
});
test('only the latest case selection can open, even when the older response arrives last',async()=>{
 const old=deferred(),latest=deferred();const w=setup({runs:async()=>({runs:[]}),run:id=>id==='old'?old.promise:latest.promise});await w.requests.start();const first=w.requests.open('old'),second=w.requests.open('latest');latest.resolve({...run,id:'latest'});await second;old.resolve({...run,id:'old'});await first;assert.deepEqual(w.opened.map(value=>value.id),['latest']);
});
test('repeated pending case clicks submit once and a current failure allows retry',async()=>{
 const response=deferred();let reads=0;const w=setup({runs:async()=>({runs:[]}),run:()=>{reads++;return reads===1?response.promise:Promise.resolve(run)}});await w.requests.start();const pending=w.requests.open('case');assert.equal(await w.requests.open('case'),false);assert.equal(reads,1);response.reject(Error('Offline'));await pending;assert.equal(w.errors.at(-1),'Could not open that case.');assert.equal(await w.requests.open('case'),true);assert.equal(reads,2);assert.deepEqual(w.opened,[run]);assert.equal(w.errors.at(-1),'');
});
test('a stale history error cannot replace a fresh visit and disconnected history makes no requests',async()=>{
 const old=deferred();let reads=0;const w=setup({runs:()=>++reads===1?old.promise:Promise.resolve({runs:[summary]}),run:async()=>run});const pending=w.requests.start();w.requests.dispose();await w.requests.start();old.reject(Error('Old failure'));await pending;assert.deepEqual(w.errors,['','']);assert.deepEqual(w.rows.at(-1),[summary]);const disconnected=setup(null);await disconnected.requests.start();assert.equal(await disconnected.requests.open('case'),false);assert.deepEqual(disconnected.rows,[[]]);
});
