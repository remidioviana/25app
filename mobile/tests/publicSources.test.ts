import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AgentAPI,ApiError} from '../src/api';

test('source catalogue and read use the fixed per-app path and explicit source ID only',async()=>{
 const requests:{url:string;options:RequestInit}[]=[];
 const api=new AgentAPI('https://workspace.test','token',false,(async(url,options)=>{requests.push({url:String(url),options:options!});return new Response(JSON.stringify(requests.length===1?{sources:[],reads:[]}:{receipt:{status:'retrieved',source_id:'uae-pdpl'},document_id:'doc',source_content:'stored'}))}) as typeof fetch);
 assert.deepEqual(await api.publicSources('himayah'),{sources:[],reads:[]});await api.refreshPublicSource('himayah','uae-pdpl');
 assert.equal(requests[0].url,'https://workspace.test/api/agents/himayah/sources');assert.equal(requests[0].options.method,'GET');
 assert.equal(requests[1].url,'https://workspace.test/api/agents/himayah/sources');assert.equal(requests[1].options.method,'POST');
 assert.deepEqual(JSON.parse(requests[1].options.body as string),{source_id:'uae-pdpl'});assert.equal(requests[1].options.redirect,'error');
 for(const value of ['', 'https://arbitrary.test','../other', 'A', 'x'.repeat(65)])await assert.rejects(api.refreshPublicSource('himayah',value),/approved source/);
 assert.equal(requests.length,2);
});

test('source cancellation and failed HTTP response remain errors, not retrieved receipts',async()=>{
 let signal:AbortSignal|undefined;
 const api=new AgentAPI('https://workspace.test','',false,(async(_url,options)=>{signal=options?.signal as AbortSignal;return new Response('{"error":"Source returned HTTP 403"}',{status:400})}) as typeof fetch);
 const controller=new AbortController();controller.abort();
 await assert.rejects(api.refreshPublicSource('iqamah','icp-golden-residency',controller.signal),e=>e instanceof ApiError&&e.status===400);
 assert.equal(signal!.aborted,true);
});
