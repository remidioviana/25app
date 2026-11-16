import type {Json,RunResult} from './types';
const record=(v:Json|undefined):Record<string,Json>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v:{};
const strings=(v:Json|undefined)=>Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];
export function reviewSummary(result:RunResult){
 const plan=record(result.plan),audit=record(result.critique),draft=record(result.draft);
 return {objective:typeof plan.objective==='string'?plan.objective:'',steps:strings(plan.steps),missing:strings(plan.missing_information),issues:strings(audit.issues),nextSteps:strings(draft.next_steps),warnings:strings(result.retrieval_warnings),
 verdict:result.decision==='requires_human_review'?'Human review required':audit.verdict==='accept'?'Model reviewer accepted':audit.verdict==='revise'?'Revision requested':audit.verdict==='needs_evidence'?'More evidence requested':'No model verdict recorded',
 roles:(Array.isArray(result.usage)?result.usage:[]).flatMap(item=>{const row=record(item),usage=record(row.usage);if(typeof row.role!=='string')return [];return [{role:row.role==='critic'?'Auditor':row.role==='planner'?'Planner':row.role==='specialist'?'Specialist':row.role,model:typeof usage.model==='string'?usage.model:'Not recorded',fallback:usage.fallback===true,reason:typeof usage.fallback_reason==='string'?usage.fallback_reason:''}]})};
}
