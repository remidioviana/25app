export type SourceRequest=AbortController;
/** Catalogue snapshots and live reads must not overwrite one another. */
export function sourceRequestScope(){
 let live=false,catalogue:SourceRequest|null=null,read:SourceRequest|null=null;
 function clearCatalogue(){catalogue?.abort();catalogue=null}
 function clearRead(){read?.abort();read=null}
 return {
  start(){live=true},
  dispose(){live=false;clearCatalogue();clearRead()},
  catalogue(){if(!live||read)return null;clearCatalogue();return catalogue=new AbortController()},
  read(){if(!live||read)return null;clearCatalogue();return read=new AbortController()},
  current(request:SourceRequest){return live&&!request.signal.aborted&&(request===catalogue||request===read)},
  finish(request:SourceRequest){if(request===catalogue)catalogue=null;if(request===read)read=null},
  cancelRead:clearRead,
 };
}
