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
