// Behavioral React DOM adapters; not a native-device or visual layout test.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const {JSDOM}=require('jsdom'),React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),ts=require('typescript');
const dom=new JSDOM('<div id="root"></div>');global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
const original=Module._load;
function load(relative){const file=path.resolve(__dirname,relative),m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);return m.exports}
const adapter=load('../src/claimEvidence.ts');
const View=({children})=>React.createElement('div',{},children);
Module._load=function(name){if(name==='react-native')return {View,Text:View,Pressable:({children,onPress,accessibilityState})=>React.createElement('button',{'aria-expanded':accessibilityState.expanded,onClick:onPress},children)};if(name==='../src/theme')return {styles:{}};if(name==='../src/claimEvidence')return adapter;return original.apply(this,arguments)};
const {ClaimEvidence}=load('../components/ClaimEvidence.tsx');Module._load=original;
const root=createRoot(document.getElementById('root'));
const base={analysis:{},evidence:[],external_actions_performed:false};
const result={...base,evidence:[{citation:'doc:0',title:'Document',text:'Exact saved excerpt',source:'Supplied source',as_of:''}],draft:{claims:[{text:'Claim text',basis:'evidence',citations:['doc:0','missing:0']}]}};
(async()=>{
 await act(async()=>root.render(React.createElement(ClaimEvidence,{result:base})));assert.equal(document.body.textContent,'');
 await act(async()=>root.render(React.createElement(ClaimEvidence,{result})));
 assert.match(document.body.textContent,/Claim text/);assert.ok(!document.body.textContent.includes('Exact saved excerpt'));
 await act(async()=>document.querySelector('button').click());assert.equal(document.querySelector('button').getAttribute('aria-expanded'),'true');
 for(const text of ['Exact saved excerpt','Supplied source','Date not supplied','This reference is absent'])assert.ok(document.body.textContent.includes(text));
 await act(async()=>document.querySelector('button').click());assert.ok(!document.body.textContent.includes('Exact saved excerpt'));
 await act(async()=>root.render(React.createElement(ClaimEvidence,{result:{...base,draft:{claims:[{text:'No citation',basis:'evidence',citations:[]}]}}})));
 assert.match(document.body.textContent,/No citation recorded/);assert.equal(document.querySelector('button'),null);
 console.log('PASS: local omission, collapsed/expanded sources, exact saved excerpt, missing reference/date, missing citation, accessible expanded state. DOM behavior only; no visual QA.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await act(async()=>root.unmount());dom.window.close()});
