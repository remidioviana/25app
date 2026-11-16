export type Json = null | boolean | number | string | Json[] | {[key:string]:Json};
export type Mode = 'local'|'model'|'team';
export interface Schema {type:string|string[];properties?:Record<string,Schema>;items?:Schema;additionalProperties?:boolean|Schema;required?:string[];minimum?:number;maximum?:number;maxItems?:number;maxLength?:number}
export interface Agent {id:string;name:string;title:string;category:string;icon:string;accent:string;goal:string;schema:Schema;example:Record<string,Json>}
export interface Config {requires_token:boolean;model_configured:boolean;langgraph_available:boolean;embedding_configured:boolean;version:string;multiuser?:boolean}
export interface RunResult {analysis:Record<string,Json>;narrative?:string|null;evidence:{citation:string;title:string;text:string;source:string;as_of:string}[];decision?:string;plan?:Json;critique?:Json;draft?:Json;usage?:Json;retrieval_warnings?:Json;external_actions_performed:boolean}
export interface Run {id:string;agent:string;goal:string;input:Record<string,Json>;status:'queued'|'running'|'completed'|'failed'|'cancelled';mode:Mode;example:boolean;review:string;created:string;artifact_hash?:string;result:RunResult|null;error:string|null;events:{id:number;at:string;phase:string;detail:Json}[]}
export interface RunSummary {id:string;goal:string;status:Run['status'];created:string;mode:Mode;example:boolean;review:string}
export interface Document {id:string;title:string;source:string;as_of:string;created:string}
export interface Schedule {id:string;goal:string;enabled:number;remaining:number;next_at_iso:string;mode:Mode}
export interface Intake {status:'needs_information'|'ready_for_review';questions?:string[];input?:Record<string,Json>;uncertainties?:string[];warning?:string}

export interface EvidenceMatch {citation:string;title:string;text:string;source:string;as_of:string;doc:string;chunk:number}
export interface EvidenceSearchResult {matches:EvidenceMatch[];method:string;warnings:string[]}
