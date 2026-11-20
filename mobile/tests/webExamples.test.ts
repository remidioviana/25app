import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';

test('repeated Web example loads preserve the original draft and its provenance',()=>{
 const w=workspace();w.run('inputs={amount:1};hasInputs=true;loadExample();inputs.amount=99;loadExample();restoreExample();');
 assert.deepEqual(w.state().inputs,{amount:1});assert.equal(w.state().isExample,false);assert.equal(w.state().hasInputs,true);assert.equal(w.state().beforeExample,null);
 w.run('hasInputs=false;loadExample();restoreExample();');assert.equal(w.state().hasInputs,false);
});
test('Web restore cannot carry another app’s draft into the selected workspace',()=>{
 const w=workspace();w.run('inputs={amount:1};loadExample();openAgent("b");restoreExample();');
 assert.deepEqual(w.state().inputs,{});assert.equal(w.state().beforeExample,null);assert.equal(w.state().hasInputs,false);
});
test('Web examples preserve pending valid JSON edits and leave invalid JSON untouched',()=>{
 const w=workspace();w.nodes['#payload']={value:'{"amount":42}'};w.run('view="json";hasInputs=true;loadExample();restoreExample();');
 assert.deepEqual(w.state().inputs,{amount:42});assert.equal(w.state().view,'json');
 w.nodes['#payload'].value='{broken';w.run('loadExample();');assert.deepEqual(w.state().inputs,{amount:42});assert.equal(w.state().beforeExample,null);assert.equal(w.state().view,'json');
});

test('clearing inputs discards the previous-example snapshot and any restoration path',()=>{
 const w=workspace();w.run('renderConnectors=async()=>{};renderInput=renderInputOriginal;inputs={amount:99};hasInputs=true;loadExample();');
 assert.deepEqual(w.state().beforeExample.draft,{amount:99});w.nodes['#reset'].onclick();
 assert.deepEqual(w.state().inputs,{});assert.equal(w.state().hasInputs,false);assert.equal(w.state().isExample,false);assert.equal(w.state().beforeExample,null);
 assert.ok(!w.nodes['#left'].innerHTML.includes('id="example-restore"'));
 // A stale detached button must not be able to recover a cleared snapshot either.
 w.nodes['#example-restore'].onclick();assert.deepEqual(w.state().inputs,{});assert.equal(w.state().hasInputs,false);
});
test('an example loaded after clearing restores the new draft rather than deleted data',()=>{
 const w=workspace();w.run('renderConnectors=async()=>{};renderInput=renderInputOriginal;inputs={amount:99};hasInputs=true;loadExample();');w.nodes['#reset'].onclick();
 w.run('inputs={amount:7};markInputs();loadExample();restoreExample();');assert.deepEqual(w.state().inputs,{amount:7});assert.equal(w.state().isExample,false);assert.equal(w.state().beforeExample,null);
});
