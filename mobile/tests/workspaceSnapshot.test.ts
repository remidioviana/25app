import test from 'node:test';
import assert from 'node:assert/strict';
import {copyWorkspaceDraft,emptyWorkspace} from '../src/forms';
import {numericInput} from '../src/experience/numericInput';
import {inputIssue} from '../src/validateInput';
import type {Schema} from '../src/types';
test('restoring an untouched workspace preserves unknown fields and the unsupplied flag',()=>{
 const empty=emptyWorkspace({type:'object',properties:{amount:{type:'number'},verified:{type:'boolean'},rows:{type:'array',items:{type:'string'}}}});const saved=copyWorkspaceDraft(empty),restored=copyWorkspaceDraft(saved);
 assert.deepEqual(restored,{draft:{amount:null,verified:null,rows:[]},example:false,hasInputs:false});
});
test('restoration preserves supplied and demonstration flags without treating them as authentication',()=>{
 for(const example of [false,true])for(const hasInputs of [false,true]){
  const snapshot=copyWorkspaceDraft({draft:{amount:17},example,hasInputs});assert.equal(snapshot.example,example);assert.equal(snapshot.hasInputs,hasInputs);assert.deepEqual(snapshot.draft,{amount:17});
 }
});
test('example edits and subsequent restored-draft edits cannot mutate the original snapshot',()=>{
 const original={draft:{rows:[{amount:17}]},example:false,hasInputs:true};const snapshot=copyWorkspaceDraft(original);original.draft.rows[0].amount=99;
 const restored=copyWorkspaceDraft(snapshot);(restored.draft.rows as {amount:number}[])[0].amount=7;
 assert.deepEqual(snapshot.draft,{rows:[{amount:17}]});assert.notEqual(snapshot.draft,original.draft);assert.notEqual(restored.draft,snapshot.draft);
});

test('invalid editor numbers remain invalid after snapshot and restoration rather than becoming null',()=>{
 const schema:Schema={type:'object',properties:{rows:{type:'array',items:{type:'object',properties:{amount:{type:['number','null']}}}}}};
 for(const amount of [numericInput('invalid'),Infinity,-Infinity]){
  const original={draft:{rows:[{amount}]},example:false,hasInputs:true};const issue=inputIssue(original.draft,schema);assert.notEqual(issue,null);
  const restored=copyWorkspaceDraft(copyWorkspaceDraft(original));assert.equal(inputIssue(restored.draft,schema),issue);const value=(restored.draft.rows as {amount:number}[])[0].amount;assert.ok(Object.is(value,amount));
 }
});
test('snapshot copying preserves explicit null, zero and signed zero without prototype mutation',()=>{
 const draft=JSON.parse('{"__proto__":{"record":"kept"},"missing":null,"zero":0}');draft.signedZero=-0;const restored=copyWorkspaceDraft({draft,example:false,hasInputs:true});
 assert.equal(restored.draft.missing,null);assert.equal(restored.draft.zero,0);assert.ok(Object.is(restored.draft.signedZero,-0));assert.ok(Object.hasOwn(restored.draft,'__proto__'));assert.equal(Object.getPrototypeOf(restored.draft),Object.prototype);assert.deepEqual(restored.draft['__proto__'],{record:'kept'});
});
