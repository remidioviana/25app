import test from 'node:test';
import assert from 'node:assert/strict';
import {updateDossierRecord,dossierExport} from '../src/experience/dossierPreparation';
const input={as_of:'2026-11-17',requirements:['passport','income evidence'],documents:[{name:'passport',reference:'My passport, page 1',expires:'2028-01-01'}]};
test('editing adds, replaces and removes only the chosen record without mutating the draft',()=>{
 const before=JSON.stringify(input);const added=updateDossierRecord(input,'income evidence',{reference:'دخل.pdf, ص ٢',expires:''});
 assert.equal(added.documents.length,2);assert.equal(JSON.stringify(input),before);
 const replaced=updateDossierRecord(added,'passport',{reference:'Renewal receipt',expires:'2029-01-01'});
 assert.equal(replaced.documents.length,2);assert.equal(replaced.documents.find(x=>x.name==='passport')?.expires,'2029-01-01');
 assert.equal(updateDossierRecord(replaced,'passport',null).documents.length,1);
 assert.throws(()=>updateDossierRecord(input,'unknown',{reference:'x',expires:''}),/checklist/);
 assert.throws(()=>updateDossierRecord(input,'passport',{reference:'x',expires:'2027-02-29'}),/expiry/);
});
test('export retains exact editable records and unknown expiry without implying legal acceptance',()=>{
 const updated=updateDossierRecord(input,'income evidence',{reference:'income evidence.pdf, p.2',expires:''});
 const exported=JSON.parse(dossierExport(updated));assert.deepEqual(exported.input,updated);assert.equal(exported.assessment.counts.present_unverified,2);
 assert.equal(exported.document_authenticity_verified,false);assert.equal(exported.eligibility_determined,false);assert.equal(exported.application_submitted,false);assert.equal(exported.checklist_origin,'user_supplied');
 const original=JSON.parse(dossierExport(input));assert.equal(original.assessment.counts.missing,1);
 assert.throws(()=>dossierExport({...input,requirements:Array.from({length:10},(_,i)=>String(i)+'x'.repeat(60000))}),/500,000/);
});
