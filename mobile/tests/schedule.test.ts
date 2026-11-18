import test from 'node:test';import assert from 'node:assert/strict';
import {scheduleInput} from '../src/scheduleInput';
const date='2028-02-29T09:00:00+04:00';
test('schedule preserves timezone instant and exact count',()=>assert.deepEqual(scheduleInput(date,3600,' 3 '),{first_at:'2028-02-29T05:00:00.000Z',every_seconds:3600,max_runs:3}));
test('invalid calendar dates cannot silently roll forward',()=>{
 for(const value of ['2027-02-29T09:00Z','2028-02-30T09:00Z','2028-04-31T09:00Z','2028-00-01T09:00Z','2028-13-01T09:00Z','2028-01-00T09:00Z','0000-01-01T09:00Z'])assert.throws(()=>scheduleInput(value,0,'1'));
});
test('timezone and time fields must be explicit and valid',()=>{
 for(const value of ['2028-01-01T09:00','2028-01-01T24:00Z','2028-01-01T09:60Z','2028-01-01T09:00:60Z','2028-01-01T09:00+24:00','2028-01-01T09:00+04:60','tomorrow'])assert.throws(()=>scheduleInput(value,0,'1'));
});
test('counts reject empty fractional exponential and out-of-range input',()=>{
 for(const count of ['',' ','0','101','1.5','1e2','-1','NaN','Infinity'])assert.throws(()=>scheduleInput(date,3600,count));
 assert.equal(scheduleInput(date,86400,'100').max_runs,100);
});
test('one-time count and interval selection are validated',()=>{
 assert.throws(()=>scheduleInput(date,0,'2'));assert.throws(()=>scheduleInput(date,60,'1'));
 assert.equal(scheduleInput(date,0,'1').max_runs,1);
});

test('timezone conversion cannot produce a timestamp outside the backend calendar',()=>{
 for(const value of ['0001-01-01T00:00:00+01:00','9999-12-31T23:59:00-01:00'])assert.throws(()=>scheduleInput(value,0,'1'),/UTC years/);
 assert.equal(scheduleInput('0001-01-01T01:00:00+01:00',0,'1').first_at,'0001-01-01T00:00:00.000Z');
 assert.equal(scheduleInput('9999-12-31T22:00:00-01:00',0,'1').first_at,'9999-12-31T23:00:00.000Z');
});
