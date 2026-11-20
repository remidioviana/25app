import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function render(result:any){const w=workspace();w.run(`currentRun=${JSON.stringify({id:'evidence',agent:'a',status:'completed',events:[],result:{analysis:{total:17},evidence:[],...result}})};renderResultOriginal();`);return w}
test('run retrieval warnings are visible before the analysis without opening the complete JSON',()=>{
 const w=render({retrieval_warnings:['Outdated vectors were excluded; reindex the app evidence.','Official source retrieval failed; retained evidence may be historical.']});
 const html=w.nodes['#right'].innerHTML,summary=html.slice(0,html.indexOf('<details><summary>Retrieved evidence'));
 assert.match(summary,/Retrieval warnings/);assert.match(summary,/Outdated vectors were excluded/);assert.match(summary,/Official source retrieval failed/);assert.ok(summary.indexOf('Retrieval warnings')<summary.indexOf('class="fact"'));
});
test('retrieval warnings render as text and tolerate absent or malformed legacy metadata',()=>{
 const w=render({retrieval_warnings:['<img src=x onerror=alert(1)>',null,{text:'Untrusted shape'}]});const html=w.nodes['#right'].innerHTML;
 assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('[object Object]'));
 for(const warnings of [undefined,null,{},'not a list',[]])assert.ok(!render({retrieval_warnings:warnings}).nodes['#right'].innerHTML.includes('<b>Retrieval warnings</b>'));
});
test('switching to a result without warnings removes the earlier warning banner',()=>{
 const w=render({retrieval_warnings:['Old source warning']});w.run('currentRun={id:"clean",agent:"a",status:"completed",events:[],result:{analysis:{},evidence:[]}};renderResultOriginal();');assert.ok(!w.nodes['#right'].innerHTML.includes('Old source warning'));assert.ok(!w.nodes['#right'].innerHTML.includes('<b>Retrieval warnings</b>'));
});
