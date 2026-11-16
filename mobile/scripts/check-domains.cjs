// Render the actual domain components with React DOM adapters. Not native/visual QA.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'../..'),original=Module._load;let id,draft;
const validatorPath=path.join(root,'mobile/src/validateInput.ts');const validator=new Module(validatorPath,module);validator._compile(ts.transpileModule(fs.readFileSync(validatorPath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,validatorPath);
const element=tag=>function TestElement({children}){return React.createElement(tag,{},children)};
Module._load=function(name,parent,isMain){
 if(name==='react-native')return {View:element('div'),Text:element('span'),TextInput:()=>React.createElement('input'),Switch:()=>React.createElement('input'),Pressable:element('button')};
 if(name==='react-native-svg')return {__esModule:true,default:element('svg'),Circle:()=>React.createElement('circle')};
 if(name==='../src/AppState')return {spec:require(path.join(root,'agents',id,'agent.json')),useApp:()=>({draft,setDraft:()=>{}})};
 if(name==='../src/validateInput')return validator.exports;
 if(name==='../src/brand')return {brandId:id};
 if(name==='../src/theme')return {styles:{},colors:{accent:'#059669'}};
 if(name==='./Controls')return {Button:({title})=>React.createElement('button',{},title)};
 return original.apply(this,arguments);
};
let passed=0;
for(const brand of require('../../brand-assets/brands.json')){
 id=brand.id;draft=require(path.join(root,'agents',id,'agent.json')).example;
 const filename=path.join(root,'mobile/components/DomainExperience.tsx');const m=new Module(filename,module);m.filename=filename;m.paths=module.paths;
 m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
 try{const html=renderToStaticMarkup(React.createElement(m.exports.DomainExperience));assert.ok(html.length>200);assert.ok(!/NaN|undefined/.test(html));draft={};const invalid=renderToStaticMarkup(React.createElement(m.exports.DomainExperience));assert.match(invalid,/Complete your inputs/);draft=structuredClone(require(path.join(root,'agents',id,'agent.json')).example);for(const key of Object.keys(draft))if(Array.isArray(draft[key]))draft[key]=[];const empty=renderToStaticMarkup(React.createElement(m.exports.DomainExperience));assert.ok(!/NaN|undefined/.test(empty));console.log('PASS '+id+' (example, invalid draft, empty lists)');passed++}catch(e){console.error('FAIL '+id+': '+e.message);process.exitCode=1}
}
Module._load=original;console.log(`${passed}/25 domain components rendered with supplied example schemas. Not visual QA.`);
