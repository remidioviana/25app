import test from 'node:test';
import assert from 'node:assert/strict';
import {pickedFileBase64} from '../src/experience/pickedFile';
test('web picker data URLs are decoded without instantiating an unavailable native File API',async()=>{
 const data=await pickedFileBase64({name:'agreement.pdf',uri:'blob:local',size:4,base64:'data:application/pdf;base64,JVBERg=='},'web',async()=>{throw Error('Native reader must not run on web')});assert.equal(data,'JVBERg==');
});
test('native picker reads the local URI and rejects empty or oversized actual content',async()=>{
 const data=await pickedFileBase64({name:'agreement.pdf',uri:'file:///cache/p.pdf'},'ios',async uri=>{assert.equal(uri,'file:///cache/p.pdf');return'JVBERg=='});assert.equal(data,'JVBERg==');await assert.rejects(()=>pickedFileBase64({name:'x.pdf',uri:'x',size:2000001},'android',async()=>''));await assert.rejects(()=>pickedFileBase64({name:'x.pdf',uri:'x',base64:'data:application/pdf;base64,!!!'},'web',async()=>''));
});
