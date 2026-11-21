import {ApiError} from './api';
import type {AgentAPI} from './api';
import type {Run} from './types';
export interface PollClock {schedule:(work:()=>Promise<void>,delay:number)=>unknown;cancel:(handle:unknown)=>void}
/** Read an existing run only; never restart execution to recover its status. */
export function pollRunStatus(api:Pick<AgentAPI,'run'>,id:string,view:{run:(value:Run)=>void;error:(message:string)=>void},clock:PollClock={schedule:(work,delay)=>setTimeout(work,delay),cancel:handle=>clearTimeout(handle as ReturnType<typeof setTimeout>)}){
 let stopped=false,failures=0,timer:unknown;const controller=new AbortController();
 const current=()=>!stopped&&!controller.signal.aborted;
 function later(delay:number){timer=clock.schedule(read,delay)}
 async function read(){
  if(!current())return;
  try{const next=await api.run(id,controller.signal);if(!current())return;failures=0;view.run(next);view.error('');if(['queued','running'].includes(next.status))later(2000);else stopped=true}
  catch(error){
   if(!current())return;
   const status=error instanceof ApiError?error.status:undefined,transient=status===undefined||status===408||(status>=500&&status<600);
   if(transient&&failures<3){failures++;if(failures===1)view.error('Connection interrupted. Retrying run status…');later(1000*2**failures)}
   else{stopped=true;view.error((error instanceof Error?error.message:'Connection failed')+'. Status updates stopped. Tap Refresh run status to try again.')}
  }
 }
 view.error('');later(500);
 return ()=>{stopped=true;clock.cancel(timer);controller.abort()};
}
