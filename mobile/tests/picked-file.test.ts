import test from 'node:test';
import assert from 'node:assert/strict';
import {pickedFileBase64} from '../src/experience/pickedFile';
test('web picker data URLs are decoded without instantiating an unavailable native File API',async()=>{
 const data=await pickedFileBase64({name:'agreement.pdf',uri:'blob:local',size:4,base64:'data:application/pdf;base64,JVBERg=='},'web',async()=>{throw Error('Native reader must not run on web')});assert.equal(data,'JVBERg==');
});
test('native picker reads the local URI and rejects empty or oversized actual content',async()=>{
 const data=await pickedFileBase64({name:'agreement.pdf',uri:'file:///cache/p.pdf'},'ios',async uri=>{assert.equal(uri,'file:///cache/p.pdf');return'JVBERg=='});assert.equal(data,'JVBERg==');await assert.rejects(()=>pickedFileBase64({name:'x.pdf',uri:'x',size:2000001},'android',async()=>''));await assert.rejects(()=>pickedFileBase64({name:'x.pdf',uri:'x',base64:'data:application/pdf;base64,!!!'},'web',async()=>''));
});

test('file data URLs must declare base64 instead of silently reinterpreting plain text',async()=>{
 for(const base64 of ['data:text/plain,QUJD','data:text/plain;base64QUJD','data:text/plain;base64;other,QUJD','data:,QUJD']){
  await assert.rejects(pickedFileBase64({name:'record.txt',uri:'blob:local',base64},'web',async()=>''),/base64 data URL/);
 }
 const base64='data:text/plain;charset=utf-8;base64,QUJD';
 assert.equal(await pickedFileBase64({name:'record.txt',uri:'blob:local',base64},'web',async()=>''),'QUJD');
 assert.equal(await pickedFileBase64({name:'record.txt',uri:'file:local'},'android',async()=>'QUJD'),'QUJD');
});

test('Unicode filenames at the server character limit work on Web, iOS and Android',async()=>{
 for(const platform of ['web','ios','android'])for(const character of ['a','م','𞸀','🏠']){
  const name=character.repeat(196)+'.txt';assert.equal(Array.from(name).length,200);
  const data=await pickedFileBase64({name,uri:'local:record',size:3,base64:'QUJD'},platform,async()=>'QUJD');assert.equal(data,'QUJD');
 }
});
test('filenames over the Unicode limit are rejected before reading their contents',async()=>{
 for(const platform of ['web','ios','android'])for(const character of ['a','م','𞸀','🏠']){
  let reads=0;const name=character.repeat(197)+'.txt';assert.equal(Array.from(name).length,201);
  await assert.rejects(pickedFileBase64({name,uri:'local:record',base64:'QUJD'},platform,async()=>{reads++;return 'QUJD'}),/at most 200 characters/);assert.equal(reads,0);
 }
});
