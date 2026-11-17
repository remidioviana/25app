import test from 'node:test';
import assert from 'node:assert/strict';
import {ledgerPreview,moneySum} from '../src/experience/ledgerPreview';
test('ledger preview excludes duplicate IDs and retains uncertainty without inventing category budgets',()=>{
 const result=ledgerPreview([{id:'a',category:'Food',amount:10.105,verified:false},{id:'a',category:'Food',amount:900,verified:true},{id:'b',category:'Food',amount:-.1,verified:true},{id:'c',category:'Travel',amount:0,verified:true}],{Food:20});
 assert.equal(result.total,'10.01');assert.deepEqual(result.duplicates,['a']);assert.deepEqual(result.unverified,['a']);assert.equal(result.categories[0].spent,'10.01');assert.equal(result.categories[0].remaining,'10.00');assert.equal(result.categories[1].budget,null);
});
test('decimal ledger sums round once, preserve refunds and explicit zero, and reject nonfinite money',()=>{
 assert.equal(moneySum([.1,.2]),'0.30');assert.equal(moneySum([-.105]),'-0.11');assert.equal(moneySum([]),'0.00');assert.equal(moneySum([1e-7]),'0.00');assert.throws(()=>moneySum([NaN]));
});
