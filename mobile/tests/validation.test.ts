import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inputIssue} from '../src/validateInput';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
test('all 25 agent examples pass the mobile schema guard',()=>{
 const root=join(process.cwd(),'../agents');let count=0;
 for(const id of readdirSync(root)){try{const spec=JSON.parse(readFileSync(join(root,id,'agent.json'),'utf8'));assert.equal(inputIssue(spec.example,spec.schema),null,id);count++}catch(e){if(!['ENOENT','ENOTDIR'].includes((e as NodeJS.ErrnoException).code??''))throw e}}
 assert.equal(count,25);
});
test('rejects nonfinite numbers, wrong types, and out-of-range values',()=>{
 for(const value of [NaN,Infinity,-Infinity,null,true,'2',-1,11])assert.ok(inputIssue(value,{type:'number',minimum:0,maximum:10}));
 assert.equal(inputIssue(0,{type:'number',minimum:0}),null);
 assert.ok(inputIssue(1.2,{type:'integer'}));
});
test('nested fields report actionable paths and preserve input',()=>{
 const draft={rows:[{amount:null}]};const snapshot=JSON.stringify(draft);
 assert.match(inputIssue(draft,{type:'object',properties:{rows:{type:'array',items:{type:'object',properties:{amount:{type:'number'}}}}}})!,/Inputs.rows\[1\].amount/);
 assert.equal(JSON.stringify(draft),snapshot);
});
test('required, extra, nullable, lengths and dynamic properties',()=>{
 assert.ok(inputIssue({},{type:'object',required:['name']}));
 assert.ok(inputIssue({extra:1},{type:'object',additionalProperties:false}));
 assert.equal(inputIssue(null,{type:['boolean','null']}),null);
 assert.ok(inputIssue([1,2],{type:'array',maxItems:1,items:{type:'number'}}));
 assert.ok(inputIssue('abc',{type:'string',maxLength:2}));
 assert.equal(inputIssue('😀',{type:'string',maxLength:1}),null);
 assert.ok(inputIssue({budget:'bad'},{type:'object',additionalProperties:{type:'number'}}));
});
