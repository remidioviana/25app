import {isCalendarDate} from '../dossier';
export function makeRoutine(start:string,days:number,activities:string[]){
 if(!isCalendarDate(start)||!Number.isInteger(days)||days<1||days>14||!activities.length||activities.some(x=>!x.trim()))throw Error('Choose a valid start date, 1–14 days and at least one activity.');
 const date=new Date(start+'T12:00:00Z');return Array.from({length:days},(_,i)=>{const current=new Date(date);current.setUTCDate(date.getUTCDate()+i);const day=current.toISOString().slice(0,10);if(!isCalendarDate(day))throw Error('The routine extends beyond the supported calendar.');return {date:day,activities:[...activities]}});
}
export function localCalendarDate(date:Date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
