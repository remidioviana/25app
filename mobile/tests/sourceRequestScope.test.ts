import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceRequestScope} from '../src/sourceRequestScope';

test('a live source read invalidates an older catalogue snapshot',async()=>{
 const scope=sourceRequestScope();scope.start();const catalogue=scope.catalogue()!;
 let resolve!:(value:string[])=>void;const response=new Promise<string[]>(yes=>{resolve=yes});let reads=['previous'];
 const late=response.then(value=>{if(scope.current(catalogue))reads=value});
 const read=scope.read()!;assert.equal(catalogue.signal.aborted,true);
 if(scope.current(read))reads=['confirmed receipt'];scope.finish(read);
 resolve(['old snapshot']);await late;assert.deepEqual(reads,['confirmed receipt']);
});
test('pending reads block duplicate reads and catalogue reloads',()=>{
 const scope=sourceRequestScope();scope.start();const read=scope.read()!;
 assert.equal(scope.read(),null);assert.equal(scope.catalogue(),null);
 scope.finish(read);assert.ok(scope.catalogue());
});
test('cancellation cannot release a newer source read',()=>{
 const scope=sourceRequestScope();scope.start();const old=scope.read()!;
 scope.cancelRead();const next=scope.read()!;scope.finish(old);
 assert.equal(scope.current(old),false);assert.equal(scope.current(next),true);assert.equal(scope.read(),null);
});
test('catalogue reload supersedes older replies and disposal invalidates every reply',()=>{
 const scope=sourceRequestScope();assert.equal(scope.catalogue(),null);scope.start();
 const old=scope.catalogue()!,next=scope.catalogue()!;scope.finish(old);
 assert.equal(old.signal.aborted,true);assert.equal(scope.current(next),true);
 scope.dispose();assert.equal(next.signal.aborted,true);assert.equal(scope.current(next),false);assert.equal(scope.read(),null);
 scope.start();const read=scope.read()!;scope.dispose();scope.start();assert.equal(scope.current(read),false);assert.ok(scope.read());
});
