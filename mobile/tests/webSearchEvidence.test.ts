import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
async function setup(result:any){const w=workspace();w.setAPI(async(path)=>path.endsWith('/search')?result:{documents:[]});await w.run('tab="docs";renderDocs()');w.nodes['#doc-query'].value='budget';w.nodes['#semantic-search'].checked=true;return w}
test('semantic search fallback reports the actual method and the missing-index warning',async()=>{
 const w=await setup({method:'bm25',warnings:['No vectors for this model; index the app evidence first.'],matches:[{title:'Budget',text:'Retrieved passage',citation:'doc:0'}]});await w.nodes['#search-doc'].onclick();
 assert.match(w.nodes['#matches'].innerHTML,/Search method: Keyword search/);assert.match(w.nodes['#matches'].innerHTML,/No vectors for this model/);assert.match(w.nodes['#matches'].innerHTML,/Retrieved passage/);assert.ok(!w.nodes['#matches'].innerHTML.includes('Keyword + semantic search'));
});
test('hybrid search preserves stale-index warnings and escapes their text',async()=>{
 const w=await setup({method:'bm25+cosine+rrf',warnings:['Outdated vectors were excluded; reindex the app evidence.','<img src=x onerror=alert(1)>'],matches:[]});await w.nodes['#search-doc'].onclick();
 const html=w.nodes['#matches'].innerHTML;assert.match(html,/Keyword \+ semantic search/);assert.match(html,/Outdated vectors were excluded/);assert.match(html,/No matching excerpts/);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));
 w.nodes['#doc-query'].oninput();assert.equal(w.nodes['#matches'].innerHTML,'');
});
test('an absent method is never inferred from the requested semantic-search toggle',async()=>{
 const w=await setup({matches:[]});await w.nodes['#search-doc'].onclick();assert.match(w.nodes['#matches'].innerHTML,/Search method: Not reported/);
});
