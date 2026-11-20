import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function setup(mode:string){const w=workspace();w.run('config={model_configured:true,langgraph_available:true};renderConnectors=async()=>{};renderInput=renderInputOriginal;renderInput();');w.nodes['#mode'].value=mode;w.nodes['#mode'].onchange({target:w.nodes['#mode']});return w}
function selectedMode(w:ReturnType<typeof workspace>){const select=w.nodes['#left'].innerHTML.match(/<select id="mode">([\s\S]*?)<\/select>/)![1];return select.match(/<option value="([^"]+)"[^>]*\bselected\b/)![1]}
test('form rebuilds preserve each chosen execution mode through examples and JSON editing',()=>{
 for(const mode of ['local','model','team']){
  const w=setup(mode);w.run('inputs={amount:17};hasInputs=true;loadExample();');assert.equal(selectedMode(w),mode);
  w.run('restoreExample();');assert.equal(selectedMode(w),mode);assert.deepEqual(w.state().inputs,{amount:17});
  w.nodes['#toggle-view'].onclick();assert.equal(selectedMode(w),mode);w.nodes['#payload'].value='{"amount":23}';w.nodes['#toggle-view'].onclick();assert.equal(selectedMode(w),mode);
  w.run('tab="history";tab="input";renderInput();');assert.equal(selectedMode(w),mode);
 }
});
test('adding and removing form rows preserves AI team selection',()=>{
 const w=setup('team'),add={dataset:{add:'["rows"]'},onclick:null as any},remove={dataset:{remove:'["rows",0]'},onclick:null as any};
 w.lists['[data-add]']=[add];w.lists['[data-remove]']=[remove];w.run('selected.schema.properties.rows={type:"array",items:{type:"object",properties:{name:{type:"string"}}}};inputs={rows:[]};renderInput();');
 add.onclick();assert.equal(selectedMode(w),'team');assert.deepEqual(w.state().inputs,{rows:[{name:''}]});remove.onclick();assert.equal(selectedMode(w),'team');assert.deepEqual(w.state().inputs,{rows:[]});
});
test('the preserved selected option is submitted, while opening another app resets to local',async()=>{
 const w=setup('model');w.run('inputs={amount:17};hasInputs=true;renderInput();');w.nodes['#mode'].value=selectedMode(w);let submitted:any;
 w.setAPI(async(path,method,data)=>{submitted=data;return {id:'new',status:'completed'}});await w.run('runTask()');assert.equal(submitted.mode,'model');
 w.run('openAgent("b");renderInput();');assert.equal(selectedMode(w),'local');assert.equal(w.state().hasInputs,false);
});
