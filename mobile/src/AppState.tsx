import React,{createContext,useContext,useEffect,useState,useRef} from 'react';
import {AgentAPI,serverURL} from './api';
import type {Config,Json,Run} from './types';
import {brandId} from './brand';
import {catalog} from './catalog';
import {loadConnection,saveConnection,clearConnection} from './session';
import {emptyWorkspace} from './forms';
type State={api:AgentAPI|null;config:Config|null;draft:Record<string,Json>;setDraft:React.Dispatch<React.SetStateAction<Record<string,Json>>>;hasInputs:boolean;run:Run|null;setRun:React.Dispatch<React.SetStateAction<Run|null>>;example:boolean;setExample:(x:boolean)=>void;connect:(url:string,token:string,remember:boolean)=>Promise<void>;disconnect:()=>Promise<void>;connectionError:string};
const Context=createContext<State|null>(null);
export const spec=catalog[brandId];
export function AppProvider({children}:{children:React.ReactNode}){
 const [api,setApi]=useState<AgentAPI|null>(null),[config,setConfig]=useState<Config|null>(null),[draft,setDraftValue]=useState<Record<string,Json>>(()=>emptyWorkspace(spec.schema).draft),[hasInputs,setHasInputs]=useState(false),[run,setRun]=useState<Run|null>(null),[example,setExample]=useState(false),[connectionError,setConnectionError]=useState('');
 const revision=useRef(0),writes=useRef<Promise<void>>(Promise.resolve());
 // hasInputs means a draft was explicitly edited/applied, never that it is authentic.
 function setDraft(value:React.SetStateAction<Record<string,Json>>){setDraftValue(value);setHasInputs(true)}
 function reset(){setApi(null);setConfig(null);setRun(null);setDraftValue(emptyWorkspace(spec.schema).draft);setHasInputs(false);setExample(false);setConnectionError('')}
 function persist(id:number,write:()=>Promise<void>){
  const next=writes.current.catch(()=>{}).then(async()=>{if(revision.current===id)await write()});
  writes.current=next;return next;
 }
 async function validateClient(client:AgentAPI){
  const cfg=await client.config();await client.me();
  const apps=(await client.agents()).agents;
  if(!apps.some(a=>a.id===brandId))throw Error('This app is not configured on the server.');
  return cfg;
 }
 async function connect(url:string,token:string,remember:boolean){
  const id=++revision.current;
  try{
   const client=new AgentAPI(serverURL(url,__DEV__),token,__DEV__),cfg=await validateClient(client);
   if(id!==revision.current)return;
   await persist(id,()=>remember?saveConnection({url:client.origin,token}):clearConnection());
   if(id!==revision.current)return;
   reset();setApi(client);setConfig(cfg);
  }catch(e){if(id===revision.current)throw e}
 }
 async function disconnect(){
  const id=++revision.current;reset();
  try{await persist(id,clearConnection)}catch(e){if(id===revision.current){setConnectionError('Could not remove the saved connection.');throw e}}
 }
 useEffect(()=>{
  const lifecycle=revision,id=lifecycle.current;
  loadConnection().then(async saved=>{
   if(!saved||revision.current!==id)return;
   const client=new AgentAPI(saved.url,saved.token,__DEV__),cfg=await validateClient(client);
   if(revision.current===id){setApi(client);setConfig(cfg)}
  }).catch(e=>{if(revision.current===id)setConnectionError(e instanceof Error?e.message:'Connection failed')});
  return()=>{lifecycle.current++};
 },[]);
 return <Context.Provider value={{api,config,draft,setDraft,hasInputs,run,setRun,example,setExample,connect,disconnect,connectionError}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw Error('App state is unavailable');return value}
