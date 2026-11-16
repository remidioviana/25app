// Run with jsdom available in NODE_PATH. Behavioral adapter test, not visual QA.
const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const dom=new JSDOM('<div id="root"></div>');global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),ts=require('typescript');
const original=Module._load;let edit;
function View({children}){return React.createElement('div',{},children)}
function TextInput({onChangeText,value}){edit=onChangeText;return React.createElement('input',{value,readOnly:true})}
function Button({title,onPress,disabled,busy}){return React.createElement('button',{onClick:onPress,disabled:disabled||busy},title)}
Module._load=function(name){if(name==='react-native')return {View,Text:View,TextInput};if(name==='../src/theme')return {styles:{},colors:{}};if(name==='./Controls')return {Button};return original.apply(this,arguments)};
const file=path.resolve(__dirname,'../components/EvidenceSearch.tsx'),m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);Module._load=original;
const root=createRoot(document.getElementById('root'));let requests=[];
const api={searchEvidence:(agent,query,signal)=>new Promise((resolve,reject)=>requests.push({agent,query,signal,resolve,reject}))};
const body=()=>document.body.textContent;
const click=async title=>act(async()=>[...document.querySelectorAll('button')].find(x=>x.textContent===title).click());
const response=text=>({matches:[{citation:'document:0',title:'Evidence title',text,source:'Supplied reference',as_of:'2026-11-15'}],warnings:[],method:'bm25'});
(async()=>{
 await act(async()=>root.render(React.createElement(m.exports.EvidenceSearch,{api,agent:'mizan'})));
 await act(async()=>edit('budget'));await click('Search documents');assert.equal(requests[0].agent,'mizan');
 await act(async()=>requests[0].resolve(response('Retrieved excerpt')));assert.match(body(),/Retrieved excerpt/);assert.match(body(),/document:0/);assert.match(body(),/Supplied reference/);
 await act(async()=>edit('old query'));await click('Search documents');const old=requests.at(-1);
 await click('Cancel search');assert.ok(old.signal.aborted);await act(async()=>old.resolve(response('STALE RESULT')));assert.ok(!body().includes('STALE RESULT'));
 await act(async()=>edit('missing'));await click('Search documents');await act(async()=>requests.at(-1).resolve({matches:[],warnings:[],method:'bm25'}));assert.match(body(),/No matching evidence/);
 await act(async()=>edit('failure'));await click('Search documents');await act(async()=>requests.at(-1).reject(Error('Test search failure')));assert.match(body(),/Test search failure/);
 await act(async()=>edit('pending'));await click('Search documents');const pending=requests.at(-1);
 await act(async()=>root.render(React.createElement(m.exports.EvidenceSearch,{api:{...api},agent:'mizan'})));assert.ok(pending.signal.aborted);assert.ok(!body().includes('Test search failure'));assert.equal(document.querySelector('input').value,'');
 console.log('PASS: evidence excerpts/references, app scope, cancel, stale-result suppression, empty state, error state and connection-change reset. Not visual QA.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await act(async()=>root.unmount());dom.window.close()});
