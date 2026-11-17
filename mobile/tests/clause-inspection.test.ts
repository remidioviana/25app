import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectClauses,documentBlocks,inspectionMarkdown} from '../src/experience/clauseInspection';
test('document highlights preserve Unicode code-point and UI UTF-16 ranges, including emoji and Arabic',()=>{
 const text='😀 عقد: share data. SHARE DATA.';const result=inspectClauses(text,[{label:'Sharing',phrase:'share data',required:false}]);assert.equal(result.hits.length,2);const h=result.hits[0];assert.equal(Array.from(text).slice(h.start,h.end).join(''),'share data');assert.equal(text.slice(h.utf16Start,h.utf16End),'share data');assert.equal(h.utf16Start,h.start+1);assert.equal(h.quote,Array.from(text).slice(h.quoteStart,h.quoteEnd).join(''));
});
test('screening is literal, distinguishes absent required phrases and bounds repeated matches',()=>{
 assert.equal(inspectClauses('acb a.b',[{label:'Literal',phrase:'a.b',required:false}]).hits.length,1);assert.equal(inspectClauses('contract',[{label:'Missing',phrase:'retention',required:true}]).findings[0].flagged,true);const repeated=inspectClauses('x '.repeat(500),[{label:'X',phrase:'x',required:false}]);assert.equal(repeated.hits.length,100);assert.equal(repeated.findings[0].truncated,true);assert.throws(()=>inspectClauses('x',[{label:'Blank',phrase:' ',required:false}]));
});
test('virtualized document blocks reconstruct the exact source without splitting a surrogate pair',()=>{
 const text='😀ع'.repeat(2000);const blocks=documentBlocks(text,100);assert.equal(blocks.map(x=>x.text).join(''),text);assert.equal(blocks[1].start,100);assert.equal(blocks.at(-1)?.end,4000);assert.throws(()=>inspectClauses('\ud800',[]));
});
test('annotation export keeps exact text, source fingerprints, offsets and user attribution',()=>{
 const text='Please retain records.';const r=inspectClauses(text,[{label:'Retention',phrase:'retain',required:false}]);const md=inspectionMarkdown(text,'a'.repeat(64),r,{[r.hits[0].id]:'Clarify the period.'},{filename:'contract.pdf',rawSha256:'b'.repeat(64)});assert.ok(md.includes(text));assert.ok(md.includes('Current text SHA-256: '+'a'.repeat(64)));assert.ok(md.includes('User annotation: Clarify the period.'));assert.ok(md.includes('Authenticity: not verified'));assert.throws(()=>inspectionMarkdown(text,'old',r,{}));
});
