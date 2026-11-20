import test from 'node:test';
import assert from 'node:assert/strict';
import {agendaRequests} from '../src/agendaRequests';
import type {Schedule} from '../src/types';
function deferred<T=any>(){let resolve!:(value:T)=>void,reject!:(error:Error)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function setup(api:Parameters<typeof agendaRequests>[0]){const rows:Schedule[][]=[],busy:boolean[]=[],errors:string[]=[];const requests=agendaRequests(api,'mizan',{items:value=>rows.push(value),busy:value=>busy.push(value),error:value=>errors.push(value)});return {requests,rows,busy,errors}}
const row={id:'saved',goal:'Plan',enabled:1,remaining:2,next_at_iso:'2026-12-01T09:00:00Z',mode:'local'} as Schedule;
test('disposed agenda sessions ignore late list responses and errors',async()=>{
 for(const fail of [false,true]){const response=deferred(),w=setup({schedules:()=>response.promise,schedule:async()=>({}),disableSchedule:async()=>({})});const pending=w.requests.start();w.requests.dispose();if(fail)response.reject(Error('Old error'));else response.resolve({schedules:[row]});await pending;assert.deepEqual(w.rows,[[]]);assert.deepEqual(w.errors,[]);}
});
test('restarting a session invalidates the earlier load including strict-mode effect replay',async()=>{
 const old=deferred();let reads=0;const w=setup({schedules:()=>++reads===1?old.promise:Promise.resolve({schedules:[row]}),schedule:async()=>({}),disableSchedule:async()=>({})});const pending=w.requests.start();w.requests.dispose();await w.requests.start();old.resolve({schedules:[]});await pending;assert.deepEqual(w.rows.at(-1),[row]);
});
test('pending agenda writes are submitted once and cannot refresh a disposed session',async()=>{
 for(const action of ['create','disable'] as const){const response=deferred();let writes=0,reads=0;const w=setup({schedules:async()=>{reads++;return {schedules:[]}},schedule:()=>{writes++;return response.promise},disableSchedule:()=>{writes++;return response.promise}});await w.requests.start();const pending=w.requests[action]('payload');assert.equal(await w.requests[action]('payload'),false);assert.equal(writes,1);w.requests.dispose();response.resolve({});await pending;assert.equal(reads,1);assert.deepEqual(w.errors,[]);assert.deepEqual(w.busy,[false,true]);}
});
test('confirmed writes retain their receipt when list refresh fails and release busy state',async()=>{
 let reads=0;const w=setup({schedules:async()=>{if(++reads>1)throw Error('Offline');return {schedules:[]}},schedule:async()=>({}),disableSchedule:async()=>({})});await w.requests.start();assert.equal(await w.requests.create({goal:'Plan'}),true);assert.match(w.errors[0],/^Schedule created\. The list could not refresh/);assert.equal(w.busy.at(-1),false);
});
test('post-mutation list refresh supersedes an older initial load',async()=>{
 const old=deferred();let reads=0;const w=setup({schedules:()=>++reads===1?old.promise:Promise.resolve({schedules:[row]}),schedule:async()=>({}),disableSchedule:async()=>({})});const pending=w.requests.start();await w.requests.create({goal:'Plan'});old.resolve({schedules:[]});await pending;assert.deepEqual(w.rows.at(-1),[row]);
});
test('a failed write allows retry and an obsolete failure cannot report into a new session',async()=>{
 const old=deferred();let writes=0;const w=setup({schedules:async()=>({schedules:[]}),schedule:async()=>{if(++writes===1)throw Error('Rejected');return old.promise},disableSchedule:async()=>({})});await w.requests.start();assert.equal(await w.requests.create({}),false);assert.deepEqual(w.errors,['Rejected']);assert.equal(w.busy.at(-1),false);const pending=w.requests.create({});w.requests.dispose();await w.requests.start();old.reject(Error('Obsolete'));await pending;assert.deepEqual(w.errors,['Rejected']);assert.equal(w.busy.at(-1),false);
});
