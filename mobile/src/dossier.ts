import {characterCount} from './experience/textMetrics';
/** Deterministic dossier preparation. No legal/eligibility or authenticity inference. */
export type DocumentState = 'missing' | 'expired' | 'present_unverified';
export interface DossierDocument {name:string;expires:string;reference:string}
export interface DossierInput {as_of:string;requirements:string[];documents:DossierDocument[]}
export interface DossierCheck {requirement:string;status:DocumentState;reference:string|null;expires:string|null}
export interface DossierAssessment {
  as_of:string;checks:DossierCheck[];
  counts:{missing:number;expired:number;present_unverified:number};
  note:string;
}

/** ISO calendar date only; avoid timezone conversion and JS date normalization. */
export function isCalendarDate(value:unknown):value is string {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8,10));
  const leap=year%4===0&&(year%100!==0||year%400===0);
  const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  return year>=1&&month>=1&&month<=12&&day>=1&&day<=days[month-1];
}

export function dossierIssue(value:unknown):string|null {
  if(!value||typeof value!=='object'||Array.isArray(value))return 'Provide a dossier object.';
  const d=value as Record<string,unknown>;
  if(!isCalendarDate(d.as_of))return 'Use a valid review date in YYYY-MM-DD format.';
  if(!Array.isArray(d.requirements)||d.requirements.length===0)return 'Add at least one checklist requirement.';
  if(d.requirements.length>500)return 'Use no more than 500 checklist requirements.';
  const names=new Set<string>();
  for(const name of d.requirements){
    if(typeof name!=='string'||!name.trim()||characterCount(name)>100000)return 'Each requirement needs a non-empty name within 100,000 characters.';
    if(names.has(name))return 'Remove duplicate checklist requirement names.';
    names.add(name);
  }
  if(!Array.isArray(d.documents)||d.documents.length>500)return 'Provide no more than 500 document records.';
  const records=new Set<string>();
  for(const value of d.documents){
    if(!value||typeof value!=='object'||Array.isArray(value))return 'Each document must be an object with a name, expiry and reference.';
    const doc=value as Record<string,unknown>;
    if(typeof doc.name!=='string'||!doc.name.trim()||characterCount(doc.name)>100000)return 'Each document needs a non-empty name within 100,000 characters.';
    if(records.has(doc.name))return 'Resolve duplicate document names before checking the dossier.';
    records.add(doc.name);
    if(typeof doc.reference!=='string'||characterCount(doc.reference)>100000)return 'Each document reference must be text within 100,000 characters.';
    if(typeof doc.expires!=='string'||(doc.expires!==''&&!isCalendarDate(doc.expires)))return 'Use YYYY-MM-DD for expiry dates, or leave expiry blank when unknown.';
  }
  return null;
}

export function assessDossier(value:unknown):DossierAssessment {
  const issue=dossierIssue(value);if(issue)throw new Error(issue);
  const d=value as DossierInput;
  const records=new Map(d.documents.map(doc=>[doc.name,doc]));
  const counts={missing:0,expired:0,present_unverified:0};
  const checks=d.requirements.map(requirement=>{
    const doc=records.get(requirement);
    const status:DocumentState=!doc?'missing':doc.expires&&doc.expires<d.as_of?'expired':'present_unverified';
    counts[status]++;
    return {requirement,status,reference:doc?doc.reference:null,expires:doc?.expires||null};
  });
  return {as_of:d.as_of,checks,counts,note:'User-supplied checklist. Presence and recorded expiry do not establish authenticity, visa eligibility or approval.'};
}
