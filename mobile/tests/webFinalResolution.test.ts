import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace} from './webWorkspaceHarness';
function visible(result:any){const w=workspace();w.run(`currentRun=${JSON.stringify({id:'resolution',status:'completed',events:[],result:{analysis:{},evidence:[],...result}})};renderResultOriginal();`);return w.nodes['#right'].innerHTML.split('<details><summary>Complete JSON result')[0]}
test('completed executions with missing information show the final questions prominently',()=>{
 const html=visible({decision:'needs_information',final_response:{outcome:'needs_information',questions:['Which contract deadline applies?'],limitations:[]},critique:{verdict:'revise',issues:['Superseded issue']}});
 assert.match(html,/More information needed/);assert.match(html,/Which contract deadline applies/);assert.ok(!html.includes('Final answer prepared by auditor'));assert.ok(!html.includes('Superseded issue'));
});
test('inconclusive answers preserve the final limitations without implying an answered outcome',()=>{
 const html=visible({decision:'inconclusive',final_response:{outcome:'inconclusive',questions:[],limitations:['Current applicability is not established.']}});
 assert.match(html,/Answer limited by available evidence/);assert.match(html,/Current applicability is not established/);assert.ok(!html.includes('Final answer prepared by auditor'));
});
test('a consistent answered final response supersedes earlier requests for revision',()=>{
 const html=visible({decision:'reviewed_by_model',critique:{verdict:'revise',issues:['Earlier issue']},final_response:{outcome:'answered',questions:[],limitations:[]}});
 assert.match(html,/Final answer prepared by auditor/);assert.ok(!html.includes('Earlier issue'));
});
test('inconsistent, missing or contradictory final metadata cannot invent final approval',()=>{
 for(const result of [{},{final_response:{outcome:'answered',questions:[],limitations:[]}},{decision:'inconclusive',final_response:{outcome:'answered',questions:['Unrelated question'],limitations:[]}},{decision:'reviewed_by_model',final_response:{outcome:'answered'}},{decision:'reviewed_by_model',final_response:{outcome:'answered',questions:[],limitations:['Still unresolved']}}]){
  const html=visible(result);assert.ok(!html.includes('Final answer prepared by auditor'));assert.ok(!html.includes('Unrelated question'));
 }
});
test('final questions and limitations are escaped and ignore malformed list entries',()=>{
 const html=visible({decision:'needs_information',final_response:{outcome:'needs_information',questions:['<script>alert(1)</script>',null,{}],limitations:['<img src=x>']}});
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('[object Object]'));
});
