import type {TemporaryReport} from './temporaryReport';
/** One focused result view owns its pending mutation or export. */
export function runOperations(){
 let live=false,generation=0,busy=false;
 return {
  start(onBusy:(value:boolean)=>void){live=true;generation++;busy=false;onBusy(false)},
  dispose(){live=false;generation++;busy=false},
  async execute<T>(work:(current:()=>boolean)=>Promise<T>,success:(value:T)=>void,onError:(message:string)=>void,onBusy:(value:boolean)=>void,fallback:string){
   if(!live||busy)return false;
   const version=generation,current=()=>live&&generation===version;busy=true;onBusy(true);
   try{const value=await work(current);if(!current())return false;onError('');success(value);return true}
   catch(error){if(current())onError(error instanceof Error?error.message:fallback);return false}
   finally{if(current()){busy=false;onBusy(false)}}
  },
 };
}
export interface ReportRuntime {web:boolean;shareText:(text:string)=>Promise<unknown>;file:()=>TemporaryReport;available:()=>Promise<boolean>;shareFile:(uri:string)=>Promise<unknown>}
/** Recheck the view after asynchronous stages; cleanup never masks the primary failure. */
export async function shareRunReport(read:()=>Promise<string>,current:()=>boolean,runtime:ReportRuntime){
 let file:TemporaryReport|undefined,failed=false;
 try{
  const text=await read();if(!current())return;
  if(runtime.web){await runtime.shareText(text);return}
  file=runtime.file();file.create();file.write(text);
  const available=await runtime.available();if(!current())return;
  if(!available)throw new Error('Sharing is unavailable on this device');
  await runtime.shareFile(file.uri);
 }catch(error){failed=true;throw error}
 finally{try{if(file?.exists)file.delete()}catch{if(!failed&&current())throw new Error('Could not remove the temporary report file.')}}
}
