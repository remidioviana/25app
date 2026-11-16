import test from 'node:test';
import assert from 'node:assert/strict';
import {claimEvidence} from '../src/claimEvidence';
import type {RunResult, Json} from '../src/types';
const base:RunResult={analysis:{},evidence:[],external_actions_performed:false};
const source={citation:'doc:0',title:'User document',text:'Saved excerpt',source:'Provided file',as_of:''};
test('local results and malformed claims create no invented claims',()=>{
 for(const draft of [undefined,null,[],{claims:[null,1,{}, {text:' '}]}] as (Json | undefined)[])assert.deepEqual(claimEvidence({...base,draft}),[]);
});
test('citations resolve only against the saved run evidence and deduplicate',()=>{
 const claims=claimEvidence({...base,evidence:[source],draft:{claims:[{text:'Claim',basis:'evidence',citations:['doc:0','doc:0','unknown:1']}]}});
 assert.equal(claims[0].references.length,2);assert.deepEqual(claims[0].references[0].source,source);
 assert.equal(claims[0].references[1].source,undefined);assert.equal(claims[0].missingCitation,false);
});
test('evidence claims with absent or invalid citations are flagged',()=>{
 for(const citations of [undefined,[],[null,1,' ']]){
 const claim:Record<string,import('../src/types').Json>={text:'Claim',basis:'evidence'};
 if(citations!==undefined)claim.citations=citations;
 assert.equal(claimEvidence({...base,draft:{claims:[claim]}})[0].missingCitation,true);
 }
});
test('input, calculation and unknown basis remain distinct',()=>{
 const claims=claimEvidence({...base,draft:{claims:['input','calculation','other'].map(basis=>({text:'Claim',basis,citations:[]}))}});
 assert.deepEqual(claims.map(x=>x.basis),['Supplied input','Tool calculation','Basis not recorded']);
 assert.ok(claims.every(x=>!x.missingCitation));
});
