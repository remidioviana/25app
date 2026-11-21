import table from './casefold.json';
const folds:Record<string,string>=table.mappings;
/** Match Python len(str) and schema validation: Unicode code points, not UTF-16 units or grapheme clusters. */
export function characterCount(text:string):number{return Array.from(text).length}
/** Limit controlled text fields without splitting a supplementary Unicode character. */
export function limitCharacters(text:string,maximum:number):string{return Array.from(text).slice(0,maximum).join('')}

/** Full, locale-independent Python casefold. Do not normalize or remove diacritics. */
export function casefold(text:string):string{
 return Array.from(text,character=>folds[String(character.codePointAt(0))]??character).join('');
}
export function prohibitedTermHits(copy:string,terms:string[]):string[]{
 const folded=casefold(copy);return terms.filter(term=>folded.includes(casefold(term)));
}
