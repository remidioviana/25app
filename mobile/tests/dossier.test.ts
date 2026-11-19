import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessDossier,dossierIssue,isCalendarDate} from '../src/dossier';

test('dossier separates missing, expired and present-unverified without eligibility score',()=>{
  const result=assessDossier({as_of:'2026-11-14',requirements:['passport','income','letter','other'],documents:[{name:'passport',expires:'2028-01-01',reference:'passport.pdf, p.1'},{name:'income',expires:'2026-11-13',reference:'statement.pdf'},{name:'letter',expires:'',reference:''}]});
  assert.deepEqual(result.counts,{missing:1,expired:1,present_unverified:2});
  assert.equal(result.checks[3].reference,null);
  assert.equal(result.checks[2].expires,null);
  assert.equal(result.checks[2].reference,'');
  assert.equal('score' in result,false);
  assert.match(result.note,/do not establish/);
});

test('expiry equal to the supplied review date remains present but unverified',()=>{
  const result=assessDossier({as_of:'2026-11-14',requirements:['passport'],documents:[{name:'passport',expires:'2026-11-14',reference:'p.1'}]});
  assert.equal(result.checks[0].status,'present_unverified');
});

test('date parsing rejects normalized dates, timezones, year zero and non-leap century',()=>{
  for(const d of ['2026-02-29','2026-04-31','1900-02-29','0000-01-01','2026-11-14T00:00:00Z','2026-1-01','2026-13-01'])assert.equal(isCalendarDate(d),false,d);
  for(const d of ['2000-02-29','2028-02-29','0001-01-01','2026-11-14'])assert.equal(isCalendarDate(d),true,d);
});

test('ambiguous duplicates and empty or malformed checklists are rejected',()=>{
  const base={as_of:'2026-11-14',requirements:['passport'],documents:[] as {name:string;expires:string;reference:string}[]};
  assert.match(dossierIssue({...base,requirements:[]})!,/at least one/);
  assert.match(dossierIssue({...base,requirements:['passport','passport']})!,/duplicate/);
  assert.match(dossierIssue({...base,documents:[{name:'passport',expires:'',reference:'a'},{name:'passport',expires:'',reference:'b'}]})!,/duplicate document/);
  assert.match(dossierIssue({...base,documents:[{name:'passport',expires:'2026-02-30',reference:'a'}]})!,/expiry/);
  assert.match(dossierIssue({...base,requirements:['  ']})!,/non-empty/);
  assert.throws(()=>assessDossier({...base,as_of:'not a date'}),/review date/);
});

test('matching is exact, no record is silently promoted to an official requirement',()=>{
  const input={as_of:'2026-11-14',requirements:['passport'],documents:[{name:'Passport',expires:'2028-01-01',reference:'case differs'}]};
  const before=JSON.stringify(input);
  assert.equal(assessDossier(input).checks[0].status,'missing');
  assert.equal(JSON.stringify(input),before);
});

test('dossier names and references share schema Unicode character limits',()=>{
  const atLimit='🌍'.repeat(100000),tooLong=atLimit+'x';
  const input={as_of:'2026-11-14',requirements:[atLimit],documents:[{name:atLimit,expires:'',reference:atLimit}]};
  assert.equal(dossierIssue(input),null);
  assert.match(dossierIssue({...input,requirements:[tooLong]})!,/requirement/);
  assert.match(dossierIssue({...input,documents:[{...input.documents[0],name:tooLong}]})!,/document needs/);
  assert.match(dossierIssue({...input,documents:[{...input.documents[0],reference:tooLong}]})!,/reference/);
});
