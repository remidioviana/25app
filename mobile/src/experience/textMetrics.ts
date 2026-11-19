/** Match Python len(str) and schema validation: Unicode code points, not UTF-16 units or grapheme clusters. */
export function characterCount(text:string):number{return Array.from(text).length}
