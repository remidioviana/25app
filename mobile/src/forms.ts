import type {Json,Schema} from './types';
export function blank(schema:Schema):Json {
 if(schema.type==='object')return Object.fromEntries(Object.entries(schema.properties||{}).map(([key,value])=>[key,blank(value)]));
 if(schema.type==='array')return [];
 if(schema.type==='boolean')return false;
 if(schema.type==='number'||schema.type==='integer')return 0;
 if(Array.isArray(schema.type))return null;
 return '';
}
export function replaceAt(root:Json,path:(string|number)[],value:Json):Json {
 if(!path.length)return value;
 const [head,...tail]=path;
 if(Array.isArray(root)){const next=[...root];next[Number(head)]=replaceAt(next[Number(head)],tail,value);return next}
 if(root!==null&&typeof root==='object')return {...root,[head]:replaceAt(root[String(head)],tail,value)};
 throw new Error('Invalid form path');
}
export function validateGoal(goal:string){if(!goal.trim()||goal.length>2000)throw new Error('Describe the goal in up to 2,000 characters.');return goal.trim()}
export function inputLabel(key:string){return ({as_of:'Reference date',currency:'Currency',amount:'Amount',transactions:'Transactions',budgets:'Budgets',category:'Category',verified:'Verified',title:'Title',name:'Name',start:'Start',end:'End',goal:'Goal',text:'Text',requirements:'Requirements',documents:'Documents',reference:'Reference',expires:'Expiry',days:'Days',date:'Date',description:'Description',tasks:'Tasks',rules:'Rules',quantity:'Quantity',allergens:'Allergens',recipients:'Recipients'} as Record<string,string>)[key]||key.replaceAll('_',' ')}
