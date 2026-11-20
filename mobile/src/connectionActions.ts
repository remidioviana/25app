/** Focus-scoped connection form actions; persistence remains owned by AppState. */
export function connectionActions(){
 let live=false,generation=0,busy=false;
 const current=(version:number)=>live&&generation===version;
 return {
  start(onBusy:(value:boolean)=>void){live=true;generation++;busy=false;onBusy(false)},
  dispose(){live=false;generation++;busy=false},
  async run(operation:()=>Promise<void>,success:()=>void,onError:(message:string)=>void,onBusy:(value:boolean)=>void){
   if(!live||busy)return false;
   const version=generation;busy=true;onBusy(true);onError('');
   try{await operation();if(!current(version))return false;success();return true}
   catch(error){if(current(version))onError(error instanceof Error?error.message:'Connection operation failed.');return false}
   finally{if(current(version)){busy=false;onBusy(false)}}
  },
 };
}
