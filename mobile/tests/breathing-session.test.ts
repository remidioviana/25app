import test from 'node:test';
import assert from 'node:assert/strict';
import {startBreath,advanceBreath,pauseBreath,resumeBreath,stopBreath,breathPhase} from '../src/experience/breathingSession';
import {makeRoutine} from '../src/experience/nafasRoutine';
const config={inhaleSeconds:4,exhaleSeconds:6,durationSeconds:30};
test('the pacing clock completes exactly once and does not accumulate paused or background time',()=>{
 let s=startBreath('p',config,0);s=pauseBreath(s,3500);assert.equal(s.status,'paused');assert.equal(s.elapsedMs,3500);assert.equal(advanceBreath(s,90000),s);s=resumeBreath(s,90000);s=advanceBreath(s,91000);assert.equal(s.elapsedMs,4500);assert.equal(breathPhase(s).name,'Exhale');s=advanceBreath(s,120000);assert.equal(s.status,'completed');assert.equal(s.elapsedMs,30000);assert.equal(advanceBreath(s,150000),s);assert.equal(resumeBreath(s,160000),s);
});
test('stopping preserves active duration and a backwards or invalid clock cannot invent elapsed time',()=>{
 let s=startBreath('p',config,500);assert.equal(advanceBreath(s,100),s);assert.equal(advanceBreath(s,NaN),s);s=stopBreath(s,1750);assert.equal(s.status,'stopped');assert.equal(s.elapsedMs,1250);assert.equal(resumeBreath(s,8000),s);
});
test('a chosen pace is snapshotted and configurations outside safe product bounds are rejected',()=>{
 const chosen={...config};const s=startBreath('p',chosen,0);chosen.durationSeconds=60;assert.equal(s.config.durationSeconds,30);assert.throws(()=>startBreath('p',{...config,durationSeconds:0},0));assert.throws(()=>startBreath('p',{...config,inhaleSeconds:NaN},0));
});
test('a local routine crosses leap days without mutating selected activities or fabricating completion',()=>{
 const activities=['A quiet reflection'];const plan=makeRoutine('2028-02-28',3,activities);assert.deepEqual(plan.map(x=>x.date),['2028-02-28','2028-02-29','2028-03-01']);activities.push('New choice');assert.deepEqual(plan[0].activities,['A quiet reflection']);assert.throws(()=>makeRoutine('2027-02-29',1,['Walk']));assert.throws(()=>makeRoutine('2028-01-01',3,[]));
});
