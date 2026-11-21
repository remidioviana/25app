import React,{createContext,useContext,useEffect,useState,useRef,useCallback} from 'react';
import {AgentAPI,serverURL} from './api';
import type {Config,Json,Run,WorkspaceDraft} from './types';
import {brandId} from './brand';
import {catalog} from './catalog';
import {loadConnection,saveConnection,clearConnection} from './session';
import {copyWorkspaceDraft,emptyWorkspace} from './forms';
type State={workspaceEpoch:number;api:AgentAPI|null;config:Config|null;draft:Record<string,Json>;setDraft:React.Dispatch<React.SetStateAction<Record<string,Json>>>;hasInputs:boolean;restoreDraft:(snapshot:WorkspaceDraft)=>void;commitDraft:(expected:Record<string,Json>,next:Record<string,Json>)=>boolean;run:Run|null;setRun:React.Dispatch<React.SetStateAction<Run|null>>;example:boolean;setExample:(x:boolean)=>void;connect:(url:string,token:string,remember:boolean)=>Promise<void>;disconnect:()=>Promise<void>;connectionError:string};
const Context=createContext<State|null>(null);
export const spec=catalog[brandId];
export function AppProvider({children}:{children:React.ReactNode}){
 const [api,setApi]=useState<AgentAPI|null>(null),[config,setConfig]=useState<Config|null>(null),[draft,setDraftValue]=useState<Record<string,Json>>(()=>emptyWorkspace(spec.schema).draft),[hasInputs,setHasInputs]=useState(false),[run,setRunValue]=useState<Run|null>(null),[example,setExample]=useState(false),[connectionError,setConnectionError]=useState('');
 const draftRef=useRef(draft),activeApi=useRef<AgentAPI|null>(null);
 const [workspaceEpoch,setWorkspaceEpoch]=useState(0);
 const setRun=useCallback((value:React.SetStateAction<Run|null>)=>{if(activeApi.current===api)setRunValue(value)},[api]);
 const revision=useRef(0),writes=useRef<Promise<void>>(Promise.resolve());
 // hasInputs means a draft was explicitly edited/applied, never that it is authentic.
 function setDraft(value:React.SetStateAction<Record<string,Json>>){const next=typeof value==='function'?value(draftRef.current):value;draftRef.current=next;setDraftValue(next);setHasInputs(true)}
 function restoreDraft(snapshot:WorkspaceDraft){const restored=copyWorkspaceDraft(snapshot);draftRef.current=restored.draft;setDraftValue(restored.draft);setHasInputs(restored.hasInputs);setExample(restored.example)}
 function commitDraft(expected:Record<string,Json>,next:Record<string,Json>){if(draftRef.current!==expected)return false;setDraft(next);return true}
 function reset(){activeApi.current=null;setApi(null);setConfig(null);setRunValue(null);draftRef.current=emptyWorkspace(spec.schema).draft;setDraftValue(draftRef.current);setHasInputs(false);setExample(false);setConnectionError('')}
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
  const id=++revision.current,hadConnection=api!==null;
  try{
   const client=new AgentAPI(serverURL(url,__DEV__),token,__DEV__),cfg=await validateClient(client);
   if(id!==revision.current)return;
   await persist(id,()=>remember?saveConnection({url:client.origin,token}):clearConnection());
   if(id!==revision.current)return;
   if(hadConnection){setWorkspaceEpoch(n=>n+1);reset()}else{setRunValue(null);setConnectionError('')}activeApi.current=client;setApi(client);setConfig(cfg);
  }catch(e){if(id===revision.current)throw e}
 }
 async function disconnect(){
  const id=++revision.current;setWorkspaceEpoch(n=>n+1);reset();
  try{await persist(id,clearConnection)}catch(e){if(id===revision.current){setConnectionError('Could not remove the saved connection.');throw e}}
 }
 useEffect(()=>{
  const lifecycle=revision,id=lifecycle.current;
  loadConnection().then(async saved=>{
   if(!saved||revision.current!==id)return;
   const client=new AgentAPI(saved.url,saved.token,__DEV__),cfg=await validateClient(client);
   if(revision.current===id){activeApi.current=client;setApi(client);setConfig(cfg)}
  }).catch(e=>{if(revision.current===id)setConnectionError(e instanceof Error?e.message:'Connection failed')});
  return()=>{lifecycle.current++};
 },[]);
 return <Context.Provider value={{workspaceEpoch,api,config,draft,setDraft,hasInputs,restoreDraft,commitDraft,run,setRun,example,setExample,connect,disconnect,connectionError}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw Error('App state is unavailable');return value}
