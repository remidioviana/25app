interface PickedFile {name:string;uri:string;size?:number;base64?:string}
export async function pickedFileBase64(asset:PickedFile,platform:string,readNative:(uri:string)=>Promise<string>){
 if(!asset.name||asset.name.length>200)throw Error('Choose a filename of at most 200 characters.');
 if(asset.size!==undefined&&(!Number.isFinite(asset.size)||asset.size<=0||asset.size>2000000))throw Error('Choose a non-empty file up to 2 MB.');
 const raw=platform==='web'?asset.base64:await readNative(asset.uri);
 if(typeof raw!=='string')throw Error('The document picker did not return file content.');
 let base64=raw;
 if(/^data:/i.test(raw)){
  const comma=raw.indexOf(',');
  if(comma<0||!/^data:[^,]*;base64$/i.test(raw.slice(0,comma)))throw Error('The document picker must return a base64 data URL.');
  base64=raw.slice(comma+1);
 }
 if(!base64||base64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw Error('The selected file has invalid base64 content.');
 const bytes=base64.length/4*3-(base64.endsWith('==')?2:base64.endsWith('=')?1:0);
 if(bytes<=0||bytes>2000000)throw Error('Choose a non-empty file up to 2 MB.');
 return base64;
}
