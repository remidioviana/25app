import test from 'node:test';
import assert from 'node:assert/strict';
import {temporaryReportName,ownedTemporaryReport,cleanupTemporaryReport} from '../src/temporaryReport';
function storage(){let exists=false,content='',deletes=0;return {get exists(){return exists},uri:'cache:report',create(options:{overwrite:boolean}){assert.equal(options.overwrite,false);if(exists)throw Error('Already exists');exists=true},write(text:string){content=text},delete(){exists=false;deletes++},content:()=>content,deletes:()=>deletes}}
test('two exports of the same report receive separate cache names',()=>{
 const first=temporaryReportName('agent-case','md','00000000-0000-4000-8000-000000000001'),second=temporaryReportName('agent-case','md','00000000-0000-4000-8000-000000000002');assert.notEqual(first,second);assert.ok(first.endsWith('.md'));assert.throws(()=>temporaryReportName('../outside','md','00000000-0000-4000-8000-000000000001'));assert.throws(()=>temporaryReportName('report','../md','bad'));
});
test('failed exclusive creation cannot overwrite or delete another export',()=>{
 const file=storage(),owner=ownedTemporaryReport(file),other=ownedTemporaryReport(file);owner.create();owner.write('First report');assert.throws(()=>other.create(),/Already exists/);assert.throws(()=>other.write('Replacement'),/not created/);assert.equal(cleanupTemporaryReport(other),true);assert.equal(file.content(),'First report');assert.equal(file.exists,true);assert.equal(file.deletes(),0);assert.equal(cleanupTemporaryReport(owner),true);assert.equal(file.deletes(),1);
});
test('out-of-order cleanup removes only the file owned by that export',()=>{
 const first=storage(),second=storage(),a=ownedTemporaryReport(first),b=ownedTemporaryReport(second);a.create();b.create();a.write('Older');b.write('Newer');cleanupTemporaryReport(a);assert.equal(first.exists,false);assert.equal(second.exists,true);assert.equal(second.content(),'Newer');cleanupTemporaryReport(b);assert.equal(second.exists,false);
});
test('cleanup failures are contained and can be retried without losing ownership',()=>{
 const file=storage(),originalDelete=file.delete;file.delete=()=>{throw Error('Cleanup blocked')};const report=ownedTemporaryReport(file);report.create();assert.equal(cleanupTemporaryReport(report),false);assert.equal(report.exists,true);file.delete=originalDelete;assert.equal(cleanupTemporaryReport(report),true);assert.equal(report.exists,false);assert.equal(cleanupTemporaryReport(undefined),true);
});
