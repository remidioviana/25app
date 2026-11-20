import type {AgentAPI} from './api';
import type {Json,Mode} from './types';
type Client=Pick<AgentAPI,'start'>;
export interface MissionRequest {agent:string;goal:string;input:Record<string,Json>;mode:Mode;example:boolean}
/** Prevent overlapping submissions and preserve retry identity outside React render timing. */
export function missionSubmission(makeKey:()=>string){
 let active=false,pending:{api:Client;payload:string;key:string}|null=null;
 return {
  get busy(){return active},
  async submit(api:Client,request:MissionRequest){
   if(active)return null;
   active=true;
   try{
    const {agent,goal,input,mode,example}=request,payload=JSON.stringify([agent,goal,input,mode,example]);
    const key=pending?.api===api&&pending.payload===payload?pending.key:makeKey();
    pending={api,payload,key};
    const run=await api.start(agent,goal,input,mode,example,key);pending=null;return run;
   }finally{active=false}
  },
 };
}
