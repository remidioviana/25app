import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareTender,tenderIssue,toggleTenderCapability,tenderReport} from '../src/experience/tenderPreparation';
const input={requirements:['ISO9001','delivery_plan','references'],capabilities:['delivery_plan','references','other'],deadline:'2026-12-01',as_of:'2026-11-14'};
test('bid gaps and calendar distance derive from exact recorded inputs without a qualification score',()=>{
 const plan=prepareTender(input);assert.equal(plan.gaps,1);assert.equal(plan.recorded_matches,2);assert.equal(plan.calendar_days_between_dates,17);assert.equal(plan.deadline_state,'before_recorded_deadline');assert.equal('qualification_score'in plan,false);
 assert.equal(prepareTender({...input,as_of:'2026-12-01'}).deadline_state,'same_calendar_date');assert.equal(prepareTender({...input,as_of:'2026-12-02'}).calendar_days_between_dates,-1);
});
test('calendar differences preserve leap days and years below 100 without timezone normalization',()=>{
 assert.equal(prepareTender({...input,as_of:'2028-02-28',deadline:'2028-03-01'}).calendar_days_between_dates,2);
 assert.equal(prepareTender({...input,as_of:'0001-01-01',deadline:'0001-01-02'}).calendar_days_between_dates,1);
 assert.match(tenderIssue({...input,deadline:'2027-02-29'})!,/dates/);assert.throws(()=>prepareTender({...input,requirements:[]}),/requirement/);assert.match(tenderIssue({...input,requirements:['a','a']})!,/duplicate/);
});
test('capability edits preserve unrelated records and do not mutate or normalize source names',()=>{
 const original=JSON.stringify(input),next=toggleTenderCapability(input,'ISO9001');assert.equal(prepareTender(next).gaps,0);assert(next.capabilities.includes('other'));assert.equal(JSON.stringify(input),original);assert.equal(prepareTender(toggleTenderCapability(next,'ISO9001')).gaps,1);assert.throws(()=>toggleTenderCapability(input,'iso9001'),/Select/);
});
test('preparation export reflects current dependencies without inventing evidence or submission',()=>{
 const report=JSON.parse(tenderReport(toggleTenderCapability(input,'references')));assert.equal(report.plan.gaps,2);assert.equal(report.submission_status,'not_submitted');assert.equal(report.document_evidence_verified,false);assert.equal(report.official_qualification_verified,false);assert.deepEqual(report.input.requirements,input.requirements);
});
