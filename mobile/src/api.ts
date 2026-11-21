import {characterCount} from './experience/textMetrics';
import type {Agent,Config,Run,RunSummary,Document,ImportFile,Schedule,Intake,Mode,Json,EvidenceSearchResult,PublicSourcesResult,PublicSourceRefresh} from './types';

export class ApiError extends Error {constructor(message:string,public status:number){super(message);this.name='ApiError'}}
export function serverURL(raw:string,allowLocalHttp=false):string {
  const url=new URL(raw.trim());
  if(url.username||url.password||url.search||url.hash||!(url.pathname==='/'||url.pathname===''))throw new Error('Use the server HTTPS origin without a path, credentials or query parameters.');
  const local=/^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(url.hostname);
  if(url.protocol!=='https:'&&!(allowLocalHttp&&url.protocol==='http:'&&local))throw new Error('Use HTTPS. Local HTTP is available only in development.');
  return url.origin;
}
export class AgentAPI {
  readonly origin:string;
  constructor(origin:string,private token:string,allowLocalHttp=false,private transport:typeof fetch=(input,init)=>globalThis.fetch(input,init)){this.origin=serverURL(origin,allowLocalHttp)}
  async request<T>(path:string,method='GET',body?:unknown,extra:Record<string,string>={},signal?:AbortSignal):Promise<T>{
    if(!path.startsWith('/api/')||path.includes('://'))throw new Error('Invalid API path');
    const controller=new AbortController();const cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});
    if(signal?.aborted)controller.abort();const timer=setTimeout(cancel,200_000);
    try {
      const response=await this.transport(this.origin+path,{method,headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'}),...(this.token?{Authorization:'Bearer '+this.token}:{}),...extra},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,redirect:'error'});
      let data:unknown;
      try{data=await response.json()}catch(error){
        if(controller.signal.aborted||response.ok)throw error;
        throw new ApiError('Server request failed',response.status);
      }
      if(!response.ok){
        const message=data!==null&&typeof data==='object'&&!Array.isArray(data)?(data as Record<string,unknown>).error:undefined;
        throw new ApiError(typeof message==='string'&&message.trim()?message:'Server request failed',response.status);
      }
      return data as T;
    } finally {clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
  }
  config(){return this.request<Config>('/api/config')}
  me(){return this.request<{user:string}>('/api/me')}
  agents(){return this.request<{agents:Agent[]}>('/api/agents')}
  runs(agent:string){return this.request<{runs:RunSummary[]}>(`/api/agents/${encodeURIComponent(agent)}/runs`)}
  run(id:string,signal?:AbortSignal){return this.request<Run>(`/api/runs/${encodeURIComponent(id)}`,'GET',undefined,{},signal)}
  start(agent:string,goal:string,input:Record<string,Json>,mode:Mode,example:boolean,idempotencyKey:string){return this.request<Run>(`/api/agents/${encodeURIComponent(agent)}/runs`,'POST',{goal,input,mode,example},{'Idempotency-Key':idempotencyKey})}
  action(id:string,action:'cancel'|'retry'){return this.request<Run>(`/api/runs/${encodeURIComponent(id)}/${action}`,'POST',{})}
  review(run:Run,decision:'accepted'|'rejected'){return this.request<Run>(`/api/runs/${encodeURIComponent(run.id)}/review`,'POST',{decision,artifact_hash:run.artifact_hash})}
  intake(agent:string,request:string){return this.request<Intake>(`/api/agents/${encodeURIComponent(agent)}/intake`,'POST',{request})}
  documents(agent:string,signal?:AbortSignal){return this.request<{documents:Document[]}>(`/api/agents/${encodeURIComponent(agent)}/documents`,'GET',undefined,{},signal)}
  publicSources(agent:string,signal?:AbortSignal){return this.request<PublicSourcesResult>(`/api/agents/${encodeURIComponent(agent)}/sources`,'GET',undefined,{},signal)}
  refreshPublicSource(agent:string,sourceId:string,signal?:AbortSignal){
    if(!/^[a-z0-9][a-z0-9-]{0,63}$/.test(sourceId))return Promise.reject(new Error('Choose an approved source identifier.'));
    return this.request<PublicSourceRefresh>(`/api/agents/${encodeURIComponent(agent)}/sources`,'POST',{source_id:sourceId},{},signal);
  }
  searchEvidence(agent:string,query:string,signal?:AbortSignal){
    const normalized=query.trim();
    if(!normalized||characterCount(normalized)>2000)return Promise.reject(new Error('Enter a search query of 1 to 2,000 characters.'));
    return this.request<EvidenceSearchResult>(`/api/agents/${encodeURIComponent(agent)}/search`,'POST',{query:normalized,semantic:false},{},signal);
  }
  preview(filename:string,base64:string,signal?:AbortSignal){return this.request<{text:string;warnings:string[]}>('/api/import/preview','POST',{filename,base64},{},signal)}
  addDocument(agent:string,title:string,text:string,source:string,as_of:string,importFile?:ImportFile,signal?:AbortSignal){return this.request<{id:string}>(`/api/agents/${encodeURIComponent(agent)}/documents`,'POST',{title,text,source,as_of,...(importFile?{import_file:importFile}:{})},{},signal)}
  schedules(agent:string){return this.request<{schedules:Schedule[]}>(`/api/agents/${encodeURIComponent(agent)}/schedules`)}
  schedule(agent:string,data:unknown){return this.request(`/api/agents/${encodeURIComponent(agent)}/schedules`,'POST',data)}
  disableSchedule(id:string){return this.request(`/api/schedules/${encodeURIComponent(id)}/disable`,'POST',{})}
  exportMarkdown(id:string){return this.download(`/api/runs/${encodeURIComponent(id)}/export/markdown`)}
  private async download(path:string):Promise<string>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
    try{const r=await this.transport(this.origin+path,{headers:this.token?{Authorization:'Bearer '+this.token}:{},signal:controller.signal,redirect:'error'});if(!r.ok)throw new ApiError('Export failed',r.status);return await r.text()}finally{clearTimeout(timer)}
  }
}
