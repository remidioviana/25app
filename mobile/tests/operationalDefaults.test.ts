import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {blank,emptyWorkspace} from '../src/forms';
import type {Json} from '../src/types';

function containsAssertion(value:Json):boolean {
 if(value===null||value==='')return false;
 if(Array.isArray(value))return value.length>0;
 if(typeof value==='object')return Object.values(value).some(containsAssertion);
 return true;
}

test('all 25 workspaces start without fabricated records, dates, amounts or yes/no assertions',()=>{
 const root=join(process.cwd(),'../agents');let count=0;
 for(const id of readdirSync(root)){
  let spec;try{spec=JSON.parse(readFileSync(join(root,id,'agent.json'),'utf8'))}catch(e){if(['ENOENT','ENOTDIR'].includes((e as NodeJS.ErrnoException).code??''))continue;throw e}
  const snapshot=JSON.stringify(spec),workspace=emptyWorkspace(spec.schema);
  assert.equal(workspace.example,false,id);assert.equal(workspace.hasInputs,false,id);
  assert.equal(containsAssertion(workspace.draft),false,id);
  assert.deepEqual(Object.keys(workspace.draft),Object.keys(spec.schema.properties),id);
  assert.notDeepEqual(workspace.draft,spec.example,id);
  assert.equal(JSON.stringify(spec),snapshot,id);count++;
 }
 assert.equal(count,25);
});

test('unentered numeric/boolean values remain unknown, while an explicit zero/false can be supplied',()=>{
 assert.deepEqual(blank({type:'object',properties:{amount:{type:'number'},confirmed:{type:'boolean'}}}),{amount:null,confirmed:null});
 const one=emptyWorkspace({type:'object',properties:{rows:{type:'array',items:{type:'number'}}}});
 const two=emptyWorkspace({type:'object',properties:{rows:{type:'array',items:{type:'number'}}}});
 (one.draft.rows as Json[]).push(0);
 assert.deepEqual(two.draft.rows,[]);
 assert.equal(containsAssertion({amount:0,confirmed:false}),true);
});
