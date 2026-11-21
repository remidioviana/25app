import test from 'node:test';import assert from 'node:assert/strict';
import {reviewSummary} from '../src/reviewSummary';import type {Json,RunResult} from '../src/types';
const base:RunResult={analysis:{},evidence:[],external_actions_performed:false};
test('local results do not invent model approval or role activity',()=>{const view=reviewSummary(base);assert.equal(view.verdict,'No model verdict recorded');assert.deepEqual(view.roles,[])});
test('review summary preserves plan, issues and actual fallback provenance',()=>{
 const view=reviewSummary({...base,plan:{objective:'Check inputs',steps:['Analyze'],missing_information:['Source date']},critique:{verdict:'accept',issues:['Check freshness']},draft:{next_steps:['Confirm records']},retrieval_warnings:['No vectors'],usage:[{role:'critic',usage:{model:'llama-3.3-70b-versatile',fallback:true,fallback_reason:'all_keys_http_429'}}]});
 assert.deepEqual(view.steps,['Analyze']);assert.deepEqual(view.missing,['Source date']);assert.deepEqual(view.issues,['Check freshness']);assert.deepEqual(view.warnings,['No vectors']);assert.equal(view.roles[0].role,'Auditor');assert.ok(view.roles[0].fallback);assert.equal(view.roles[0].reason,'all_keys_http_429');
});
test('human-review decision takes precedence over a model verdict',()=>{assert.equal(reviewSummary({...base,decision:'requires_human_review',critique:{verdict:'accept'}}).verdict,'Human review required')});
test('malformed optional metadata cannot fabricate a model name or crash',()=>{const view=reviewSummary({...base,plan:[],critique:null,usage:[null,4,{role:'critic',usage:null}]});assert.equal(view.roles.length,1);assert.equal(view.roles[0].model,'Not recorded');assert.equal(view.roles[0].fallback,false)});

test('completed final answer takes precedence over superseded revision feedback',()=>{
 const view=reviewSummary({...base,decision:'reviewed_by_model',critique:{verdict:'revise',issues:['Earlier issue']},plan:{missing_information:['Previously missing']},final_response:{outcome:'answered',questions:[],limitations:[]}});
 assert.equal(view.verdict,'Final answer completed by auditor');assert.deepEqual(view.issues,[]);assert.deepEqual(view.missing,[]);assert.deepEqual(view.previousIssues,['Earlier issue']);
});
test('incomplete final outcomes show limitations and questions without generic human review',()=>{
 const view=reviewSummary({...base,decision:'inconclusive',critique:{verdict:'accept'},final_response:{outcome:'inconclusive',questions:[],limitations:['Missing current source']}});
 assert.equal(view.verdict,'Answer limited by available evidence');assert.deepEqual(view.issues,['Missing current source']);
 const missing=reviewSummary({...base,decision:'needs_information',final_response:{outcome:'needs_information',questions:['Which deadline?'],limitations:[]}});
 assert.equal(missing.verdict,'More information needed');assert.deepEqual(missing.missing,['Which deadline?']);
});
test('malformed or inconsistent final metadata cannot invent final approval',()=>{
 const view=reviewSummary({...base,decision:'inconclusive',final_response:{outcome:'answered',questions:[],limitations:[]}});
 assert.equal(view.verdict,'Answer limited by available evidence');
 assert.equal(reviewSummary({...base,final_response:{outcome:'answered'}}).verdict,'No model verdict recorded');
});

test('answered metadata with unresolved questions or limitations cannot imply a completed final answer',()=>{
 const finals:Json[]=[{outcome:'answered',questions:['Which date?'],limitations:[]},{outcome:'answered',questions:[],limitations:['No current source']},{outcome:'answered'},{outcome:'answered',questions:'bad shape',limitations:[]}];
 for(const final of finals){
  const view=reviewSummary({...base,decision:'reviewed_by_model',critique:{verdict:'accept'},final_response:final});assert.equal(view.verdict,'Final answer outcome not verified');
 }
});
test('uncertain final metadata keeps its questions and limitations visible',()=>{
 const view=reviewSummary({...base,decision:'reviewed_by_model',plan:{missing_information:['Old question']},critique:{verdict:'revise',issues:['Earlier issue']},final_response:{outcome:'answered',questions:['Which date?'],limitations:['No current source']}});
 assert.deepEqual(view.missing,['Which date?']);assert.deepEqual(view.issues,['No current source']);assert.deepEqual(view.previousIssues,['Earlier issue']);assert.equal(view.verdict,'Final answer outcome not verified');
});
test('final-only review records remain visible while local results do not invent a review panel',()=>{
 assert.equal(reviewSummary(base).visible,false);assert.equal(reviewSummary({...base,usage:[null,4]}).visible,false);
 for(const decision of ['needs_information','inconclusive','requires_human_review'])assert.equal(reviewSummary({...base,decision}).visible,true);
 assert.equal(reviewSummary({...base,decision:'needs_information',final_response:{outcome:'needs_information',questions:['Which deadline?'],limitations:[]}}).visible,true);
 const legacy=reviewSummary({...base,decision:'reviewed_by_model',critique:{verdict:'accept'}});assert.equal(legacy.visible,true);assert.equal(legacy.verdict,'Model reviewer accepted');
});
