/** Validate the mobile schedule controls before sending an authenticated request. */
export function scheduleInput(first:string,interval:number,count:string){
 const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(first.trim());
 if(!match)throw new Error('Use an ISO date and time with timezone, such as 2026-12-01T09:00:00+04:00.');
 const [,year,month,day,hour,minute,second,,zone]=match;
 const y=Number(year),m=Number(month),d=Number(day),h=Number(hour),min=Number(minute),sec=Number(second??0);
 const calendar=new Date(0);calendar.setUTCFullYear(y,m-1,d);
 if(y<1||calendar.getUTCFullYear()!==y||calendar.getUTCMonth()!==m-1||calendar.getUTCDate()!==d||h>23||min>59||sec>59)throw new Error('Enter a valid calendar date and time.');
 if(zone!=='Z'&&(Number(zone.slice(1,3))>23||Number(zone.slice(4))>59))throw new Error('Enter a valid timezone offset.');
 const at=new Date(first.trim());if(!Number.isFinite(at.getTime()))throw new Error('Enter a valid calendar date and time.');
 if(![0,3600,86400].includes(interval))throw new Error('Choose Once, Hourly or 24 hours.');
 if(!/^\d+$/.test(count.trim())||Number(count)<1||Number(count)>100)throw new Error('Choose a whole number from 1 to 100 runs.');
 const runs=Number(count);
 if(interval===0&&runs!==1)throw new Error('A one-time schedule must have exactly one run.');
 return {first_at:at.toISOString(),every_seconds:interval,max_runs:runs};
}
