import type {AgentAPI} from './api';
import type {Schedule} from './types';
type API=Pick<AgentAPI,'schedules'|'schedule'|'disableSchedule'>;
/** One mounted agenda session owns its reads, writes and busy state. */
export function agendaRequests(api:API,agent:string,view:{items:(rows:Schedule[])=>void;busy:(value:boolean)=>void;error:(message:string)=>void}){
 let live=false,generation=0,listRequest=0,busy=false;
 const current=(version:number)=>live&&version===generation;
 const message=(error:unknown,fallback:string)=>error instanceof Error?error.message:fallback;
 async function load(version:number,confirmed?:string){
  const request=++listRequest;
  try{const result=await api.schedules(agent);if(current(version)&&request===listRequest)view.items(result.schedules)}
  catch(error){if(current(version)&&request===listRequest)view.error(confirmed?confirmed+' The list could not refresh. Reopen Schedule to reload it.':message(error,'Could not load schedules.'))}
 }
 async function mutate(operation:()=>Promise<unknown>,failure:string,confirmed:string){
  if(!live||busy)return false;
  const version=generation;busy=true;view.busy(true);
  try{await operation();if(!current(version))return false;view.error('');await load(version,confirmed);return true}
  catch(error){if(current(version))view.error(message(error,failure));return false}
  finally{if(current(version)){busy=false;view.busy(false)}}
 }
 return {
  start(){live=true;generation++;busy=false;view.items([]);view.busy(false);return load(generation)},
  dispose(){live=false;generation++;busy=false},
  create:(payload:unknown)=>mutate(()=>api.schedule(agent,payload),'Scheduling failed.','Schedule created.'),
  disable:(id:string)=>mutate(()=>api.disableSchedule(id),'Could not disable schedule.','Future runs disabled.'),
 };
}
