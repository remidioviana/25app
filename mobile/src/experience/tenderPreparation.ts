import {isCalendarDate} from '../dossier';
export interface TenderInput {requirements:string[];capabilities:string[];deadline:string;as_of:string}
export function tenderIssue(value:unknown):string|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return 'Provide tender preparation inputs.';
 const d=value as Record<string,unknown>;
 if(!isCalendarDate(d.as_of)||!isCalendarDate(d.deadline))return 'Use valid YYYY-MM-DD review and deadline dates.';
 for(const key of ['requirements','capabilities']){
  const list=d[key];if(!Array.isArray(list)||list.length>500||list.some(x=>typeof x!=='string'||!x.trim()||x.length>100000))return 'Use up to 500 non-empty names in each list.';
  if(new Set(list).size!==list.length)return 'Remove duplicate '+key+' names before preparing the bid.';
 }
 if(!(d.requirements as string[]).length)return 'Add at least one tender requirement.';
 return null;
}
function calendarDay(date:string){const value=new Date(0);value.setUTCFullYear(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8,10)));value.setUTCHours(0,0,0,0);return value.getTime()/86400000}
export function prepareTender(value:unknown){
 const issue=tenderIssue(value);if(issue)throw Error(issue);const input=value as TenderInput;
 const capabilities=new Set(input.capabilities),requirements=input.requirements.map((name,index)=>({id:'R'+String(index+1).padStart(2,'0'),name,recorded_match:capabilities.has(name),next_action:capabilities.has(name)?'Attach supporting documentation and confirm applicability.':'Gather or clarify the capability evidence.'}));
 const gaps=requirements.filter(x=>!x.recorded_match),days=calendarDay(input.deadline)-calendarDay(input.as_of);
 return {requirements,gaps:gaps.length,recorded_matches:requirements.length-gaps.length,calendar_days_between_dates:days,deadline_state:days<0?'past_recorded_deadline':days===0?'same_calendar_date':'before_recorded_deadline',draft_dependency:gaps.length?'Resolve '+gaps.length+' capability gap'+(gaps.length===1?'':'s')+' before treating the preparation pack as ready.':'All requirement names have recorded matches; source documents and official qualification remain unverified.'};
}
export function toggleTenderCapability(value:unknown,name:string):TenderInput{
 const issue=tenderIssue(value);if(issue)throw Error(issue);const input=value as TenderInput;
 if(!input.requirements.includes(name))throw Error('Select a requirement in this tender.');
 const next={...input,requirements:[...input.requirements],capabilities:input.capabilities.includes(name)?input.capabilities.filter(x=>x!==name):[...input.capabilities,name]};
 const nextIssue=tenderIssue(next);if(nextIssue)throw Error(nextIssue);return next;
}
export function tenderReport(value:unknown){
 const plan=prepareTender(value),input=value as TenderInput;
 if([...input.requirements,...input.capabilities].reduce((n,x)=>n+x.length,0)>500000)throw Error('Keep preparation packs within 500,000 text characters.');
 return JSON.stringify({format:'munagasah.preparation.v1',input,plan,source:'user_supplied_requirement_and_capability_lists',document_evidence_verified:false,official_qualification_verified:false,submission_status:'not_submitted',deadline_basis:'Calendar-date difference from the supplied review date; no live countdown or closing time verification.'},null,2)+'\n';
}
