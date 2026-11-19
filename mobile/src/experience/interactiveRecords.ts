import {characterCount,prohibitedTermHits} from './textMetrics';
import {isCalendarDate} from '../dossier';
import {timestampInput} from '../scheduleInput';
import type {Json} from '../types';
import {ledgerPreview} from './ledgerPreview';
export type RecordView='clauses'|'checkpoints'|'coverage'|'workforce'|'chronology'|'account'|'editorial'|'policy'|'manifest'|'competencies'|'onboarding'|'day'|'energy'|'budget'|'dining'|'receipts'|'dependencies'|'consumption'|'reflection'|'materials'|'chapters'|'accessibility'|'rescue';
export type InteractiveRecord={id:string;label:string;value:number;unit:string;detail:string;available:boolean;reference?:string;state:'recorded'|'attention'|'unknown'};
export type RecordScene={title:string;axis:string;view:RecordView;records:InteractiveRecord[]};
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:0;
const unique=(rows:any[])=>rows.filter((r,i)=>rows.findIndex(x=>x.id===r.id)===i);
const minutes=(v:string)=>{if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v))return NaN;const [h,m]=v.split(':').map(Number);return h*60+m};
const duration=(start:string,end:string)=>{const delta=minutes(end)-minutes(start);return delta>=0?delta:NaN};
const timestamp=(value:string)=>{try{return Date.parse(timestampInput(value))}catch{return NaN}};
/** Derive only from the current draft. Values are never regulatory scores or live feeds. */
export function interactiveRecords(id:string,input:Record<string,Json>):RecordScene|null{
 const d=input as Record<string,any>;
 const row=(label:string,value:number,unit:string,detail:string,state:InteractiveRecord['state']='recorded',reference?:string):Omit<InteractiveRecord,'id'>=>({label,value:number(value),available:Number.isFinite(value),unit,detail,state:Number.isFinite(value)?state:'unknown',reference});
 const scene=(view:RecordView,title:string,axis:string,rows:Omit<InteractiveRecord,'id'>[]):RecordScene=>({view,title,axis,records:rows.map((r,i)=>({...r,id:`${view}-${i}`}))});
 switch(id){
 case 'himayah':return scene('clauses','Clause lens','Phrase occurrences',d.rules.map((r:any)=>{const count=r.phrase?d.text.toLowerCase().split(r.phrase.toLowerCase()).length-1:0;return row(r.label,count,'matches',r.phrase?`Screening phrase: “${r.phrase}”. ${r.required?'Marked required in your rule.':'Review flag in your rule.'}`:'No screening phrase supplied.',count?'recorded':'attention')}));
 case 'sahil':return scene('checkpoints','Service checkpoints','Documents listed',d.requirements.map((name:string)=>{const doc=d.documents.find((x:any)=>x.name===name);return row(name,doc?1:0,'listed',doc?`Expiry ${doc.expires}; reference date ${d.as_of}. Listing does not establish validity.`:'No matching document in this draft.',doc?'recorded':'attention',doc?.reference)}));
 case 'munagasah':return scene('coverage','Tender coverage','Capability matches',d.requirements.map((name:string)=>row(name,d.capabilities.includes(name)?1:0,'matched',`Tender deadline ${d.deadline}; reference date ${d.as_of}. Confirm against the buyer’s tender pack.`,d.capabilities.includes(name)?'recorded':'attention')));
 case 'tawteen':return scene('workforce','People behind the target','Active headcount',d.employees.map((e:any)=>row(e.id,e.active?1:0,'active',`${e.active?'Active':'Inactive'} employee; ${e.national?'reported national':'not reported national'}. Supplied target ${d.target_percent}%.`)));
 case 'adl':return scene('chronology','Evidence chronology','Sequence in the supplied file',[...d.events].sort((a:any,b:any)=>a.date.localeCompare(b.date)).map((e:any,i:number)=>row(e.description,i+1,'event',e.date,'recorded',e.reference)));
 case 'tawassul':return scene('account','Account fit canvas','Needs matched',d.products.map((p:any)=>{const tags=d.needs.filter((n:string)=>p.tags.includes(n));return row(p.name,tags.length,'needs',p.approved_fact,tags.length?'recorded':'attention',tags.join(', ')||'No matching need in supplied tags')}));
 case 'adab':{const hits=prohibitedTermHits(d.copy,d.prohibited_terms);return scene('editorial','Claim editing desk','Characters', [{...row('Original copy',characterCount(d.copy),'characters',d.copy+(hits.length?'\nFlagged terms: '+hits.join(', '):''),characterCount(d.copy)>d.max_characters||hits.length>0?'attention':'recorded')},...d.approved_claims.map((x:string,i:number)=>row(`Approved wording ${i+1}`,characterCount(x),'characters',x,characterCount(x)>d.max_characters?'attention':'recorded'))]);}
 case 'khidmah':{const elapsed=isCalendarDate(d.as_of)&&isCalendarDate(d.purchase_date)?(Date.parse(d.as_of)-Date.parse(d.purchase_date))/86400000:NaN;return scene('policy','Return policy gates','Supplied policy checks',[
 row('Amount',d.amount,'amount',`Supplied refund limit ${d.refund_limit}.`,d.amount<=d.refund_limit?'recorded':'attention'),
 row('Return window',elapsed,'elapsed days',`Purchase ${d.purchase_date}; reference ${d.as_of}; allowed window ${d.return_window_days} days.`,elapsed>=0&&elapsed<=d.return_window_days?'recorded':'attention'),
 row('Reason',d.eligible_reasons.includes(d.reason)?1:0,'eligible reason',d.reason,d.eligible_reasons.includes(d.reason)?'recorded':'attention')]);}
 case 'jomrok':return scene('manifest','Cargo manifest desk','Fields supplied',d.required_fields.map((k:string)=>row(k,String(d.shipment[k]??'').trim()?1:0,'present',String(d.shipment[k]??'')||'No value entered.',String(d.shipment[k]??'').trim()?'recorded':'attention')));
 case 'khibrat':return scene('competencies','Competency evidence map','References listed',d.criteria.map((c:string)=>{const evidence=d.evidence.filter((e:any)=>e.criterion===c);return row(c,evidence.length,'references','A reference is evidence to inspect, not an ability score.',evidence.length?'recorded':'unknown',evidence.map((e:any)=>e.reference).join(' · '))}));
 case 'majlis':return scene('onboarding','Onboarding commitments','Completion declarations',d.tasks.map((t:any)=>row(t.title,t.done?1:0,'complete',`Due ${t.due}; dependencies: ${t.depends_on.join(', ')||'none listed'}.`,t.done?'recorded':'attention',t.id)));
 case 'rafiq':return scene('day','Your time ribbon','Minutes in entered blocks',d.busy.map((x:any)=>row(x.title,duration(x.start,x.end),'minutes',`${x.start}–${x.end}; workday ${d.start}–${d.end}; buffer ${d.buffer_minutes} minutes.`)));
 case 'sawm':return scene('energy','Pace your commitments','Requested task duration',d.tasks.map((t:any)=>row(t.title,t.minutes,'minutes',`Requested duration within ${d.start}–${d.end}. This is a planning input, not a health or fasting assessment.`)));
 case 'mizan':{
  const ledger=ledgerPreview(d.transactions,d.budgets),categories=[...new Set([...Object.keys(d.budgets),...ledger.categories.map(x=>x.category)])];
  return scene('budget','Category balance','Unique recorded spending',categories.map(category=>{
   const reconciled=ledger.categories.find(x=>x.category===category),budget=Object.hasOwn(d.budgets,category)?d.budgets[category]:null,total=reconciled?Number(reconciled.spent):0;
   const state=budget===null?'unknown':reconciled?.remaining!==null&&reconciled?.remaining!==undefined&&Number(reconciled.remaining)<0?'attention':'recorded';
   return row(category,total,d.currency,`${budget===null?'No category budget supplied.':`Supplied budget ${budget} ${d.currency}.`} ${ledger.duplicates.length} duplicate IDs excluded.`,state);
  }));
 }
 case 'thawg':return scene('dining','A table for your group','Price per guest',d.restaurants.map((r:any)=>{const fit=r.price<=d.budget&&r.available_seats>=d.party_size&&d.required_tags.every((t:string)=>r.tags.includes(t));return row(r.name,r.price,'per guest',`${r.available_seats} recorded seats; ${r.tags.join(', ')}. Budget ${d.budget}; party ${d.party_size}. Confirm availability with the venue.`,fit?'recorded':'attention')}));
 case 'manzil':{return scene('receipts','Receipt tape','Unique receipt amounts',unique(d.transactions).map((t:any)=>row(t.id,t.amount,d.currency,`${t.category}; ${t.verified?'marked verified':'not verified'} by the entered record. Duplicate IDs excluded.`,t.verified?'recorded':'attention')))}
 case 'gurbah':return scene('dependencies','Relocation path','Open prerequisites',d.tasks.map((t:any)=>{const open=t.depends_on.filter((key:string)=>!d.tasks.some((x:any)=>x.id===key&&x.done));return row(t.title,open.length,'dependencies',`Due ${t.due}; ${t.done?'marked complete':'not complete'}.`,open.length?'attention':'recorded',open.join(', ')||'No open prerequisites in this draft')}));
 case 'amanah-eco':return scene('consumption','Consumption comparison','Usage per day',[
 row('Previous period',d.previous_days?d.previous_usage/d.previous_days:NaN,`${d.unit}/day`,`${d.previous_usage} ${d.unit} across ${d.previous_days} days.`,d.previous_days?'recorded':'unknown'),
 row('Current period',d.current_days?d.current_usage/d.current_days:NaN,`${d.unit}/day`,`${d.current_usage} ${d.unit} across ${d.current_days} days.`,d.current_days?'recorded':'unknown')]);
 case 'nafas':return scene('reflection','Make room for a pause','Preferred activities',d.preferred_activities.map((x:string)=>row(x,0,'',`Preferred activity from your ${d.days}-day plan starting ${d.start_date}. Choose a comfortable pace and stop whenever needed.`)));
 case 'tadweer':return scene('materials','Material destination map','Entered distance',d.routes.map((r:any)=>{const fit=r.accepted_materials.includes(d.material)&&(!d.hazardous||r.accepts_hazardous);return row(r.name,r.distance_km,'km',`Accepts ${r.accepted_materials.join(', ')}; ${r.accepts_hazardous?'accepts':'does not accept'} declared hazardous material. Confirm with the operator.`,fit?'recorded':'attention')}));
 case 'turath':return scene('chapters','Source reading trail','Excerpt length',d.sources.map((x:any)=>row(x.title,characterCount(x.excerpt),'characters',x.excerpt,'recorded',x.reference)));
 case 'himam':return scene('accessibility','Access along the route','Entered travel duration',d.routes.map((r:any)=>{const known=d.needs.length>0&&r.segments.length>0&&r.segments.every((x:any)=>d.needs.every((n:string)=>x.access[n]===true));const barrier=r.segments.some((x:any)=>d.needs.some((n:string)=>x.access[n]===false));return row(r.name,r.minutes,'minutes',r.segments.map((x:any)=>`${x.name}: ${d.needs.map((n:string)=>`${n} ${x.access[n]===true?'reported available':x.access[n]===false?'reported barrier':'unknown'}`).join(', ')}`).join(' · '),known?'recorded':barrier?'attention':'unknown')}));
 case 'hisad':{
  const current=timestamp(d.as_of),expires=timestamp(d.lot.expires),knownTime=Number.isFinite(current)&&Number.isFinite(expires);
  return scene('rescue','Recipient capacity board','Capacity in entered records',d.recipients.map((r:any)=>{
   const conflict=r.excluded_allergens.some((a:string)=>d.lot.allergens.includes(a)),late=knownTime&&current+r.travel_minutes*60000>=expires;
   const attention=conflict||r.capacity<d.lot.quantity||!d.lot.allergens_known||!d.lot.handling_verified||late;
   const timing=!knownTime?'Expiry timing unknown: enter valid timestamps with timezone.':expires<=current?'Expired at the entered reference time.':late?'Entered travel reaches expiry or later.':'Entered travel arrives before the recorded expiry.';
   return row(r.name,r.capacity,'units',`${r.travel_minutes} minutes entered travel; lot ${d.lot.quantity} units; ${conflict?'allergen conflict':'no conflict in entered allergen lists'}. ${timing} Handling and actual conditions still require confirmation.`,attention?'attention':knownTime?'recorded':'unknown');
  }));
 }
 default:return null;
 }
}
