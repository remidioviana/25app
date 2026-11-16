// AppProvider behavioral regression with fake API/storage, not device validation.
const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const dom=new JSDOM('<div id="root"></div>');global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;global.__DEV__=false;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),ts=require('typescript');
const pending=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});return {promise,resolve,reject}};
let state,restore=pending(),saved=null,writeGate=null;const configs=new Map(),calls=[];
class API{constructor(url){this.origin=url}async config(){return configs.has(this.origin)?configs.get(this.origin).promise:{version:'fixture'}}async me(){return {user:'fixture'}}async agents(){calls.push(this.origin);return {agents:this.origin==='https://missing.test'?[]:[{id:'mizan'}]}}}
const original=Module._load;
Module._load=function(name){
 if(name==='./api')return {AgentAPI:API,serverURL:x=>x};if(name==='./brand')return {brandId:'mizan'};if(name==='./catalog')return {catalog:{mizan:{example:{amount:1}}}};
 if(name==='./session')return {loadConnection:()=>restore.promise,saveConnection:async value=>{if(writeGate)await writeGate.promise;saved=value},clearConnection:async()=>{saved=null}};
 return original.apply(this,arguments);
};
const file=path.resolve(__dirname,'../src/AppState.tsx'),m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);Module._load=original;
function Probe(){state=m.exports.useApp();return null}let root;
async function mount(){root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(m.exports.AppProvider,{},React.createElement(Probe))))}
async function unmount(){await act(async()=>root.unmount())}
(async()=>{
 await mount();await act(async()=>state.disconnect());await act(async()=>restore.resolve({url:'https://old.test',token:'fictional'}));assert.equal(state.api,null);assert.ok(!calls.includes('https://old.test'));
 const slow=pending();configs.set('https://slow.test',slow);let first;
 await act(async()=>{first=state.connect('https://slow.test','fictional',true)});
 await act(async()=>state.connect('https://new.test','fictional',true));await act(async()=>{slow.resolve({});await first});assert.equal(state.api.origin,'https://new.test');assert.equal(saved.url,'https://new.test');
 await act(async()=>{state.setRun({id:'old-run'});state.setDraft({private:'old'});state.setExample(false)});
 await act(async()=>state.connect('https://other.test','fictional',false));assert.equal(state.run,null);assert.deepEqual(state.draft,{amount:1});assert.equal(state.example,true);assert.equal(saved,null);
 writeGate=pending();let connecting,disconnecting;
 await act(async()=>{connecting=state.connect('https://writing.test','fictional',true);await Promise.resolve()});
 await act(async()=>{disconnecting=state.disconnect()});assert.equal(state.api,null);
 await act(async()=>{writeGate.resolve();await connecting;await disconnecting});assert.equal(saved,null);assert.equal(state.api,null);writeGate=null;
 await unmount();restore=pending();await mount();await act(async()=>restore.resolve({url:'https://missing.test',token:'fictional'}));assert.equal(state.api,null);assert.match(state.connectionError,/not configured/);assert.ok(calls.includes('https://missing.test'));
 console.log('PASS: disconnect supersedes restore, newest connect wins, connection change clears run/draft, queued credential writes cannot undo disconnect, restored session validates standalone app. Fake API/storage; no real credentials.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(root)await unmount();dom.window.close()});
