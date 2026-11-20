import test from 'node:test';
import assert from 'node:assert/strict';
import {saveDocument,documentOperation} from '../src/documentSave';
function deferred(){let resolve!:()=>void,reject!:(error:Error)=>void;const promise=new Promise<void>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function setup(){let active=true,cleared=0,refreshes=0;const errors:string[]=[];return {view:{current:()=>active,saved:()=>{cleared++},refresh:async()=>{refreshes++},error:(value:string)=>errors.push(value)},dispose:()=>{active=false},cleared:()=>cleared,refreshes:()=>refreshes,errors}}
test('failed document writes retain the draft and never refresh as though saved',async()=>{
 const w=setup();assert.equal(await saveDocument(async()=>{throw Error('Rejected')},w.view),false);assert.equal(w.cleared(),0);assert.equal(w.refreshes(),0);assert.deepEqual(w.errors,['Rejected']);
});
test('confirmed saves clear the saved draft once and retain confirmation after refresh failure',async()=>{
 const w=setup();w.view.refresh=async()=>{throw Error('Offline')};assert.equal(await saveDocument(async()=>({id:'saved'}),w.view),true);assert.equal(w.cleared(),1);assert.match(w.errors.at(-1)!,/^Document saved\. The evidence list could not refresh/);
});
test('late save responses cannot clear a different editor or start its list refresh',async()=>{
 const w=setup(),response=deferred();const pending=saveDocument(()=>response.promise,w.view);w.dispose();response.resolve();await pending;assert.equal(w.cleared(),0);assert.equal(w.refreshes(),0);assert.deepEqual(w.errors,[]);
});
test('leaving during the list refresh suppresses a late error while preserving the confirmed save',async()=>{
 const w=setup(),response=deferred(),started=deferred();w.view.refresh=()=>{started.resolve();return response.promise};const pending=saveDocument(async()=>({id:'saved'}),w.view);await started.promise;w.dispose();response.reject(Error('Late failure'));assert.equal(await pending,true);assert.equal(w.cleared(),1);assert.deepEqual(w.errors,['']);
});
test('document picking and saving share a pending-operation lock and release it after errors',async()=>{
 const perform=documentOperation(),response=deferred(),busy:boolean[]=[];let calls=0;const update=(value:boolean)=>busy.push(value);const pending=perform(async()=>{calls++;await response.promise},()=>true,update);assert.equal(await perform(async()=>{calls++},()=>true,update),false);assert.equal(calls,1);response.reject(Error('Import failed'));await assert.rejects(pending,/Import failed/);assert.equal(busy.at(-1),false);assert.equal(await perform(async()=>{calls++},()=>true,update),true);assert.equal(calls,2);
});
test('unmounted document editors cannot begin work or update busy state on completion',async()=>{
 const perform=documentOperation(),response=deferred(),busy:boolean[]=[];let active=true,calls=0;const pending=perform(()=>response.promise,()=>active,value=>busy.push(value));active=false;response.resolve();await pending;assert.deepEqual(busy,[true]);assert.equal(await perform(async()=>{calls++},()=>active,value=>busy.push(value)),false);assert.equal(calls,0);
});

test('a confirmed retry clears the previous save error while a failed retry retains its draft',async()=>{
 const w=setup();await saveDocument(async()=>{throw Error('First failure')},w.view);assert.equal(w.errors.at(-1),'First failure');assert.equal(w.cleared(),0);
 await saveDocument(async()=>{throw Error('Second failure')},w.view);assert.equal(w.errors.at(-1),'Second failure');assert.equal(w.cleared(),0);
 assert.equal(await saveDocument(async()=>({id:'confirmed'}),w.view),true);assert.equal(w.errors.at(-1),'');assert.equal(w.cleared(),1);assert.equal(w.refreshes(),1);
});
