import test from 'node:test';import assert from 'node:assert/strict';
import {reviewSummary} from '../src/reviewSummary';import type {RunResult} from '../src/types';
const base:RunResult={analysis:{},evidence:[],external_actions_performed:false};
test('local results do not invent model approval or role activity',()=>{const view=reviewSummary(base);assert.equal(view.verdict,'No model verdict recorded');assert.deepEqual(view.roles,[])});
test('review summary preserves plan, issues and actual fallback provenance',()=>{
 const view=reviewSummary({...base,plan:{objective:'Check inputs',steps:['Analyze'],missing_information:['Source date']},critique:{verdict:'accept',issues:['Check freshness']},draft:{next_steps:['Confirm records']},retrieval_warnings:['No vectors'],usage:[{role:'critic',usage:{model:'llama-3.3-70b-versatile',fallback:true,fallback_reason:'all_keys_http_429'}}]});
 assert.deepEqual(view.steps,['Analyze']);assert.deepEqual(view.missing,['Source date']);assert.deepEqual(view.issues,['Check freshness']);assert.deepEqual(view.warnings,['No vectors']);assert.equal(view.roles[0].role,'Auditor');assert.ok(view.roles[0].fallback);assert.equal(view.roles[0].reason,'all_keys_http_429');
});
test('human-review decision takes precedence over a model verdict',()=>{assert.equal(reviewSummary({...base,decision:'requires_human_review',critique:{verdict:'accept'}}).verdict,'Human review required')});
test('malformed optional metadata cannot fabricate a model name or crash',()=>{const view=reviewSummary({...base,plan:[],critique:null,usage:[null,4,{role:'critic',usage:null}]});assert.equal(view.roles.length,1);assert.equal(view.roles[0].model,'Not recorded');assert.equal(view.roles[0].fallback,false)});
