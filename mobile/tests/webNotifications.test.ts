import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';

test('a newer Web notification receives its own full display interval',()=>{
 const w=workspace();w.run('toastOriginal("Saved");');
 const first=w.timers.at(-1)!;
 w.run('toastOriginal("Refresh failed. Saved changes remain confirmed.");');
 const latest=w.timers.at(-1)!;
 assert.equal(first.cancelled,true);assert.equal(latest.delay,6000);
 // Even a callback already queued before cancellation cannot hide the newer message.
 first.callback();
 assert.equal(w.nodes['#toast'].style.display,'block');
 assert.equal(w.nodes['#toast'].textContent,'Refresh failed. Saved changes remain confirmed.');
 latest.callback();assert.equal(w.nodes['#toast'].style.display,'none');
 w.run('toastOriginal("Ready");');assert.equal(w.nodes['#toast'].style.display,'block');
 w.timers.at(-1)!.callback();assert.equal(w.nodes['#toast'].style.display,'none');
});
