import test from 'node:test';
import assert from 'node:assert/strict';
import {designs} from '../src/experience/designs';
import {briefs,reconcileBrief} from '../src/experience/briefs';
import type {PublicSourceRefresh} from '../src/types';
import {savedIntelligence,publicIntelligence} from '../src/experience/intelligence';
import rawIntelligence from '../src/experience/publicIntelligence.json';
function result():PublicSourceRefresh {const b=briefs.mizan;return {document_id:'verified-document',source_content:'\n'+b.quote.replaceAll(' ','\n')+'\n',receipt:{source_id:b.source_id,url:b.url,status:'retrieved',started_at:'2026-11-17T12:00:00Z',fetched_at:'2026-11-17T12:00:01Z',raw_sha256:'a'.repeat(64),text_sha256:'b'.repeat(64),external_write:false}}}
test('a displayed quote is refreshed only when the same official source actually contains it',()=>{const b=briefs.mizan,updated=reconcileBrief(b,result());assert.equal(updated?.fetched_at,'2026-11-17T12:00:01Z');assert.equal(updated?.quote,b.quote);assert.equal(b.raw_sha256,briefs.mizan.raw_sha256)});
test('source substitution, failed reads, missing provenance and changed quotations cannot acquire fresh timestamps',()=>{const b=briefs.mizan;for(const change of ['id','url','status','time','hash','quote']){const r=result();if(change==='id')r.receipt.source_id='other-source';if(change==='url')r.receipt.url='https://example.com/';if(change==='status')r.receipt.status='failed';if(change==='time')delete r.receipt.fetched_at;if(change==='hash')delete r.receipt.raw_sha256;if(change==='quote')r.source_content='The source no longer contains that claim.';assert.equal(reconcileBrief(b,r),null,change)}});
test('every app has a distinct composition, domain navigation and dated official reading',()=>{assert.equal(Object.keys(designs).length,25);assert.equal(new Set(Object.values(designs).map(d=>d.layout)).size,25);for(const [id,d] of Object.entries(designs)){const b=briefs[id as keyof typeof briefs];assert.ok(b,id);assert.ok(b.quote.length>20);assert.match(b.url,/^https:\/\//);assert.ok(Number.isFinite(Date.parse(b.fetched_at)));assert.match(b.text_sha256,/^[a-f\d]{64}$/);assert.equal(d.tabs.length,5);assert.equal(new Set(d.tabs).size,5);assert.equal(d.steps.length,3)}});
function luminance(hex:string){const [r,g,b]=hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b}
function ratio(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('body, secondary and action text meet normal-text contrast against their surfaces',()=>{for(const [id,d] of Object.entries(designs)){for(const surface of [d.bg,d.panel]){assert.ok(ratio(d.ink,surface)>=4.5,id+' body');assert.ok(ratio(d.muted,surface)>=4.5,id+' secondary');assert.ok(ratio(d.accent,surface)>=4.5,id+' link')}const buttonInk=luminance(d.accent)>.179?'#101B16':'#FFFFFF';assert.ok(ratio(buttonInk,d.accent)>=4.5,id+' button')}});

test('only archived actual model output is available as startup AI analysis',()=>{for(const id of Object.keys(briefs) as (keyof typeof briefs)[])assert.equal(!!savedIntelligence(id),Object.prototype.hasOwnProperty.call(rawIntelligence,id))});
test('startup analysis rejects fabricated role identity, foreign sources and contradictory approval',()=>{for(const kind of ['roles','source','claims','outcome']){const v=structuredClone(rawIntelligence.himayah);if(kind==='roles')v.model_roles.critic='openai/gpt-oss-20b';if(kind==='source')v.source.source_id='other-app';if(kind==='claims')v.analysis.draft.claims[0].citations=['invented:0'];if(kind==='outcome')v.analysis.outcome='answered';assert.equal(publicIntelligence(v,'himayah'),null,kind)}});


test('extra model metadata cannot disguise duplicate execution-role identities',()=>{
 const value=structuredClone(rawIntelligence.himayah);
 const models=value.model_roles as Record<string,unknown>;
 models.specialist=models.planner;models.extra='unrelated/model';
 assert.equal(publicIntelligence(value,'himayah'),null);
});

test('public analysis requires nonblank identities for each execution role',()=>{
 for(const role of ['planner','specialist'])for(const identity of ['', '   ',null,undefined]){
  const value=structuredClone(rawIntelligence.himayah);
  (value.model_roles as Record<string,unknown>)[role]=identity;
  assert.equal(publicIntelligence(value,'himayah'),null,role+': '+String(identity));
 }
 const value=structuredClone(rawIntelligence.himayah);
 (value.model_roles as Record<string,unknown>).extra='unrelated/model';
 assert.ok(publicIntelligence(value,'himayah'));
});


test('incomplete public analysis requires an explicit unresolved reason',()=>{
 for(const [outcome,field] of [['needs_information','questions'],['inconclusive','limitations']] as const){
  for(const items of [[],[''],['   '],[null]]){
   const value=structuredClone(rawIntelligence.himayah);
   (value.analysis as Record<string,unknown>).outcome=outcome;
   (value.analysis as Record<string,unknown>)[field]=items;
   assert.equal(publicIntelligence(value,'himayah'),null,outcome+': '+JSON.stringify(items));
  }
 }
});

test('public analysis preserves actual questions and limitations without inventing completion',()=>{
 for(const outcome of ['needs_information','inconclusive'] as const){
  const value=structuredClone(rawIntelligence.himayah);
  (value.analysis as Record<string,unknown>).outcome=outcome;
  (value.analysis as Record<string,unknown>).questions=['Which agreement date applies?'];
  value.analysis.limitations=['Only the cited public excerpt was analyzed.'];
  const parsed=publicIntelligence(value,'himayah');assert.ok(parsed);
  assert.equal(parsed.analysis.outcome,outcome);
  assert.deepEqual(parsed.analysis.questions,value.analysis.questions);
  assert.deepEqual(parsed.analysis.limitations,value.analysis.limitations);
 }
});
