import type {Json} from '../types';
import {designs} from './designs';
export function caseInputIssue(app:keyof typeof designs,input:Record<string,Json>):string|null {
 const list=(key:string)=>Array.isArray(input[key])&&(input[key] as Json[]).length>0;
 const text=(key:string)=>typeof input[key]==='string'&&(input[key] as string).trim().length>0;
 const number=(key:string)=>typeof input[key]==='number'&&Number.isFinite(input[key]);
 const object=(key:string)=>input[key]!==null&&typeof input[key]==='object'&&!Array.isArray(input[key])&&Object.keys(input[key] as object).length>0;
 const enough:Record<keyof typeof designs,boolean>={
 himayah:text('text'),iqamah:list('requirements'),istithmar:text('activity')&&list('options'),munagasah:list('requirements'),sahil:list('requirements'),tawteen:list('employees'),adl:list('events')||list('claims'),tawassul:text('account')&&list('needs')&&list('products'),adab:text('copy'),khidmah:text('reason')&&number('amount'),jomrok:object('shipment')&&list('required_fields'),khibrat:list('criteria'),majlis:list('tasks'),rafiq:list('tasks'),sawm:list('tasks'),mizan:text('currency')&&list('transactions'),thawg:list('restaurants'),manzil:text('currency')&&list('transactions'),gurbah:list('tasks'),'amanah-eco':number('previous_usage')&&number('current_usage')&&text('unit'),nafas:list('preferred_activities'),tadweer:text('material')&&list('routes'),turath:list('topics')&&list('sources'),himam:list('needs')&&list('routes'),hisad:object('lot')&&list('recipients')};
 return enough[app]?null:designs[app].case_intro;
}
