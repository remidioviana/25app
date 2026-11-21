import test from 'node:test';
import assert from 'node:assert/strict';
import {downloadText} from '../src/webDownload';
import type {DownloadRuntime} from '../src/webDownload';
function runtime(){const blobs:Blob[]=[],revoked:string[]=[],timers:(()=>void)[]=[];let clicks=0;const link={href:'',download:'',click:()=>{clicks++}};const adapter:DownloadRuntime={create:blob=>{blobs.push(blob);return 'blob:report'},revoke:url=>revoked.push(url),link:()=>link,defer:cleanup=>timers.push(cleanup)};return {adapter,blobs,revoked,timers,link,clicks:()=>clicks}}
test('Web report download preserves content, MIME and filename and defers URL release',async()=>{
 for(const [filename,mime] of [['record.json','application/json;charset=utf-8'],['record.md','text/markdown;charset=utf-8']]){const r=runtime();downloadText('Recorded content',filename,mime,r.adapter);assert.equal(r.link.download,filename);assert.equal(r.link.href,'blob:report');assert.equal(r.clicks(),1);assert.equal(r.blobs[0].type,mime);assert.equal(await r.blobs[0].text(),'Recorded content');assert.deepEqual(r.revoked,[]);r.timers[0]();assert.deepEqual(r.revoked,['blob:report']);}
});
test('failed download initiation still schedules cleanup and preserves its original error',()=>{
 const r=runtime(),primary=Error('Download blocked');r.link.click=()=>{throw primary};assert.throws(()=>downloadText('report','record.md','text/markdown',r.adapter),error=>error===primary);assert.equal(r.timers.length,1);r.timers[0]();assert.deepEqual(r.revoked,['blob:report']);
});
test('link creation failure also releases the already-created URL',()=>{
 const r=runtime();r.adapter.link=()=>{throw Error('No link')};assert.throws(()=>downloadText('report','record.md','text/markdown',r.adapter),/No link/);assert.equal(r.clicks(),0);r.timers[0]();assert.deepEqual(r.revoked,['blob:report']);
});
test('object URL creation failure does not fabricate a download or cleanup resource',()=>{
 const r=runtime();r.adapter.create=()=>{throw Error('No URL')};assert.throws(()=>downloadText('report','record.md','text/markdown',r.adapter),/No URL/);assert.equal(r.clicks(),0);assert.deepEqual(r.revoked,[]);assert.equal(r.timers.length,0);
});
