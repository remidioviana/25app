import {characterCount} from './experience/textMetrics';
import type {Json,Schema,WorkspaceDraft} from './types';
export function blank(schema:Schema):Json {
 if(schema.type==='object')return Object.fromEntries(Object.entries(schema.properties||{}).map(([key,value])=>[key,blank(value)]));
 if(schema.type==='array')return [];
 // Unknown numeric/boolean inputs are not assertions of real zero/false values.
 if(schema.type==='boolean'||schema.type==='number'||schema.type==='integer')return null;
 if(Array.isArray(schema.type))return null;
 return '';
}
export function emptyWorkspace(schema:Schema):{draft:Record<string,Json>;example:false;hasInputs:false} {
 const value=blank(schema);
 if(value===null||typeof value!=='object'||Array.isArray(value))throw new Error('An application workspace requires an object schema.');
 return {draft:value,example:false,hasInputs:false};
}
/** Copy draft values and their supplied/example flags as one restoration snapshot. */
export function copyWorkspaceDraft(workspace:WorkspaceDraft):WorkspaceDraft {
 const copy=(value:Json):Json=>Array.isArray(value)?value.map(copy):value!==null&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)])):value;
 return {draft:copy(workspace.draft) as Record<string,Json>,example:workspace.example,hasInputs:workspace.hasInputs};
}
export function replaceAt(root:Json,path:(string|number)[],value:Json):Json {
 if(!path.length)return value;
 const [head,...tail]=path;
 if(Array.isArray(root)){const next=[...root];next[Number(head)]=replaceAt(next[Number(head)],tail,value);return next}
 if(root!==null&&typeof root==='object')return {...root,[head]:replaceAt(root[String(head)],tail,value)};
 throw new Error('Invalid form path');
}
export function validateGoal(goal:string){if(!goal.trim()||characterCount(goal)>2000)throw new Error('Describe the goal in up to 2,000 characters.');return goal.trim()}
export function inputLabel(key:string){return ({label:'Rule label',phrase:'Screening phrase',required:'Phrase required',as_of:'Reference date',currency:'Currency',amount:'Amount',transactions:'Transactions',budgets:'Budgets',category:'Category',verified:'Verified',title:'Title',name:'Name',start:'Start',end:'End',goal:'Goal',text:'Text',requirements:'Requirements',documents:'Documents',reference:'Reference',expires:'Expiry',days:'Days',date:'Date',description:'Description',tasks:'Tasks',rules:'Rules',quantity:'Quantity',allergens:'Allergens',recipients:'Recipients'} as Record<string,string>)[key]||key.replaceAll('_',' ')}
export function addMapEntry(value:Record<string,Json>,rawKey:string,schema:Schema):Record<string,Json> {
 const key=rawKey.trim();
 if(!key||characterCount(key)>80||['__proto__','constructor','prototype'].includes(key))throw new Error('Use a category name of 1–80 characters.');
 if(Object.prototype.hasOwnProperty.call(value,key))throw new Error('That category already exists.');
 return {...value,[key]:blank(schema)};
}
export function removeMapEntry(value:Record<string,Json>,key:string):Record<string,Json>{return Object.fromEntries(Object.entries(value).filter(([name])=>name!==key))}
