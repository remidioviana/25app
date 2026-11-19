import test from 'node:test';
import assert from 'node:assert/strict';
import {recordPage} from '../src/experience/recordPage';
import {interactiveRecords} from '../src/experience/interactiveRecords';
test('later source pages retain global chapter positions and corresponding evidence',()=>{
 const sources=Array.from({length:50},(_,i)=>({title:`Source ${i+1}`,excerpt:`Evidence ${i+1}`,reference:`source:${i+1}`,topics:[]}));
 const scene=interactiveRecords('turath',{sources,topics:[]})!;
 const second=recordPage(scene.records,1),third=recordPage(scene.records,2);
 assert.equal(second.pageCount,3);assert.equal(second.items[0].ordinal,25);
 assert.equal(second.items[0].record.label,'Source 25');assert.equal(second.items[0].record.reference,'source:25');
 assert.equal(second.items.at(-1)!.ordinal,48);assert.equal(third.items[0].ordinal,49);assert.equal(third.items.at(-1)!.record.detail,'Evidence 50');
});
test('filtered lists, deletion and empty pages cannot expose unrelated or out-of-range records',()=>{
 const records=Array.from({length:50},(_,i)=>({id:i,state:i%2?'attention':'recorded'}));
 const filtered=records.filter(x=>x.state==='attention'),second=recordPage(filtered,1);
 assert.equal(second.items.length,1);assert.equal(second.items[0].ordinal,25);assert.equal(second.items[0].record.id,49);
 const shrunk=recordPage(records.slice(0,2),2);assert.equal(shrunk.page,0);assert.deepEqual(shrunk.items.map(x=>x.record.id),[0,1]);
 assert.deepEqual(recordPage([],2).items,[]);
 for(const value of [-1,NaN,Infinity])assert.equal(recordPage(records,value).page,0);
});
