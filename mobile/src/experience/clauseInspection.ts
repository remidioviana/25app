export interface ScreeningRule {label:string;phrase:string;required:boolean}
export interface ClauseHit {id:string;ruleIndex:number;rule:string;start:number;end:number;utf16Start:number;utf16End:number;quoteStart:number;quoteEnd:number;quote:string;entireMatchInQuote:boolean}
export interface ClauseFinding {ruleIndex:number;label:string;required:boolean;found:boolean;flagged:boolean;truncated:boolean;hits:ClauseHit[]}
export interface ClauseInspection {findings:ClauseFinding[];hits:ClauseHit[];characters:number;offsetUnit:'unicode_code_points';method:string}
const literal=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function inspectClauses(text:string,rules:ScreeningRule[]):ClauseInspection{
 if(text.length>100000||rules.length>500)throw Error('The inspector supports up to 100,000 text units and 500 rules.');
 if(rules.some(r=>typeof r.label!=='string'||typeof r.phrase!=='string'||!r.phrase.trim()||typeof r.required!=='boolean'))throw Error('Each screening rule needs a label, a non-blank phrase and an explicit required flag.');
 if(rules.reduce((n,r)=>n+r.phrase.length+r.label.length,0)>200000)throw Error('Screening rules exceed the local inspection limit.');
 const chars=Array.from(text),offsets=new Uint32Array(text.length+1);let index=0;
 chars.forEach((char,cp)=>{const code=char.codePointAt(0)!;if(code>=0xd800&&code<=0xdfff)throw Error('The document contains an invalid Unicode surrogate.');for(let j=0;j<char.length;j++)offsets[index+j]=cp;index+=char.length;offsets[index]=cp+1});
 let remaining=1000;const hits:ClauseHit[]=[];
 const findings=rules.map((rule,ruleIndex)=>{
  const regex=new RegExp(literal(rule.phrase),'giu'),row:ClauseHit[]=[];let found=false,truncated=false;const limit=Math.min(100,remaining);let match:RegExpExecArray|null;
  while((match=regex.exec(text))){found=true;if(row.length>=limit){truncated=true;break}const utf16Start=match.index,utf16End=utf16Start+match[0].length,start=offsets[utf16Start],end=offsets[utf16End],quoteStart=Math.max(0,start-60),quoteEnd=Math.min(chars.length,end+100,quoteStart+600);const hit={id:ruleIndex+':'+start+':'+end,ruleIndex,rule:rule.label,start,end,utf16Start,utf16End,quoteStart,quoteEnd,quote:chars.slice(quoteStart,quoteEnd).join(''),entireMatchInQuote:end<=quoteEnd};row.push(hit);hits.push(hit)}
  remaining-=row.length;return {ruleIndex,label:rule.label,required:rule.required,found,flagged:rule.required?!found:found,truncated,hits:row};
 });
 return {findings,hits:hits.sort((a,b)=>a.start-b.start||a.ruleIndex-b.ruleIndex),characters:chars.length,offsetUnit:'unicode_code_points',method:'ECMAScript Unicode case-insensitive literal screening; not semantic legal analysis'};
}
export function documentBlocks(text:string,size=1800){
 const chars=Array.from(text);if(!Number.isInteger(size)||size<100)throw Error('Choose a block size of at least 100 characters.');const blocks=[];
 for(let start=0;start<chars.length;start+=size)blocks.push({index:blocks.length,start,end:Math.min(chars.length,start+size),text:chars.slice(start,start+size).join('')});return blocks;
}
export function inspectionMarkdown(text:string,sha256:string,result:ClauseInspection,notes:Record<string,string>,provenance:{filename?:string;rawSha256?:string;extractedSha256?:string;documentId?:string}={}){
 if(!/^[a-f0-9]{64}$/.test(sha256))throw Error('Wait for the current document fingerprint before exporting.');
 const sourceCharacters=Array.from(text);if(result.characters!==sourceCharacters.length||result.hits.some(h=>h.start<0||h.end>sourceCharacters.length||h.start>=h.end||h.quote!==sourceCharacters.slice(h.quoteStart,h.quoteEnd).join('')))throw Error('The screening result does not match the current document.');
 const fence='~'.repeat(Math.max(3,...Array.from(text.matchAll(/~+/g),m=>m[0].length+1)));
 const chunks=['# Himayah — document screening and annotations','Current text SHA-256: '+sha256,'Offset unit: unicode_code_points','Method: '+result.method,'Scope: supplied literal rules and user-entered annotations; not a legal decision or verified regulatory applicability.'];
 if(provenance.filename)chunks.push('Imported filename: '+provenance.filename,'Original bytes SHA-256: '+(provenance.rawSha256||'not available'),'Extracted text SHA-256: '+(provenance.extractedSha256||'not available'),'Saved document ID: '+(provenance.documentId||'not saved'),'Authenticity: not verified','Current text differs from extracted text: '+(provenance.extractedSha256?String(provenance.extractedSha256!==sha256):'unknown'));
 for(const f of result.findings){chunks.push('\n## '+f.label,'Phrase state: '+(f.found?'match found':'no literal match'),'Required flag: '+f.required,'Matches truncated: '+f.truncated);for(const hit of f.hits){chunks.push('Range: ['+hit.start+', '+hit.end+')','Quote range: ['+hit.quoteStart+', '+hit.quoteEnd+')','> '+hit.quote.replaceAll('\n','\n> '),'Entire match in quote: '+hit.entireMatchInQuote);if(notes[hit.id])chunks.push('User annotation: '+notes[hit.id])}}
 chunks.push('\n## Reviewed text (untrusted document content)',fence+'text\n'+text+'\n'+fence);return chunks.join('\n\n')+'\n';
}
