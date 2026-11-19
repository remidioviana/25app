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
test('invalid and reversed day blocks remain unavailable, while valid zero duration is explicit',()=>{
 for(const [start,end] of [['25:00','26:00'],['9:3','10:00'],['12:00','11:00'],['','10:00']]){
  const input={...catalog.rafiq.example,busy:[{title:'Block',start,end}]};
  const record=interactiveRecords('rafiq',input)!.records[0];
  assert.equal(record.available,false,`${start}–${end}`);assert.equal(record.state,'unknown');
 }
 for(const [start,end,expected] of [['09:00','09:00',0],['09:00','10:30',90]] as const){
  const record=interactiveRecords('rafiq',{...catalog.rafiq.example,busy:[{title:'Block',start,end}]})!.records[0];
  assert.equal(record.available,true);assert.equal(record.value,expected);
 }
});
test('empty route evidence and missing needs never establish access; explicit barriers are flagged',()=>{
 const input=structuredClone(catalog.himam.example) as Record<string,any>;
 input.routes[0].segments=[];
 assert.equal(interactiveRecords('himam',input)!.records[0].state,'unknown');
 input.needs=[];
 assert.equal(interactiveRecords('himam',input)!.records[1].state,'unknown');
 input.needs=['step_free'];input.routes[0].segments=[{name:'Stairs',access:{step_free:false}}];
 const record=interactiveRecords('himam',input)!.records[0];
 assert.equal(record.state,'attention');assert.match(record.detail,/reported barrier/);
});
test('budget visualizations use reconciled decimal totals without false overruns',()=>{
 const input={currency:'AED',budgets:{food:.3},transactions:[{id:'a',category:'food',amount:.1,verified:true},{id:'b',category:'food',amount:.2,verified:true}]};
 const record=interactiveRecords('mizan',input)!.records[0];
 assert.equal(record.value,.3);assert.equal(record.state,'recorded');
 input.transactions[1].amount=.21;
 assert.equal(interactiveRecords('mizan',input)!.records[0].state,'attention');
});
test('unbudgeted spending remains visible and duplicate IDs stay excluded',()=>{
 const input={currency:'AED',budgets:{food:10},transactions:[{id:'a',category:'transport',amount:2.5,verified:true},{id:'a',category:'transport',amount:20,verified:true}]};
 const records=interactiveRecords('mizan',input)!.records;
 assert.equal(records.length,2);assert.equal(records[0].label,'food');assert.equal(records[0].value,0);
 assert.equal(records[1].label,'transport');assert.equal(records[1].value,2.5);assert.equal(records[1].state,'unknown');
 assert.match(records[1].detail,/No category budget supplied/);assert.match(records[1].detail,/1 duplicate IDs excluded/);
});
test('food rescue flags expiry and arrival boundaries using timezone-aware reference times',()=>{
 const input={as_of:'2026-11-14T12:00:00+04:00',lot:{quantity:1,expires:'2026-11-14T12:30:00+04:00',allergens_known:true,allergens:[],handling_verified:true},recipients:[{name:'Recipient',capacity:2,excluded_allergens:[],travel_minutes:29}]};
 assert.equal(interactiveRecords('hisad',input)!.records[0].state,'recorded');
 input.recipients[0].travel_minutes=30;
 let record=interactiveRecords('hisad',input)!.records[0];assert.equal(record.state,'attention');assert.match(record.detail,/reaches expiry or later/);
 input.lot.expires='2026-11-14T07:59:00Z';
 record=interactiveRecords('hisad',input)!.records[0];assert.equal(record.state,'attention');assert.match(record.detail,/Expired/);
 for(const expires of ['2026-11-14T13:00:00','2026-02-30T13:00:00+04:00','invalid']){
  input.lot.expires=expires;record=interactiveRecords('hisad',input)!.records[0];assert.equal(record.state,'unknown');assert.match(record.detail,/timing unknown/);
 }
});
test('return window rejects normalized impossible dates and requires date-only input',()=>{
 for(const date of ['2026-02-30','2026-02-29','2026-13-01','2026-11-14T00:00:00Z']){
  for(const field of ['purchase_date','as_of']){
   const record=interactiveRecords('khidmah',{...catalog.khidmah.example,[field]:date})!.records[1];
   assert.equal(record.available,false,field+': '+date);assert.equal(record.state,'unknown');
  }
 }
 const leap=interactiveRecords('khidmah',{...catalog.khidmah.example,purchase_date:'2028-02-29',as_of:'2028-03-01',return_window_days:1})!.records[1];
 assert.equal(leap.available,true);assert.equal(leap.value,1);assert.equal(leap.state,'recorded');
});
test('editorial limits count Unicode code points like the backend for Arabic and emoji',()=>{
 const input={...catalog.adab.example,copy:'مرحبا 🌍',approved_claims:['🌍'],max_characters:7};
 const records=interactiveRecords('adab',input)!.records;
 assert.equal(records[0].value,7);assert.equal(records[0].state,'recorded');assert.equal(records[1].value,1);
 input.max_characters=6;
 assert.equal(interactiveRecords('adab',input)!.records[0].state,'attention');
 const combined=interactiveRecords('adab',{...input,copy:'e\u0301',max_characters:2})!.records[0];
 assert.equal(combined.value,2);assert.equal(combined.state,'recorded');
 const source=interactiveRecords('turath',{topics:[],sources:[{title:'Excerpt',topics:[],excerpt:'🌍',reference:'test:1'}]})!.records[0];
 assert.equal(source.value,1);
});
test('campaign flags are case-insensitive and agree for expanded Unicode folds',()=>{
 for(const [copy,term] of [['Guaranteed delivery','guaranteed'],['STRASSE','Straße'],['ΟΣ','ος'],['مرحبا بالعالم','مرحبا']]){
  const record=interactiveRecords('adab',{...catalog.adab.example,copy,prohibited_terms:[term],max_characters:100})!.records[0];
  assert.equal(record.state,'attention',copy);assert.match(record.detail,/Flagged terms:/);
 }
 const accent=interactiveRecords('adab',{...catalog.adab.example,copy:'café',prohibited_terms:['cafe'],max_characters:100})!.records[0];
 assert.equal(accent.state,'recorded');
});
test('service document checkpoints flag expiry while preserving date-boundary semantics',()=>{
 const input={as_of:'2026-11-14',requirements:['identity'],documents:[{name:'identity',expires:'2026-11-13',reference:'doc:1'}]};
 let record=interactiveRecords('sahil',input)!.records[0];assert.equal(record.state,'attention');assert.equal(record.value,1);assert.match(record.detail,/Expired/);
 input.documents[0].expires='2026-11-14';
 record=interactiveRecords('sahil',input)!.records[0];assert.equal(record.state,'recorded');assert.match(record.detail,/does not establish authenticity/);
 input.documents[0].expires='';assert.equal(interactiveRecords('sahil',input)!.records[0].state,'unknown');
 input.documents=[];record=interactiveRecords('sahil',input)!.records[0];assert.equal(record.state,'attention');assert.equal(record.value,0);
});
test('ambiguous or malformed document records cannot produce a confirmed checkpoint',()=>{
 const base={as_of:'2026-11-14',requirements:['identity'],documents:[{name:'identity',expires:'2027-01-01',reference:'doc:1'}]};
 const duplicate={...base,documents:[...base.documents,{...base.documents[0],expires:'2025-01-01'}]};
 let record=interactiveRecords('sahil',duplicate)!.records[0];assert.equal(record.state,'unknown');assert.equal(record.available,false);assert.match(record.detail,/duplicate/);
 for(const input of [{...base,as_of:'2026-02-30'},{...base,documents:[{...base.documents[0],expires:'2026-02-30'}]}]){
  record=interactiveRecords('sahil',input)!.records[0];assert.equal(record.state,'unknown');assert.equal(record.available,false);
 }
 assert.deepEqual(interactiveRecords('sahil',{...base,requirements:[]})!.records,[]);
});
