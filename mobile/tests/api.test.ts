import test from 'node:test';
import assert from 'node:assert/strict';
import {AgentAPI,ApiError,serverURL} from '../src/api';
import {blank,replaceAt,validateGoal} from '../src/forms';
import fs from 'node:fs';
import path from 'node:path';

test('server origin: HTTPS, no embedded credentials or arbitrary base path',()=>{
 assert.equal(serverURL('https://example.com/'),'https://example.com');
 for(const value of ['http://example.com','https://user:secret@example.com','https://example.com/api','https://example.com?key=x','file:///tmp/a'])assert.throws(()=>serverURL(value));
 assert.equal(serverURL('http://127.0.0.1:8000',true),'http://127.0.0.1:8000');
 assert.throws(()=>serverURL('http://127.0.0.1:8000'));assert.throws(()=>serverURL('http://8.8.8.8',true));
});
test('authenticated run uses an explicit idempotency key and fixed API path',async()=>{
 let args:any[]=[];const transport=(async(...values:any[])=>{args=values;return new Response(JSON.stringify({id:'run'}),{status:202})}) as typeof fetch;
 const api=new AgentAPI('https://backend.example','user-token',false,transport);
 await api.start('hisad','goal',{quantity:3},'team',false,'stable-key');
 assert.equal(args[0],'https://backend.example/api/agents/hisad/runs');assert.equal(args[1].headers.Authorization,'Bearer user-token');assert.equal(args[1].headers['Idempotency-Key'],'stable-key');assert.equal(args[1].redirect,'error');
 assert.equal(JSON.parse(args[1].body).mode,'team');
});
test('review is bound to the artifact hash',async()=>{
 let payload:any;const transport=(async(_u:any,options:any)=>{payload=JSON.parse(options.body);return new Response('{}')}) as typeof fetch;
 const api=new AgentAPI('https://backend.example','t',false,transport);await api.review({id:'r',artifact_hash:'exact-hash'} as any,'accepted');assert.deepEqual(payload,{decision:'accepted',artifact_hash:'exact-hash'});
});
test('HTTP errors retain status; no fabricated success',async()=>{
 const api=new AgentAPI('https://backend.example','t',false,(async()=>new Response('{"error":"Token inválido"}',{status:401})) as typeof fetch);
 await assert.rejects(api.agents(),e=>e instanceof ApiError&&e.status===401&&e.message==='Token inválido');
});
test('request paths cannot override the configured origin',async()=>{
 const api=new AgentAPI('https://backend.example','t',false,(async()=>{throw Error('must not run')}) as typeof fetch);
 await assert.rejects(api.request('https://evil.example'));await assert.rejects(api.request('//evil.example'));
});
test('aborted polling propagates cancellation to transport',async()=>{
 const transport=((_u:any,options:any)=>new Promise((_resolve,reject)=>{if(options.signal.aborted)reject(Error('cancelled'));else options.signal.addEventListener('abort',()=>reject(Error('cancelled')))})) as typeof fetch;
 const api=new AgentAPI('https://backend.example','t',false,transport);const c=new AbortController();const request=api.run('r',c.signal);c.abort();await assert.rejects(request,/cancelled/);
});
test('form edits do not mutate original data',()=>{
 const original={items:[{amount:2}]};const next=replaceAt(original,['items',0,'amount'],5);assert.equal(original.items[0].amount,2);assert.deepEqual(next,{items:[{amount:5}]});
});
test('schema defaults exist for all 25 native agent forms',()=>{
 const root=path.resolve(process.cwd(),'../agents');const specs=fs.readdirSync(root).filter(x=>fs.existsSync(path.join(root,x,'agent.json')));assert.equal(specs.length,25);
 for(const id of specs){const spec=JSON.parse(fs.readFileSync(path.join(root,id,'agent.json'),'utf8'));const value=blank(spec.schema);assert.equal(typeof value,'object');assert.deepEqual(Object.keys(value as object),Object.keys(spec.schema.properties))}
});
test('goal validation rejects empty and oversized requests',()=>{assert.throws(()=>validateGoal(' '));assert.throws(()=>validateGoal('x'.repeat(2001)));assert.equal(validateGoal(' missão '),'missão')});
test('evidence search scopes the app, trims query and disables provider search',async()=>{
 let url='',body:any;const transport=(async(u:any,o:any)=>{url=u;body=JSON.parse(o.body);return new Response(JSON.stringify({matches:[],method:'bm25',warnings:[]}))}) as typeof fetch;
 const api=new AgentAPI('https://backend.example','test-token',false,transport);
 assert.deepEqual((await api.searchEvidence('mizan',' budget ')).matches,[]);
 assert.equal(url,'https://backend.example/api/agents/mizan/search');assert.deepEqual(body,{query:'budget',semantic:false});
});
test('evidence search rejects blank and oversized queries before transport',async()=>{
 const api=new AgentAPI('https://backend.example','t',false,(async()=>{assert.fail('Transport should not be called')}) as typeof fetch);
 await assert.rejects(api.searchEvidence('mizan','  '),/search query/);await assert.rejects(api.searchEvidence('mizan','x'.repeat(2001)),/search query/);
});
test('evidence search cancellation reaches transport',async()=>{
 const api=new AgentAPI('https://backend.example','t',false,((_u:any,o:any)=>new Promise((_resolve,reject)=>{o.signal.addEventListener('abort',()=>reject(Error('cancelled')))})) as typeof fetch);
 const controller=new AbortController();const task=api.searchEvidence('mizan','budget',controller.signal);controller.abort();await assert.rejects(task,/cancelled/);
});
test('missing server error message uses English fallback',async()=>{
 const api=new AgentAPI('https://backend.example','t',false,(async()=>new Response('{}',{status:500})) as typeof fetch);
 await assert.rejects(api.searchEvidence('mizan','budget'),/Server request failed/);
});

test('non-JSON HTTP failures preserve status without displaying proxy response bodies',async()=>{
 for(const [status,body]of [[401,'<html>Unauthorized</html>'],[429,'Rate limited'],[503,'']]as const){
  const api=new AgentAPI('https://backend.example','test',false,(async()=>new Response(body,{status}))as typeof fetch);
  await assert.rejects(api.agents(),e=>e instanceof ApiError&&e.status===status&&e.message==='Server request failed');
 }
});
test('null and non-string JSON error payloads use the English HTTP fallback',async()=>{
 for(const body of ['null','[]','{"error":{}}','{"error":123}','{"error":"  "}']){
  const api=new AgentAPI('https://backend.example','test',false,(async()=>new Response(body,{status:502}))as typeof fetch);
  await assert.rejects(api.agents(),e=>e instanceof ApiError&&e.status===502&&e.message==='Server request failed');
 }
});
test('invalid successful JSON and aborted body reads remain failures',async()=>{
 const malformed=new AgentAPI('https://backend.example','test',false,(async()=>new Response('not JSON'))as typeof fetch);
 await assert.rejects(malformed.agents(),SyntaxError);
 const controller=new AbortController(),aborted=new Error('cancelled while reading');
 const api=new AgentAPI('https://backend.example','test',false,(async()=>({ok:false,status:503,json:async()=>{controller.abort();throw aborted}}as unknown as Response))as typeof fetch);
 await assert.rejects(api.run('r',controller.signal),e=>e===aborted);
});
