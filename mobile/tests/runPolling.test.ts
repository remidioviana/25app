import test from 'node:test';
import assert from 'node:assert/strict';
import {pollRunStatus} from '../src/runPolling';
import {ApiError} from '../src/api';
import type {Run} from '../src/types';
function setup(api:Parameters<typeof pollRunStatus>[0]){const timers:{work:()=>Promise<void>;delay:number;cancelled:boolean}[]=[],runs:Run[]=[],errors:string[]=[];const dispose=pollRunStatus(api,'case',{run:value=>runs.push(value),error:value=>errors.push(value)},{schedule:(work,delay)=>{timers.push({work,delay,cancelled:false});return timers.length-1},cancel:handle=>{if(timers[Number(handle)])timers[Number(handle)].cancelled=true}});return {timers,runs,errors,dispose}}
const completed={id:'case',status:'completed'} as Run;
test('a transient status-read failure recovers and clears only the polling warning',async()=>{
 let reads=0;const w=setup({run:async(id)=>{assert.equal(id,'case');if(++reads===1)throw Error('Offline');return completed}});assert.equal(w.timers[0].delay,500);await w.timers.at(-1)!.work();assert.equal(w.timers.at(-1)!.delay,2000);await w.timers.at(-1)!.work();assert.deepEqual(w.runs,[completed]);assert.equal(w.errors.at(-1),'');assert.equal(w.timers.length,2);
});
test('status polling uses at most three retries with increasing delays',async()=>{
 let reads=0;const w=setup({run:async()=>{reads++;throw new ApiError('Unavailable',503)}});for(const delay of [500,2000,4000,8000]){assert.equal(w.timers.at(-1)!.delay,delay);await w.timers.at(-1)!.work();}assert.equal(reads,4);assert.equal(w.timers.length,4);assert.match(w.errors.at(-1)!,/Status updates stopped/);assert.deepEqual(w.runs,[]);
});
test('authentication, missing runs and quota errors never trigger automatic retries',async()=>{
 for(const status of [400,401,403,404,429]){const w=setup({run:async()=>{throw new ApiError('Rejected',status)}});await w.timers[0].work();assert.equal(w.timers.length,1);assert.match(w.errors.at(-1)!,/Refresh run status/);}
});
test('disposing an in-flight status read suppresses late results and warnings',async()=>{
 for(const fail of [false,true]){let resolve!:(run:Run)=>void,reject!:(error:Error)=>void,signal:AbortSignal|undefined;const response=new Promise<Run>((yes,no)=>{resolve=yes;reject=no});const w=setup({run:async(_id,nextSignal)=>{signal=nextSignal;return response}});const pending=w.timers[0].work();w.dispose();assert.equal(signal?.aborted,true);if(fail)reject(Error('Old error'));else resolve(completed);await pending;assert.deepEqual(w.runs,[]);assert.deepEqual(w.errors,['']);}
});
test('a fresh active status resets the failure budget and stopped timers cannot read again',async()=>{
 let reads=0;const w=setup({run:async()=>{if(++reads%2)throw Error('Offline');return {...completed,status:'running'}}});await w.timers.at(-1)!.work();await w.timers.at(-1)!.work();await w.timers.at(-1)!.work();assert.equal(w.timers.at(-1)!.delay,2000);w.dispose();await w.timers.at(-1)!.work();assert.equal(reads,3);
});
