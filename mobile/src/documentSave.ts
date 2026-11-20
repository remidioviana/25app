/** Keep a confirmed document write distinct from a subsequent list refresh. */
export async function saveDocument(write:()=>Promise<unknown>,view:{current:()=>boolean;saved:()=>void;refresh:()=>Promise<void>;error:(message:string)=>void}){
 try{await write()}catch(error){if(view.current())view.error(error instanceof Error?error.message:'Save failed.');return false}
 if(!view.current())return false;
 view.saved();
 try{await view.refresh()}catch{if(view.current())view.error('Document saved. The evidence list could not refresh. Reopen Evidence to reload it.')}
 return true;
}
/** A synchronous lock covers both picking/importing and saving in one document editor. */
export function documentOperation(){
 let pending=false;
 return async(work:()=>Promise<void>,current:()=>boolean,onBusy:(value:boolean)=>void)=>{
  if(pending||!current())return false;
  pending=true;onBusy(true);
  try{await work();return true}
  finally{pending=false;if(current())onBusy(false)}
 };
}
