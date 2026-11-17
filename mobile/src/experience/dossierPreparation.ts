import {assessDossier,dossierIssue,type DossierInput} from '../dossier';

/** Edit a supplied record, never promote a recorded reference into verified evidence. */
export function updateDossierRecord(value:unknown,name:string,record:{reference:string;expires:string}|null):DossierInput{
 const issue=dossierIssue(value);if(issue)throw Error(issue);
 const input=value as DossierInput;
 if(!input.requirements.includes(name))throw Error('Choose an item in the supplied checklist.');
 const documents=input.documents.filter(doc=>doc.name!==name);
 if(record)documents.push({name,reference:record.reference,expires:record.expires});
 const next={as_of:input.as_of,requirements:[...input.requirements],documents};
 const nextIssue=dossierIssue(next);if(nextIssue)throw Error(nextIssue);
 return next;
}
export function dossierExport(value:unknown){
 const issue=dossierIssue(value);if(issue)throw Error(issue);
 const input=value as DossierInput;
 // Bound serialization before copying or allocating a potentially enormous export.
 const length=input.requirements.reduce((n,x)=>n+x.length,0)+input.documents.reduce((n,d)=>n+d.name.length+d.reference.length+d.expires.length,0);
 if(length>500000)throw Error('Keep dossier exports within 500,000 text characters.');
 return JSON.stringify({format:'iqamah.preparation.v1',checklist_origin:'user_supplied',document_authenticity_verified:false,eligibility_determined:false,application_submitted:false,input,assessment:assessDossier(input)},null,2)+'\n';
}
