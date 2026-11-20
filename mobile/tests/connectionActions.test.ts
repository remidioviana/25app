import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionActions} from '../src/connectionActions';
function deferred(){let resolve!:()=>void,reject!:(error:Error)=>void;const promise=new Promise<void>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function setup(){const actions=connectionActions(),busy:boolean[]=[],errors:string[]=[];let navigations=0;const state={actions,busy,errors,success:()=>{navigations++},onBusy:(value:boolean)=>busy.push(value),onError:(value:string)=>errors.push(value),navigations:()=>navigations};actions.start(state.onBusy);return state}
test('connection and disconnection share a synchronous pending-operation lock',async()=>{
 const w=setup(),response=deferred();let writes=0;const pending=w.actions.run(()=>{writes++;return response.promise},w.success,w.onError,w.onBusy);assert.equal(await w.actions.run(async()=>{writes++},w.success,w.onError,w.onBusy),false);assert.equal(writes,1);response.resolve();assert.equal(await pending,true);assert.equal(w.navigations(),1);assert.deepEqual(w.busy,[false,true,false]);
});
test('leaving the connection screen suppresses late navigation, errors and busy updates',async()=>{
 for(const fail of [false,true]){const w=setup(),response=deferred();const pending=w.actions.run(()=>response.promise,w.success,w.onError,w.onBusy);w.actions.dispose();if(fail)response.reject(Error('Late failure'));else response.resolve();await pending;assert.equal(w.navigations(),0);assert.deepEqual(w.errors,['']);assert.deepEqual(w.busy,[false,true]);}
});
test('a saved-connection removal failure is visible, keeps the screen open and permits retry',async()=>{
 const w=setup();assert.equal(await w.actions.run(async()=>{throw Error('Could not remove the saved connection.')},w.success,w.onError,w.onBusy),false);assert.equal(w.errors.at(-1),'Could not remove the saved connection.');assert.equal(w.navigations(),0);assert.equal(w.busy.at(-1),false);assert.equal(await w.actions.run(async()=>{},w.success,w.onError,w.onBusy),true);assert.equal(w.navigations(),1);assert.equal(w.errors.at(-1),'');
});
test('reopening the same screen invalidates an earlier action without unlocking the newer one',async()=>{
 const w=setup(),old=deferred(),latest=deferred();const first=w.actions.run(()=>old.promise,w.success,w.onError,w.onBusy);w.actions.dispose();w.actions.start(w.onBusy);const second=w.actions.run(()=>latest.promise,w.success,w.onError,w.onBusy);old.resolve();await first;assert.equal(w.navigations(),0);assert.equal(w.busy.at(-1),true);latest.resolve();await second;assert.equal(w.navigations(),1);assert.equal(w.busy.at(-1),false);
});
test('an unfocused connection form cannot initiate storage or connection work',async()=>{
 const w=setup();w.actions.dispose();let writes=0;assert.equal(await w.actions.run(async()=>{writes++},w.success,w.onError,w.onBusy),false);assert.equal(writes,0);
});
