export interface LedgerEntry {id:string;category:string;amount:number;verified:boolean}
/** Exact decimal sums over JS number representations, rounded half up at the end. */
export function moneySum(values:number[]):string{
 const parts=values.map(value=>{if(!Number.isFinite(value))throw Error('Amounts must be finite.');const [mantissa,exponent='0']=String(value).toLowerCase().split('e'),[whole,fraction='']=mantissa.split('.');let units=BigInt(whole+fraction),scale=fraction.length-Number(exponent);if(scale<0){units*=10n**BigInt(-scale);scale=0}return {units,scale}});
 const scale=Math.max(0,...parts.map(x=>x.scale));const total=parts.reduce((n,p)=>n+p.units*10n**BigInt(scale-p.scale),0n),negative=total<0n,absolute=negative?-total:total;
 const divisor=10n**BigInt(Math.max(0,scale-2));const cents=scale<=2?absolute*10n**BigInt(2-scale):(absolute+divisor/2n)/divisor;const digits=String(cents).padStart(3,'0');return(negative&&cents!==0n?'-':'')+digits.slice(0,-2)+'.'+digits.slice(-2);
}
export function ledgerPreview(entries:LedgerEntry[],budgets:Record<string,number>){
 const seen=new Set<string>(),duplicates:string[]=[],unverified:string[]=[],rows:LedgerEntry[]=[];
 for(const entry of entries){if(seen.has(entry.id)){duplicates.push(entry.id);continue}seen.add(entry.id);rows.push(entry);if(!entry.verified)unverified.push(entry.id)}
 const categories=[...new Set(rows.map(x=>x.category))].sort();
 return {total:moneySum(rows.map(x=>x.amount)),duplicates,unverified,categories:categories.map(category=>{const amounts=rows.filter(x=>x.category===category).map(x=>x.amount),budget=Object.hasOwn(budgets,category)?budgets[category]:null;return {category,spent:moneySum(amounts),budget,remaining:budget===null?null:moneySum([budget,...amounts.map(n=>-n)])}})};
}
