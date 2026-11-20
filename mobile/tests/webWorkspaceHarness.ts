import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
export function workspace(){
 const source=fs.readFileSync(path.resolve(__dirname,'../../../public/app.js'),'utf8').replace(/boot\(\);\s*$/,'');
 const lists:Record<string,any[]>={};
 const nodes:Record<string,any>={'#mode':{value:'local'}};
 let requestIds=0;
 const downloads:{href:string;download:string}[]=[],revoked:string[]=[];let objectIds=0;
 const timers:{callback:()=>any;delay:number;cancelled:boolean}[]=[];
 const context=vm.createContext({window:{},Blob,sessionStorage:{},URL:{createObjectURL:()=>`blob:test-${++objectIds}`,revokeObjectURL:(url:string)=>revoked.push(url)},btoa:(value:string)=>Buffer.from(value,'binary').toString('base64'),document:{createElement:()=>{const link={href:'',download:'',click:()=>downloads.push({href:link.href,download:link.download})};return link},querySelectorAll:(key:string)=>lists[key]||[],querySelector:(key:string)=>nodes[key]??(nodes[key]={value:'',style:{}})},crypto:{randomUUID:()=>`test-request-${++requestIds}`},setTimeout:(callback:()=>any,delay:number)=>{timers.push({callback,delay,cancelled:false});return timers.length},clearTimeout:(id:number)=>{if(timers[id-1])timers[id-1].cancelled=true}});
 vm.runInContext(source,context);vm.runInContext(`const apiOriginal=api;const renderInputOriginal=renderInput;const toastOriginal=toast;const renderResultOriginal=renderResult;let renders=0,notices=[];renderInput=()=>{};workspace=()=>{};renderResult=()=>{renders++};toast=message=>notices.push(message);agents=[{id:'a',goal:'',schema:{type:'object',properties:{}},example:{amount:2}},{id:'b',goal:'',schema:{type:'object',properties:{}},example:{other:3}}];openAgent('a');`,context);
 return {timers,lists,downloads,revoked,setFetch:(transport:(...args:any[])=>any)=>{context.fetch=transport},setAPI:(transport:(...args:any[])=>any)=>{context.transport=transport;vm.runInContext('api=transport',context)},run:(code:string)=>vm.runInContext(code,context),state:()=>JSON.parse(vm.runInContext('JSON.stringify({inputs,isExample,hasInputs,view,beforeExample,currentRun,renders,notices})',context)),nodes};
}
