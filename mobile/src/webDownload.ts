export interface DownloadRuntime {create:(blob:Blob)=>string;revoke:(url:string)=>void;link:()=>{href:string;download:string;click:()=>void};defer:(cleanup:()=>void)=>unknown}
/** Keep the object URL alive for download initiation, then release it even on failure. */
export function downloadText(text:string,filename:string,mime:string,runtime:DownloadRuntime={create:blob=>URL.createObjectURL(blob),revoke:url=>URL.revokeObjectURL(url),link:()=>document.createElement('a'),defer:cleanup=>setTimeout(cleanup,1000)}){
 const url=runtime.create(new Blob([text],{type:mime}));
 try{const link=runtime.link();link.href=url;link.download=filename;link.click()}
 finally{runtime.defer(()=>runtime.revoke(url))}
}
