import test from 'node:test';
import assert from 'node:assert/strict';
import {runOperations,shareRunReport} from '../src/runOperations';
import type {ReportRuntime} from '../src/runOperations';
function deferred<T=void>(){let resolve!:(value:T)=>void,reject!:(error:Error)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function view(){const operations=runOperations(),busy:boolean[]=[],errors:string[]=[],values:unknown[]=[];const onBusy=(value:boolean)=>busy.push(value);operations.start(onBusy);return {operations,busy,errors,values,onBusy,error:(value:string)=>errors.push(value),success:(value:unknown)=>values.push(value)}}
function runtime(){let shares=0,deletes=0,writes=0;const file={uri:'cache:report',exists:true,create:()=>{},write:()=>{writes++},delete:()=>{deletes++}};const adapter:ReportRuntime={web:false,file:()=>file,shareText:async()=>{shares++},available:async()=>true,shareFile:async()=>{shares++}};return {file,adapter,shares:()=>shares,deletes:()=>deletes,writes:()=>writes}}
test('result mutations and exports share a synchronous operation lock',async()=>{
 const w=view(),response=deferred<string>();let calls=0;const pending=w.operations.execute(()=>{calls++;return response.promise},w.success,w.error,w.onBusy,'Failed');assert.equal(await w.operations.execute(async()=>{calls++},w.success,w.error,w.onBusy,'Failed'),false);assert.equal(calls,1);response.resolve('confirmed');await pending;assert.deepEqual(w.values,['confirmed']);assert.equal(w.busy.at(-1),false);
});
test('disposed result actions cannot update a later view or its errors',async()=>{
 for(const fail of [false,true]){const w=view(),response=deferred<string>();const pending=w.operations.execute(()=>response.promise,w.success,w.error,w.onBusy,'Failed');w.operations.dispose();if(fail)response.reject(Error('Old error'));else response.resolve('old');await pending;assert.deepEqual(w.values,[]);assert.deepEqual(w.errors,[]);assert.deepEqual(w.busy,[false,true]);}
});
test('a superseded action cannot release the busy lock of a reopened session',async()=>{
 const w=view(),old=deferred<string>(),latest=deferred<string>();const first=w.operations.execute(()=>old.promise,w.success,w.error,w.onBusy,'Failed');w.operations.dispose();w.operations.start(w.onBusy);const second=w.operations.execute(()=>latest.promise,w.success,w.error,w.onBusy,'Failed');old.resolve('old');await first;assert.equal(w.busy.at(-1),true);latest.resolve('new');await second;assert.deepEqual(w.values,['new']);
});
test('late export text cannot open a share sheet after leaving the result',async()=>{
 for(const web of [false,true]){const r=runtime(),response=deferred<string>();r.adapter.web=web;let active=true;const pending=shareRunReport(()=>response.promise,()=>active,r.adapter);active=false;response.resolve('report');await pending;assert.equal(r.shares(),0);assert.equal(r.writes(),0);}
});
test('leaving during native availability checking still removes the temporary file',async()=>{
 const r=runtime(),response=deferred<boolean>(),started=deferred();r.adapter.available=()=>{started.resolve();return response.promise};let active=true;const pending=shareRunReport(async()=>'report',()=>active,r.adapter);await started.promise;active=false;response.resolve(true);await pending;assert.equal(r.shares(),0);assert.equal(r.deletes(),1);
});
test('temporary cleanup failures release the action lock and preserve a primary export error',async()=>{
 const w=view(),r=runtime();r.file.delete=()=>{throw Error('Cleanup failed')};await w.operations.execute(current=>shareRunReport(async()=>'report',current,r.adapter),w.success,w.error,w.onBusy,'Export failed');assert.match(w.errors[0],/temporary report file/);assert.equal(w.busy.at(-1),false);
 const primary=Error('Share failed');r.adapter.shareFile=async()=>{throw primary};await assert.rejects(shareRunReport(async()=>'report',()=>true,r.adapter),error=>error===primary);
});
test('Web sharing creates no native file and native share failures still clean up',async()=>{
 const web=runtime();web.adapter.web=true;await shareRunReport(async()=>'report',()=>true,web.adapter);assert.equal(web.shares(),1);assert.equal(web.writes(),0);assert.equal(web.deletes(),0);
 const native=runtime();native.adapter.available=async()=>false;await assert.rejects(shareRunReport(async()=>'report',()=>true,native.adapter),/unavailable/);assert.equal(native.deletes(),1);
});
