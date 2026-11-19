import table from './casefold.json';
const folds:Record<string,string>=table.mappings;
/** Match Python len(str) and schema validation: Unicode code points, not UTF-16 units or grapheme clusters. */
export function characterCount(text:string):number{return Array.from(text).length}

/** Full, locale-independent Python casefold. Do not normalize or remove diacritics. */
export function casefold(text:string):string{
 return Array.from(text,character=>folds[String(character.codePointAt(0))]??character).join('');
}
export function prohibitedTermHits(copy:string,terms:string[]):string[]{
 const folded=casefold(copy);return terms.filter(term=>folded.includes(casefold(term)));
}
