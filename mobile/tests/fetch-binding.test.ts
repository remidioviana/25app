import test from 'node:test';
import assert from 'node:assert/strict';
import {AgentAPI} from '../src/api';
test('the default transport preserves the global fetch receiver required by browser runtimes',async()=>{const previous=globalThis.fetch;let called=false;globalThis.fetch=function(this:typeof globalThis){assert.equal(this,globalThis);called=true;return Promise.resolve(new Response(JSON.stringify({requires_token:false}),{headers:{'Content-Type':'application/json'}}))} as typeof fetch;try{const api=new AgentAPI('https://controlled.example','');const config=await api.config();assert.equal(config.requires_token,false);assert.equal(called,true)}finally{globalThis.fetch=previous}});
