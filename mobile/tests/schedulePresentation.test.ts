import test from 'node:test';
import assert from 'node:assert/strict';
import {schedulePresentation} from '../src/schedulePresentation';
import {workspace} from './webWorkspaceHarness';
test('disabled schedules remain inactive regardless of remaining occurrences',()=>{
 assert.equal(schedulePresentation({enabled:0,mode:'local',example:0}).status,'Inactive');
 assert.equal(schedulePresentation({enabled:1,mode:'team',example:1}).status,'Active');
});
test('saved mode and input provenance are reported without inventing authentication',()=>{
 for(const [mode,label] of [['local','Local tools'],['model','AI agent'],['team','AI team']] as const){
  for(const value of [true,1])assert.deepEqual(schedulePresentation({enabled:1,mode,example:value}),{status:'Active',mode:label,provenance:'Demonstration inputs'});
  for(const value of [false,0])assert.equal(schedulePresentation({enabled:1,mode,example:value}).provenance,'Supplied inputs');
 }
 assert.equal(schedulePresentation({enabled:0,mode:'local'}).provenance,'Input provenance not reported');
});
test('Web schedules show persisted mode/provenance and never describe disabled runs as finished',async()=>{
 const w=workspace();w.setAPI(async()=>({schedules:[{id:'demo',goal:'Sample plan',mode:'team',example:1,enabled:0,remaining:7,next_at_iso:'2026-12-01T09:00:00Z'},{id:'supplied',goal:'Supplied plan',mode:'model',example:0,enabled:1,remaining:1,next_at_iso:'2026-12-01T09:00:00Z'},{id:'legacy',goal:'Legacy plan',enabled:0,remaining:0,next_at_iso:'2026-12-01T09:00:00Z'}]}));
 await w.run('tab="schedules";isExample=true;renderSchedules()');const html=w.nodes['#left'].innerHTML;
 assert.match(html,/AI team · Demonstration inputs/);assert.match(html,/AI agent · Supplied inputs/);assert.match(html,/Mode not reported · Input provenance not reported/);assert.match(html,/Inactive · next:.*remaining: 7/);assert.ok(!html.includes('Finished'));assert.match(html,/Inputs: Demonstration inputs/);
});
