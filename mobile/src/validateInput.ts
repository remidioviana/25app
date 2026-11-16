import type {Schema} from './types';
/** Validate edited data before rendering domain calculations or submitting a mission.
 * Mirrors the schema subset accepted by the Python server; server validation remains authoritative.
 */
export function inputIssue(value:unknown,schema:Schema,path='Inputs'):string|null {
 const types=Array.isArray(schema.type)?schema.type:[schema.type];
 const matches=(type:string)=>type==='null'?value===null:type==='array'?Array.isArray(value):type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):type==='integer'?typeof value==='number'&&Number.isInteger(value):type==='number'?typeof value==='number'&&Number.isFinite(value):typeof value===type;
 if(!types.some(matches))return `${path}: expected ${types.join(' or ')}.`;
 if(typeof value==='number'){
  if(!Number.isFinite(value))return `${path}: enter a finite number.`;
  if(schema.minimum!==undefined&&value<schema.minimum)return `${path}: minimum is ${schema.minimum}.`;
  if(schema.maximum!==undefined&&value>schema.maximum)return `${path}: maximum is ${schema.maximum}.`;
 }
 if(typeof value==='string'&&[...value].length>(schema.maxLength??100000))return `${path}: text is too long.`;
 if(Array.isArray(value)){
  if(value.length>(schema.maxItems??500))return `${path}: too many items.`;
  if(schema.items)for(let i=0;i<value.length;i++){const issue=inputIssue(value[i],schema.items,`${path}[${i+1}]`);if(issue)return issue}
 }else if(value!==null&&typeof value==='object'){
  const record=value as Record<string,unknown>;
  for(const key of schema.required??[])if(!Object.hasOwn(record,key))return `${path}.${key}: required.`;
  for(const [key,item] of Object.entries(record)){
   const child=schema.properties?.[key]??(typeof schema.additionalProperties==='object'?schema.additionalProperties:undefined);
   if(child){const issue=inputIssue(item,child,`${path}.${key}`);if(issue)return issue}
   else if(schema.additionalProperties===false)return `${path}.${key}: field not allowed.`;
  }
 }
 return null;
}
