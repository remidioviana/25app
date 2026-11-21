import test from 'node:test';
import assert from 'node:assert/strict';
import {missionSubmission} from '../src/missionSubmission';
import {runOperations} from '../src/runOperations';
import type {MissionRequest} from '../src/missionSubmission';
import type {Run} from '../src/types';
const request:MissionRequest={agent:'mizan',goal:'Analyze',input:{amount:17},mode:'team',example:false};
const run={id:'mission',status:'queued'} as Run;
function deferred(){let resolve!:(value:Run)=>void,reject!:(error:Error)=>void;const promise=new Promise<Run>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function submission(){let keys=0;return {sender:missionSubmission(()=>`key-${++keys}`),keys:()=>keys}}
test('rapid duplicate mission submissions issue one request and one idempotency key',async()=>{
 const w=submission(),response=deferred();let writes=0;const api={start:async()=>{writes++;return response.promise}};
 const pending=w.sender.submit(api,request);assert.equal(w.sender.busy,true);assert.equal(await w.sender.submit(api,request),null);assert.equal(writes,1);assert.equal(w.keys(),1);assert.equal(w.sender.busy,true);response.resolve(run);assert.equal(await pending,run);assert.equal(w.sender.busy,false);
});
test('an unchanged retry after an uncertain failure retains its original idempotency key',async()=>{
 const w=submission(),keys:string[]=[];const api={start:async(...args:any[])=>{keys.push(args[5]);if(keys.length===1)throw Error('Response lost');return run}};
 await assert.rejects(w.sender.submit(api,request),/Response lost/);assert.equal(w.sender.busy,false);await w.sender.submit(api,{...request,input:{amount:17}});assert.deepEqual(keys,['key-1','key-1']);assert.equal(w.keys(),1);
});
test('changed mission content or connection cannot reuse a previous request identity',async()=>{
 const changes:MissionRequest[]=[{...request,agent:'hisad'},{...request,goal:'Different goal'},{...request,input:{amount:18}},{...request,mode:'local'},{...request,example:true}];
 for(const changed of changes){const w=submission(),keys:string[]=[];const api={start:async(...args:any[])=>{keys.push(args[5]);throw Error('Offline')}};await assert.rejects(w.sender.submit(api,request));await assert.rejects(w.sender.submit(api,changed));assert.deepEqual(keys,['key-1','key-2']);}
 const w=submission();const first={start:async()=>{throw Error('Offline')}},second={start:async()=>run};await assert.rejects(w.sender.submit(first,request));await w.sender.submit(second,request);assert.equal(w.keys(),2);
});
test('a confirmed mission clears retry identity so a deliberate new mission receives a new key',async()=>{
 const w=submission(),keys:string[]=[];const api={start:async(...args:any[])=>{keys.push(args[5]);return run}};await w.sender.submit(api,request);await w.sender.submit(api,request);assert.deepEqual(keys,['key-1','key-2']);
});

test('a Home launch finishing after focus disposal cannot navigate or publish an error',async()=>{
 for(const failure of [false,true]){
  const w=submission(),operations=runOperations(),response=deferred(),errors:string[]=[],busy:boolean[]=[],published:Run[]=[];
  const onBusy=(value:boolean)=>busy.push(value);operations.start(onBusy);
  const pending=operations.execute(()=>w.sender.submit({start:()=>response.promise},request),value=>{if(value)published.push(value)},message=>errors.push(message),onBusy,'Launch failed');
  operations.dispose();if(failure)response.reject(Error('Old workspace error'));else response.resolve(run);
  assert.equal(await pending,false);assert.deepEqual(published,[]);assert.deepEqual(errors,[]);assert.deepEqual(busy,[false,true]);
 }
});

test('reopening Home preserves the idempotency key for an uncertain unchanged launch',async()=>{
 const w=submission(),operations=runOperations(),keys:string[]=[],errors:string[]=[],onBusy=()=>{};
 const api={start:async(...args:any[])=>{keys.push(args[5]);if(keys.length===1)throw Error('Response lost');return run}};
 const launch=()=>operations.execute(()=>w.sender.submit(api,request),()=>{},message=>errors.push(message),onBusy,'Launch failed');
 operations.start(onBusy);assert.equal(await launch(),false);operations.dispose();operations.start(onBusy);
 assert.equal(await launch(),true);assert.deepEqual(keys,['key-1','key-1']);assert.deepEqual(errors,['Response lost','']);
});
