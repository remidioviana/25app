import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {backendPort,stopBackend} from './backendProcess';
test('a failed backend rejects startup and cleanup also handles an already exited process',async()=>{
 const child=spawn(process.execPath,['-e','process.exit(1)']);const exit=once(child,'exit');await assert.rejects(backendPort(child,1000));await exit;await stopBackend(child);
});
test('startup timeout terminates a silent process rather than hanging the suite',async()=>{
 const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)']);try{await assert.rejects(backendPort(child,50),/timed out/)}finally{await stopBackend(child)}assert.notEqual(child.signalCode,null);
});
