import test from 'node:test';
import assert from 'node:assert/strict';
import {intakeRequests} from '../src/intakeRequests';
import type {Intake,Json} from '../src/types';
function deferred(){let resolve!:(value:Intake)=>void,reject!:(error:Error)=>void;const promise=new Promise<Intake>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
const proposal:Intake={status:'ready_for_review',input:{amount:17}};
function setup(api:Parameters<typeof intakeRequests>[0]){const proposals:(Intake|null)[]=[],busy:boolean[]=[],errors:string[]=[],inputs:Record<string,Json>[]=[];const requests=intakeRequests(api,'mizan',{proposal:value=>proposals.push(value),busy:value=>busy.push(value),error:value=>errors.push(value)});requests.start();return {requests,proposals,busy,errors,inputs,commit:(value:Record<string,Json>)=>inputs.push(value)}}
test('duplicate preparation clicks issue one provider-facing request',async()=>{
 const response=deferred();let reads=0;const w=setup({intake:()=>{reads++;return response.promise}});const pending=w.requests.prepare('Goal');assert.equal(await w.requests.prepare('Goal'),false);assert.equal(reads,1);response.resolve(proposal);await pending;assert.equal(w.requests.busy,false);assert.equal(w.busy.at(-1),false);
});
test('editing and restoring the same goal invalidates the old proposal response',async()=>{
 const response=deferred(),w=setup({intake:()=>response.promise});const pending=w.requests.prepare('Original');w.requests.goalChanged();w.requests.goalChanged();response.resolve(proposal);assert.equal(await pending,false);assert.equal(w.proposals.at(-1),null);assert.equal(w.requests.apply(proposal,w.commit),false);assert.deepEqual(w.inputs,[]);assert.equal(w.busy.at(-1),false);
});
test('a displayed proposal cannot apply after a goal revision and a fresh proposal applies once',async()=>{
 const w=setup({intake:async()=>({...proposal})});await w.requests.prepare('First');const old=w.proposals.at(-1)!;w.requests.goalChanged();assert.equal(w.requests.apply(old,w.commit),false);await w.requests.prepare('Second');const fresh=w.proposals.at(-1)!;assert.equal(w.requests.apply(fresh,w.commit),true);assert.equal(w.requests.apply(fresh,w.commit),false);assert.deepEqual(w.inputs,[{amount:17}]);
});
test('disposed preparation sessions suppress responses, errors and busy-state updates',async()=>{
 for(const fail of [false,true]){const response=deferred(),w=setup({intake:()=>response.promise});const pending=w.requests.prepare('Goal');w.requests.dispose();if(fail)response.reject(Error('Old error'));else response.resolve(proposal);await pending;assert.deepEqual(w.proposals,[null]);assert.deepEqual(w.errors,['']);assert.deepEqual(w.busy,[true]);}
});
test('current preparation failures allow retry and a needs-information response cannot apply',async()=>{
 let reads=0;const w=setup({intake:async()=>{if(++reads===1)throw Error('Offline');return {status:'needs_information',questions:['Which deadline?']}}});await w.requests.prepare('Goal');assert.equal(w.errors.at(-1),'Offline');assert.equal(w.requests.busy,false);await w.requests.prepare('Goal');assert.equal(w.errors.at(-1),'');assert.equal(w.requests.apply(w.proposals.at(-1)!,w.commit),false);assert.deepEqual(w.inputs,[]);
});
