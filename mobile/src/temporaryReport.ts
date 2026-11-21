export interface TemporaryReport {uri:string;exists:boolean;create:()=>void;write:(text:string)=>void;delete:()=>void}
export interface ReportStorage {uri:string;exists:boolean;create:(options:{overwrite:boolean})=>void;write:(text:string)=>void;delete:()=>void}
export function temporaryReportName(stem:string,extension:string,nonce:string){
 if(!/^[a-z0-9][a-z0-9-]{0,79}$/i.test(stem)||! /^[a-z0-9]{1,8}$/i.test(extension)||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nonce))throw Error('Invalid temporary report identity.');
 return `${stem}-${nonce}.${extension}`;
}
/** Ownership begins only after successful exclusive creation. */
export function ownedTemporaryReport(file:ReportStorage):TemporaryReport{
 let owned=false;
 return {get uri(){return file.uri},get exists(){return owned&&file.exists},create(){if(owned)throw Error('Report file is already created.');file.create({overwrite:false});owned=true},write(text){if(!owned)throw Error('Report file was not created by this operation.');file.write(text)},delete(){if(!owned)return;if(file.exists)file.delete();owned=false}};
}
export function cleanupTemporaryReport(file:TemporaryReport|undefined){try{if(file?.exists)file.delete();return true}catch{return false}}
