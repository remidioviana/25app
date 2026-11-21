import test from 'node:test';
import assert from 'node:assert/strict';
import {copyWorkspaceDraft,emptyWorkspace} from '../src/forms';
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
