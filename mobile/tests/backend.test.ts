import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {AgentAPI,ApiError} from '../src/api';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
test('native API client completes all 25 agents against actual authenticated Python backend',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'agent-native-'));const userfile=path.join(temp,'users.json');fs.writeFileSync(userfile,JSON.stringify({mobile:{token_sha256:createHash('sha256').update('test-token').digest('hex')}}));
 const root=path.resolve(process.cwd(),'..');const port=18556;
 const child=spawn(process.env.PYTHON||'python3',['server.py'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',AGENT_DATA_DIR:temp,APP_USERS_FILE:userfile,APP_TOKEN:'',APP_CONNECTORS_FILE:'',OPENAI_API_KEY:''}});
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',code=>reject(Error('server exited '+code)))});
  const api=new AgentAPI(`http://127.0.0.1:${port}`,'test-token',true);
  assert.equal((await api.me()).user,'mobile');const {agents}=await api.agents();assert.equal(agents.length,25);
  for(const agent of agents){
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
  const invalid=new AgentAPI(`http://127.0.0.1:${port}`,'wrong-token',true);await assert.rejects(invalid.agents(),e=>e instanceof ApiError&&e.status===401);
 }finally{child.kill();await new Promise(resolve=>child.once('exit',resolve));fs.rmSync(temp,{recursive:true,force:true})}
});
