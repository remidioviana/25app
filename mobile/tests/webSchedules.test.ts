import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function deferred(){let resolve!:(value:any)=>void;const promise=new Promise(yes=>{resolve=yes});return {promise,resolve}}
function fields(w:ReturnType<typeof workspace>){w.run('$("#schedule-at").value="2026-12-01T09:00";$("#schedule-interval").value="0";$("#schedule-count").value="1";$("#schedule-mode").value="local";hasInputs=true;')}
test('invalid Web schedule controls are rejected before creating server work',async()=>{
 const w=workspace();let writes=0;w.setAPI((url:string,method='GET')=>{if(method==='POST')writes++;return Promise.resolve({schedules:[]})});await w.run('tab="schedules";renderSchedules()');
 for(const [field,value] of [['#schedule-at','2026-02-30T09:00'],['#schedule-at','2026-11-14T25:00'],['#schedule-count',''],['#schedule-count','1.5'],['#schedule-count','101'],['#schedule-interval','60'],['#schedule-count','2']]){
  fields(w);w.nodes[field].value=value;await w.nodes['#create-schedule'].onclick();assert.equal(writes,0,field+': '+value);assert.equal(w.nodes['#create-schedule'].disabled,false);
 }
});
test('valid recurring schedules preserve edited controls during collection refresh',async()=>{
 const w=workspace(),response=deferred();let payload:any;w.setAPI((url:string,method='GET',data:any)=>{if(method==='POST'){payload=data;return response.promise}return Promise.resolve({schedules:[]})});
 await w.run('tab="schedules";renderSchedules()');fields(w);w.nodes['#schedule-interval'].value='604800';w.nodes['#schedule-count'].value='3';
 const pending=w.nodes['#create-schedule'].onclick();w.nodes['#schedule-count'].value='5';response.resolve({id:'schedule'});await pending;
 assert.equal(payload.every_seconds,604800);assert.equal(payload.max_runs,3);assert.match(payload.first_at,/Z$/);assert.equal(w.nodes['#schedule-count'].value,'5');
});
test('duplicate schedule clicks are suppressed both pending and after a confirmed identical creation',async()=>{
 const w=workspace(),response=deferred();let writes=0;w.setAPI((url:string,method='GET')=>{if(method==='POST'){writes++;return response.promise}return Promise.resolve({schedules:[]})});
 await w.run('tab="schedules";renderSchedules()');fields(w);const pending=w.nodes['#create-schedule'].onclick();await w.nodes['#create-schedule'].onclick();assert.equal(writes,1);
 response.resolve({id:'created'});await pending;await w.nodes['#create-schedule'].onclick();assert.equal(writes,1);assert.match(w.state().notices.at(-1),/already created/);
});
test('disabling future runs refreshes only the list and keeps new schedule settings',async()=>{
 const w=workspace(),response=deferred(),button={dataset:{disableSchedule:'old'},disabled:false};w.lists['[data-disable-schedule]']=[button];
 let disabled=false;w.setAPI((url:string,method='GET')=>method==='POST'?response.promise.then(value=>{disabled=true;return value}):Promise.resolve({schedules:[{id:'old',goal:'Saved plan',enabled:!disabled,next_at_iso:'2026-12-01T09:00:00Z',remaining:7}]}));await w.run('tab="schedules";renderSchedules()');fields(w);
 const pending=(button as any).onclick();w.nodes['#schedule-count'].value='7';response.resolve({});await pending;assert.equal(w.nodes['#schedule-count'].value,'7');assert.match(w.nodes['#schedule-list'].innerHTML,/Inactive/);assert.match(w.nodes['#schedule-list'].innerHTML,/remaining: 7/);assert.doesNotMatch(w.nodes['#schedule-list'].innerHTML,/Finished|data-disable-schedule/);
});
test('an older schedule panel cannot replace a reopened panel for the same app',async()=>{
 const w=workspace(),old=deferred();let calls=0;w.setAPI(()=>++calls===1?old.promise:Promise.resolve({schedules:[]}));const first=w.run('tab="schedules";renderSchedules()');await w.run('tab="input";tab="schedules";renderSchedules()');
 old.resolve({schedules:[{id:'old',goal:'STALE SCHEDULE',enabled:false,next_at_iso:'2026-12-01T09:00:00Z',remaining:1}]});await first;assert.doesNotMatch(w.nodes['#left'].innerHTML,/STALE SCHEDULE/);
});
test('browser-local schedule conversion respects Dubai time, clock gaps and backend UTC bounds',async()=>{
 const {spawnSync}=await import('node:child_process'),{default:path}=await import('node:path');
 function parse(zone:string,date:string){
  const script=`const w=require(${JSON.stringify(path.resolve(__dirname,'webWorkspaceHarness.js'))}).workspace();try{console.log(JSON.stringify(w.run(${JSON.stringify(`webScheduleInput(${JSON.stringify(date)},'0','1')`)})))}catch(e){console.log(JSON.stringify({error:e.message}))}`;
  const child=spawnSync(process.execPath,['-e',script],{env:{...process.env,TZ:zone},encoding:'utf8'});assert.equal(child.status,0,child.stderr);return JSON.parse(child.stdout);
 }
 assert.equal(parse('Asia/Dubai','2026-12-01T09:00').first_at,'2026-12-01T05:00:00.000Z');
 assert.match(parse('America/New_York','2026-03-08T02:30').error,/valid local calendar/);
 assert.match(parse('America/New_York','9999-12-31T23:59').error,/UTC years/);
 assert.match(parse('Asia/Dubai','0001-01-01T00:00').error,/UTC years/);
});
test('a failed list refresh after confirmed creation cannot duplicate the schedule on retry',async()=>{
 const w=workspace();let reads=0,writes=0;w.setAPI((url:string,method='GET')=>{if(method==='POST'){writes++;return Promise.resolve({id:'created'})}return ++reads===1?Promise.resolve({schedules:[]}):Promise.reject(new Error('list unavailable'))});
 await w.run('tab="schedules";renderSchedules()');fields(w);await w.nodes['#create-schedule'].onclick();
 assert.match(w.state().notices.at(-1),/Schedule created.*list could not refresh/);await w.nodes['#create-schedule'].onclick();assert.equal(writes,1);
});
