import type {AgentAPI} from './api';
import type {Run,RunSummary} from './types';
/** A focused history view owns its list and latest case selection. */
export function historyRequests(api:Pick<AgentAPI,'runs'|'run'>|null,agent:string,view:{runs:(rows:RunSummary[])=>void;error:(message:string)=>void;open:(run:Run)=>void}){
 let live=false,generation=0,selection=0,pendingId:string|null=null;
 const current=(version:number)=>live&&version===generation;
 return {
  async start(){const version=++generation;live=true;selection++;pendingId=null;view.runs([]);view.error('');if(!api)return;try{const result=await api.runs(agent);if(current(version))view.runs(result.runs)}catch{if(current(version))view.error('Private case history is temporarily unavailable.')}},
  dispose(){live=false;generation++;selection++;pendingId=null},
  async open(id:string){
   if(!api||!live||pendingId===id)return false;
   const version=generation,request=++selection;pendingId=id;
   const selected=()=>current(version)&&request===selection;
   try{const run=await api.run(id);if(!selected())return false;view.error('');view.open(run);return true}
   catch{if(selected())view.error('Could not open that case.');return false}
   finally{if(selected())pendingId=null}
  },
 };
}
