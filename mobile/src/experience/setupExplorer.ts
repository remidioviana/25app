import {compareSetup,setupIssue,taxScenario,type SetupInput} from '../setupComparison';
import {numericInput} from './numericInput';
export function setupPreview(input:unknown,years:string,visas:string){
 const issue=setupIssue(input);if(issue)throw Error(issue);
 const horizon=numericInput(years),count=numericInput(visas);
 if(horizon===null||!Number.isFinite(horizon)||horizon<0)throw Error('Enter a non-negative comparison horizon.');
 if(count===null||!Number.isSafeInteger(count)||count<0)throw Error('Enter a non-negative whole number of visas.');
 const next={...(input as SetupInput),years:horizon,visas:count};
 return {input:next,result:compareSetup(next)};
}
/** Scale exact minor-unit strings without overflowing IEEE numbers. */
export function costFraction(minor:string,maximum:string):number{
 if(!/^\d+$/.test(minor)||!/^\d+$/.test(maximum))throw Error('Use non-negative integer cost units.');
 const value=BigInt(minor),max=BigInt(maximum);if(value>max)throw Error('The chart scale is below its cost.');
 return max===0n?0:Number(value*1000000n/max)/1000000;
}
export function setupHorizon(input:SetupInput,name:string){
 const issue=setupIssue(input);if(issue)throw Error(issue);
 const option=input.options.find(x=>x.name===name);if(!option)throw Error('Select an option in this comparison.');
 const years=[...new Set([0,input.years*.25,input.years*.5,input.years*.75,input.years])];
 return years.map(year=>({years:year,...compareSetup({...input,years:year,options:[option]}).comparison[0]}));
}
export function setupTax(income:string,threshold:string,rate:string){
 if([income,threshold,rate].every(x=>!x.trim()))return null;
 const fields=[income,threshold,rate].map(numericInput);
 if(fields.some(x=>x===null||!Number.isFinite(x)||(x!==null&&x<0)))throw Error('Complete all three non-negative tax inputs.');
 return {income:fields[0]!,threshold:fields[1]!,rate_percent:fields[2]!,...taxScenario(fields[0]!,fields[1]!,fields[2]!)};
}
export function setupReport(input:SetupInput,tax:ReturnType<typeof setupTax>){
 // Recompute, never trust a caller's cached ranking or tax result.
 const result=compareSetup(input);
 const size=input.activity.length+input.options.reduce((n,o)=>n+o.name.length+o.activities.reduce((a,b)=>a+b.length,0),0);
 if(size>500000)throw Error('Keep comparison reports within 500,000 text characters.');
 return JSON.stringify({format:'istithmar.comparison.v1',input,result,tax:tax?{...tax,...taxScenario(tax.income,tax.threshold,tax.rate_percent)}:null,source:'supplied_costs_and_activity_lists',official_fees_verified:false,license_eligibility_verified:false,tax_law_verified:false,external_action_performed:false},null,2)+'\n';
}
