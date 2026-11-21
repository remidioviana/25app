import test from 'node:test';
import assert from 'node:assert/strict';
import {operationGate} from '../src/operationGate';
test('import, analysis and export share one synchronous gate in the current session',()=>{
 const gate=operationGate(),importing=gate.acquire(1)!;assert.ok(importing);assert.equal(gate.acquire(1),null);assert.equal(gate.acquire(1),null);assert.equal(gate.release(importing),true);assert.ok(gate.acquire(1));
});
test('a newer session can start while an older operation is still finishing',()=>{
 const gate=operationGate(),old=gate.acquire(1)!,current=gate.acquire(2)!;assert.ok(current);assert.equal(gate.release(old),false);assert.equal(gate.acquire(2),null);assert.equal(gate.release(current),true);assert.ok(gate.acquire(2));
});
test('releasing a completed lease twice cannot unlock the next operation',()=>{
 const gate=operationGate(),first=gate.acquire(1)!;assert.equal(gate.release(first),true);const second=gate.acquire(1)!;assert.equal(gate.release(first),false);assert.equal(gate.acquire(1),null);assert.equal(gate.release(second),true);
});
test('a matching scope number alone cannot impersonate the active operation',()=>{
 const gate=operationGate();gate.acquire(1);assert.equal(gate.release({scope:1}),false);assert.equal(gate.acquire(1),null);
});

test('an older session cannot reacquire the gate after a newer session has taken ownership',()=>{
 const gate=operationGate(),old=gate.acquire(1)!,current=gate.acquire(3)!;assert.equal(gate.acquire(1),null);assert.equal(gate.acquire(2),null);assert.equal(gate.release(old),false);assert.equal(gate.release(current),true);assert.equal(gate.acquire(1),null);assert.ok(gate.acquire(3));
});
