import type {AgentAPI} from './api';
import type {Intake,Json} from './types';
/** Proposal identity follows the current goal revision and API session. */
export function intakeRequests(api:Pick<AgentAPI,'intake'>|null,agent:string,view:{proposal:(value:Intake|null)=>void;busy:(value:boolean)=>void;error:(message:string)=>void}){
 let live=false,generation=0,revision=0,active=false,accepted:Intake|null=null;
 const session=(version:number)=>live&&generation===version;
 return {
  get busy(){return active},
  start(){live=true;generation++;revision++;active=false;accepted=null},
  dispose(){live=false;generation++;revision++;accepted=null},
  goalChanged(){revision++;accepted=null;view.proposal(null)},
  async prepare(goal:string){
   if(!api||!live||active)return false;
   const version=generation,request=++revision,current=()=>session(version)&&revision===request;
   active=true;accepted=null;view.proposal(null);view.error('');view.busy(true);
   try{const result=await api.intake(agent,goal);if(!current())return false;accepted=result;view.proposal(result);return true}
   catch(error){if(current())view.error(error instanceof Error?error.message:'Input preparation failed.');return false}
   finally{if(session(version)){active=false;view.busy(false)}}
  },
  apply(proposal:Intake,commit:(input:Record<string,Json>)=>void){
   if(!live||accepted!==proposal||proposal.status!=='ready_for_review'||!proposal.input||typeof proposal.input!=='object'||Array.isArray(proposal.input))return false;
   accepted=null;view.proposal(null);commit(proposal.input);return true;
  },
 };
}
