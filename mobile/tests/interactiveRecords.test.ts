import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog';
import {interactiveRecords} from '../src/experience/interactiveRecords';
const ids=Object.keys(catalog) as (keyof typeof catalog)[];
test('23 domain scenes use entered data, distinct semantic views and finite measurements',()=>{
 const scenes=ids.filter(id=>!['iqamah','istithmar'].includes(id)).map(id=>{
  const source=catalog[id].example,before=JSON.stringify(source),scene=interactiveRecords(id,source);
  assert.ok(scene,id);assert.ok(scene.records.length,id);assert.equal(JSON.stringify(source),before);
  for(const record of scene.records){assert.ok(Number.isFinite(record.value));assert.ok(record.label);assert.ok(record.detail)}
  assert.equal(new Set(scene.records.map(x=>x.id)).size,scene.records.length);
  return scene;
 });
 assert.equal(scenes.length,23);assert.equal(new Set(scenes.map(x=>x.view)).size,23);
 assert.equal(interactiveRecords('iqamah',catalog.iqamah.example),null);
 assert.equal(interactiveRecords('istithmar',catalog.istithmar.example),null);
});
test('edited receipts deduplicate IDs; amounts and verification stay synchronized',()=>{
 const input=structuredClone(catalog.manzil.example) as Record<string,any>;
 let scene=interactiveRecords('manzil',input)!;assert.equal(scene.records.length,2);assert.equal(scene.records[1].state,'attention');
 input.transactions[2].amount=75;input.transactions[2].verified=true;
 scene=interactiveRecords('manzil',input)!;assert.equal(scene.records[1].value,75);assert.equal(scene.records[1].state,'recorded');
});
test('unknown access is never displayed as confirmed accessibility',()=>{
 const input=structuredClone(catalog.himam.example) as Record<string,any>;const before=interactiveRecords('himam',input)!;
 assert.equal(before.records[0].state,'unknown');assert.match(before.records[0].detail,/unknown/);
 input.routes[0].segments[1].access.step_free=true;
 assert.equal(interactiveRecords('himam',input)!.records[0].state,'recorded');
});
test('return dates before purchase fail the policy gate; both budget and text edits recompute',()=>{
 const refund={...catalog.khidmah.example,as_of:'2026-11-01'};
 assert.equal(interactiveRecords('khidmah',refund)!.records[1].state,'attention');
 const ledger=structuredClone(catalog.mizan.example) as Record<string,any>;ledger.transactions[0].amount=1000;
 assert.equal(interactiveRecords('mizan',ledger)!.records[0].state,'attention');
 const copy={...catalog.adab.example,copy:'Short'};assert.equal(interactiveRecords('adab',copy)!.records[0].value,5);
});
test('empty typed collections produce empty scenes rather than fabricated metrics',()=>{
 assert.deepEqual(interactiveRecords('adl',{...catalog.adl.example,events:[]})!.records,[]);
 assert.equal(interactiveRecords('amanah-eco',{...catalog['amanah-eco'].example,current_days:0})!.records[1].state,'unknown');
});
