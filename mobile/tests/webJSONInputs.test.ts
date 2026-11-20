import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
const invalid=['null','[]','[1,2]','"text"','42','true','{broken'];
function draft(raw:string){const w=workspace();w.run('renderConnectors=async()=>{};inputs={amount:17};hasInputs=true;view="json";renderInputOriginal();');w.nodes['#payload'].value=raw;return w}
test('non-object JSON cannot strand the form or overwrite the previous draft',()=>{
 for(const raw of invalid){const w=draft(raw);w.nodes['#toggle-view'].onclick();assert.equal(w.state().view,'json');assert.deepEqual(w.state().inputs,{amount:17});assert.equal(w.nodes['#payload'].value,raw);assert.match(w.state().notices.at(-1),/Invalid JSON/);}
});
test('invalid JSON roots cannot start missions or replace drafts with examples',async()=>{
 for(const raw of invalid){const w=draft(raw);let writes=0;w.setAPI(async()=>{writes++;return {id:'unexpected'}});await w.run('runTask()');w.run('loadExample()');assert.equal(writes,0);assert.deepEqual(w.state().inputs,{amount:17});assert.equal(w.state().beforeExample,null);assert.equal(w.nodes['#run'].disabled,false);assert.equal(w.nodes['#payload'].value,raw);}
});
test('tab navigation keeps invalid JSON visible for correction',()=>{
 for(const raw of invalid){const w=draft(raw),button={dataset:{tab:'history'},classList:{toggle:()=>{}},onclick:null as any};w.lists['[data-tab]']=[button];w.run('renderLeft=()=>{};workspaceOriginal();');button.onclick();assert.equal(w.run('tab'),'input');assert.deepEqual(w.state().inputs,{amount:17});assert.equal(w.nodes['#payload'].value,raw);}
});
test('valid objects including additional nested fields render without losing data',()=>{
 const w=draft('{"custom":{"rows":[{"nested":{"count":2}}]},"amount":17}');w.run('renderInput=renderInputOriginal;');w.nodes['#toggle-view'].onclick();assert.equal(w.state().view,'form');assert.deepEqual(w.state().inputs,{custom:{rows:[{nested:{count:2}}]},amount:17});assert.match(w.nodes['#left'].innerHTML,/count/);assert.ok(!w.nodes['#left'].innerHTML.includes('data-add='));
});
