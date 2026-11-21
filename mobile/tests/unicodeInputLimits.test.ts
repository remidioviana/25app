import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGoal,addMapEntry} from '../src/forms';
import {AgentAPI} from '../src/api';
import {characterCount,limitCharacters} from '../src/experience/textMetrics';
test('mission goals and category names accept their full Unicode character limits',()=>{
 for(const character of ['a','م','𞸀','🏠']){
  assert.equal(validateGoal(character.repeat(2000)),character.repeat(2000));assert.throws(()=>validateGoal(character.repeat(2001)));
  const name=character.repeat(80);assert.deepEqual(addMapEntry({},name,{type:'number'}),{[name]:null});assert.throws(()=>addMapEntry({},character.repeat(81),{type:'number'}));
 }
});
test('evidence searches send all allowed Unicode characters and reject oversized queries before transport',async()=>{
 let calls=0,query='';const api=new AgentAPI('https://backend.example','',false,(async(_url,init)=>{calls++;query=JSON.parse(String(init?.body)).query;return new Response(JSON.stringify({matches:[],method:'bm25',warnings:[]}))})as typeof fetch);
 for(const character of ['a','م','𞸀','🏠']){
  const allowed=character.repeat(2000);await api.searchEvidence('mizan',allowed);assert.equal(query,allowed);const before=calls;await assert.rejects(api.searchEvidence('mizan',character.repeat(2001)));assert.equal(calls,before);
 }
});
test('controlled text clipping preserves complete supplementary characters at the boundary',()=>{
 for(const character of ['𞸀','🏠']){const raw='a'.repeat(1999)+character+'tail';const clipped=limitCharacters(raw,2000);assert.equal(characterCount(clipped),2000);assert.equal(clipped,'a'.repeat(1999)+character);assert.equal(limitCharacters(clipped,2000),clipped);}
});
