import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';

test('result and history distinguish success, failure and unfinished states consistently',async()=>{
 const w=workspace();
 const runs=['queued','running','completed','failed','cancelled','unexpected','toString'].map(status=>({id:status,status,events:[],created:'2026-11-20T10:00:00Z',goal:'Test mission'}));
 w.setAPI(()=>Promise.resolve({runs}));await w.run('tab="history";renderHistory()');
 for(const run of runs){
  w.run(`currentRun=${JSON.stringify(run)};renderResultOriginal();`);
  const label=['queued','running','completed','failed','cancelled'].includes(run.status)?run.status[0].toUpperCase()+run.status.slice(1):'Unknown';
  const badge=run.status==='completed'?`<span class="chip good">${label}</span>`:run.status==='failed'?`<span class="chip failed">${label}</span>`:`<span class="chip">${label}</span>`;
  assert.ok(w.nodes['#right'].innerHTML.includes(badge),run.status+' result');
  assert.ok(w.nodes['#left'].innerHTML.includes(badge),run.status+' history');
  if(run.status!=='completed')assert.ok(!w.nodes['#right'].innerHTML.includes('class="chip good"'),run.status+' must not signal success');
 }
});
