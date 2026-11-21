import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileRunSource} from '../src/runViewSource';
import type {Run} from '../src/types';
const initial={id:'case',status:'running',review:'pending',result:null} as Run;
test('an unchanged initial prop cannot roll back a locally updated result',()=>{
 const api={},source={api,initial,revision:0},current={...initial,status:'completed'} as Run;assert.equal(reconcileRunSource(source,api,initial,current),null);assert.equal(source.revision,0);
});
test('an echoed local result updates source identity without restarting its operation session',()=>{
 const api={},current={...initial,status:'completed'} as Run;const update=reconcileRunSource({api,initial,revision:3},api,current,current)!;assert.equal(update.changed,false);assert.equal(update.source.revision,3);assert.equal(update.run,current);assert.equal(reconcileRunSource(update.source,api,current,current),null);
});
test('reopening the same case adopts refreshed data even when its ID and status are unchanged',()=>{
 const api={},old={...initial,status:'completed',review:'pending'} as Run,fresh={...old,review:'accepted'};const update=reconcileRunSource({api,initial:old,revision:2},api,fresh,old)!;assert.equal(update.changed,true);assert.equal(update.source.revision,3);assert.equal(update.run.review,'accepted');assert.equal(update.run.id,old.id);assert.equal(update.run.status,old.status);
});
test('changing API identity invalidates result operations even for the same run object',()=>{
 const first={},second={};const update=reconcileRunSource({api:first,initial,revision:4},second,initial,initial)!;assert.equal(update.changed,true);assert.equal(update.source.api,second);assert.equal(update.source.revision,5);assert.equal(update.run,initial);
});
