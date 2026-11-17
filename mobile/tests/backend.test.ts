import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {AgentAPI,ApiError} from '../src/api';
import {backendPort,stopBackend} from './backendProcess';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
test('native API client completes all 25 agents against actual authenticated Python backend',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'agent-native-'));const userfile=path.join(temp,'users.json');fs.writeFileSync(userfile,JSON.stringify({mobile:{token_sha256:createHash('sha256').update('test-token').digest('hex')}}));
 const root=path.resolve(process.cwd(),'..');
 const child=spawn(process.env.PYTHON||'python3',['server.py'],{cwd:root,env:{...process.env,PORT:'0',HOST:'127.0.0.1',AGENT_DATA_DIR:temp,APP_USERS_FILE:userfile,APP_TOKEN:'',APP_CONNECTORS_FILE:'',OPENAI_API_KEY:''}});
 try{
  const port=await backendPort(child);
  const api=new AgentAPI(`http://127.0.0.1:${port}`,'test-token',true);
  assert.equal((await api.me()).user,'mobile');const {agents}=await api.agents();assert.equal(agents.length,25);
  for(const agent of agents){
   const countBefore=(await api.runs(agent.id)).runs.length;
   await assert.rejects(api.start(agent.id,'Missing required inputs',{},'local',false,'invalid-'+agent.id),e=>e instanceof ApiError&&e.status===400);
   assert.equal((await api.runs(agent.id)).runs.length,countBefore);
   assert.ok((await api.publicSources(agent.id)).sources.length>0,agent.id+' has no official source catalogue');
   let run=await api.start(agent.id,agent.goal,agent.example,'local',true,'native-'+agent.id);
   for(let attempt=0;attempt<100&&['queued','running'].includes(run.status);attempt++){await wait(20);run=await api.run(run.id)}
   assert.equal(run.status,'completed',agent.id+': '+run.error);assert.ok(run.result?.analysis);assert.equal(run.result?.external_actions_performed,false);
   assert.ok((await api.exportMarkdown(run.id)).includes('Verifiable analysis'));
  }
  const preview=await api.preview('documento.txt',Buffer.from('Evidence for mobile').toString('base64'));assert.equal(preview.text,'Evidence for mobile');
  await api.addDocument('himayah','Native evidence',preview.text,'test','');assert.equal((await api.documents('himayah')).documents.length,1);
  const found=await api.searchEvidence('himayah','Evidence');assert.equal(found.matches.length,1);assert.equal(found.matches[0].text,'Evidence for mobile');assert.equal(found.matches[0].source,'test');assert.match(found.matches[0].citation,/:0$/);
  assert.equal((await api.searchEvidence('mizan','Evidence')).matches.length,0);
  assert.equal((await api.searchEvidence('himayah','nonexistentterm')).matches.length,0);
  for(const id of agents.map(agent=>agent.id)){
   const bytes=Buffer.from('Controlled imported document for '+id+' receipttrace');
   const original=bytes.toString();const text=id==='iqamah'?original+' edited':original;
   const saved=await api.addDocument(id,'Controlled document',text,'controlled fixture','',{filename:'input.txt',base64:bytes.toString('base64')});
   const document=(await api.documents(id)).documents.find(x=>x.id===saved.id);
   assert.ok(document?.import_provenance,id+' import receipt missing');
   const proof=document.import_provenance;
   assert.equal(proof.raw_sha256,createHash('sha256').update(bytes).digest('hex'));
   assert.equal(proof.saved_text_sha256,createHash('sha256').update(text).digest('hex'));
   assert.equal(proof.text_edited,id==='iqamah');assert.equal(proof.authenticity_verified,false);
   const matches=(await api.searchEvidence(id,'receipttrace')).matches;
   assert.ok(matches.some(x=>x.doc===saved.id),id+' imported document not retrieved');
   const agent=agents.find(x=>x.id===id)!;
   let run=await api.start(id,'receipttrace',agent.example,'local',true,'import-trace-'+id);
   for(let attempt=0;attempt<100&&['queued','running'].includes(run.status);attempt++){await wait(20);run=await api.run(run.id)}
   assert.equal(run.status,'completed',run.error||id);
   const report=await api.exportMarkdown(run.id);
   assert.ok(report.includes(proof.raw_sha256),id+' receipt missing from export');
   assert.ok(report.includes('"authenticity_verified": false'));
  }
  const before=(await api.documents('himayah')).documents.length;
  await assert.rejects(api.addDocument('himayah','Invalid','text','controlled','',{filename:'bad.txt',base64:'!'}),e=>e instanceof ApiError&&e.status===400);
  assert.equal((await api.documents('himayah')).documents.length,before);
  const invalid=new AgentAPI(`http://127.0.0.1:${port}`,'wrong-token',true);await assert.rejects(invalid.agents(),e=>e instanceof ApiError&&e.status===401);
 }finally{await stopBackend(child);fs.rmSync(temp,{recursive:true,force:true})}
});
