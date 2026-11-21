import cached from './publicIntelligence.json';
import {briefs} from './briefs';
export interface PublicIntelligence {kind:'actual_model_analysis';generated_at:string;analysis:{outcome:'answered'|'inconclusive'|'needs_information';draft:{summary:string;claims:{text:string;basis:'evidence';citations:string[]}[];next_steps:string[]};questions:string[];limitations:string[]};source:{source_id:string;url:string;authority:string;fetched_at:string;raw_sha256:string;text_sha256:string;mode:string;scope:string};model_roles:Record<string,string>;factual_certification:false;run_url:string}
function record(value:unknown):Record<string,unknown>{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}}
export function publicIntelligence(value:unknown,app:keyof typeof briefs):PublicIntelligence|null {
 const v=record(value),source=record(v.source),analysis=record(v.analysis),draft=record(analysis.draft),models=record(v.model_roles),b=briefs[app];
 if(v.kind!=='actual_model_analysis'||v.factual_certification!==false||source.source_id!==b.source_id||source.url!==b.url||typeof v.generated_at!=='string'||!Number.isFinite(Date.parse(v.generated_at)))return null;
 if(typeof source.fetched_at!=='string'||!Number.isFinite(Date.parse(source.fetched_at))||!['raw_sha256','text_sha256'].every(k=>typeof source[k]==='string'&&/^[a-f\d]{64}$/.test(source[k] as string)))return null;
 const roleModels=['planner','specialist','critic'].map(role=>models[role]);
 if(models.critic!=='openai/gpt-oss-120b'||!roleModels.every(model=>typeof model==='string'&&model.trim().length>0)||new Set(roleModels).size!==3)return null;
 if(!['answered','inconclusive','needs_information'].includes(analysis.outcome as string)||typeof draft.summary!=='string'||!draft.summary.trim()||!Array.isArray(draft.claims)||!draft.claims.length)return null;
 if(!draft.claims.every(x=>{const c=record(x);return typeof c.text==='string'&&c.basis==='evidence'&&Array.isArray(c.citations)&&c.citations.length>0&&c.citations.every(id=>id===b.source_id+':public-0')}))return null;
 if(![draft.next_steps,analysis.questions,analysis.limitations].every(x=>Array.isArray(x)&&x.every(y=>typeof y==='string'&&y.trim().length>0)))return null;
 if(analysis.outcome==='needs_information'&&!(analysis.questions as unknown[]).length)return null;
 if(analysis.outcome==='inconclusive'&&!(analysis.limitations as unknown[]).length)return null;
 if(analysis.outcome==='answered'&&((analysis.questions as unknown[]).length||(analysis.limitations as unknown[]).length))return null;
 return v as unknown as PublicIntelligence;
}
export function savedIntelligence(app:keyof typeof briefs){return publicIntelligence((cached as Record<string,unknown>)[app],app)}
