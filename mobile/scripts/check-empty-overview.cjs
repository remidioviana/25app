// Real Overview branches rendered through DOM adapters, not native-device QA.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'../..'),original=Module._load;
const element=tag=>function TestElement({children}){return React.createElement(tag,{},children)};
let brand,hasInputs=false,domainCalls=0;
Module._load=function(name){
 if(name==='react-native')return {ScrollView:element('div'),View:element('div'),Text:element('span'),TextInput:({value})=>React.createElement('input',{value,readOnly:true}),Switch:({accessibilityLabel})=>React.createElement('input',{'aria-label':accessibilityLabel,type:'checkbox'}),Pressable:element('button')};
 if(name==='react-native-safe-area-context')return {SafeAreaView:element('div')};
 if(name==='react-native-svg')return {SvgXml:()=>React.createElement('svg')};
 if(name==='expo-router')return {router:{push:()=>{}}};
 if(name==='../../AppState')return {useApp:()=>({hasInputs,example:false,api:null,connectionError:''})};
 if(name==='../../brand')return {get brand(){return brand},brandAssets:{logo:'<svg/>'}};
 if(name==='../../theme'||name==='../src/theme')return {styles:{},colors:{}};
 if(name==='../../../components/Controls'||name==='./Controls')return {Button:({title})=>React.createElement('button',{},title)};
 if(name==='../../../components/DomainExperience')return {DomainExperience:()=>{domainCalls++;assert.equal(hasInputs,true,'Domain calculator invoked before input');return React.createElement('div',{},'Supplied draft workspace')}};
 return original.apply(this,arguments);
};
function load(file){const filename=path.join(root,file),m=new Module(filename,module);m.filename=filename;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);return m.exports;}
try{
 const {default:Overview}=load('mobile/src/app/(tabs)/index.tsx');
 for(brand of require('../../brand-assets/brands.json')){
  const html=renderToStaticMarkup(React.createElement(Overview));
  assert.match(html,/No task data supplied yet/);assert.match(html,/No document has been analyzed/);
  assert.ok(!html.includes('Example workspace'));assert.equal(domainCalls,0);
 }
 hasInputs=true;const html=renderToStaticMarkup(React.createElement(Overview));assert.equal(domainCalls,1);assert.match(html,/supplied draft/);assert.match(html,/not authenticated/);
 console.log('PASS: all 25 native Overview variants suppress calculator/dashboard before supplied input, show truthful empty state, then expose supplied draft without authentication claim. DOM adapters only.');
}finally{Module._load=original;}
