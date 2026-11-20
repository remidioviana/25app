import type {Schedule} from './types';
/** Describe persisted schedule settings without implying completed or authenticated work. */
export function schedulePresentation(schedule:Pick<Schedule,'enabled'|'mode'|'example'>){
 return {status:schedule.enabled?'Active':'Inactive',mode:schedule.mode==='local'?'Local tools':schedule.mode==='model'?'AI agent':schedule.mode==='team'?'AI team':'Mode not reported',provenance:schedule.example===true||schedule.example===1?'Demonstration inputs':schedule.example===false||schedule.example===0?'Supplied inputs':'Input provenance not reported'};
}
