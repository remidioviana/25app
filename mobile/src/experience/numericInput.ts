/** Accept explicit Arabic/Persian digits without turning blank or malformed grouping into money. */
export function numericInput(text:string):number|null{
 let normalized=text.trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0));
 if(!normalized)return null;
 if(normalized.includes('٬')){
  if(!/^[+-]?\d{1,3}(?:٬\d{3})+(?:[.٫]\d+)?$/.test(normalized))return NaN;
  normalized=normalized.replaceAll('٬','');
 }
 normalized=normalized.replace('٫','.').replace(',','.');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized))return NaN;
 const value=Number(normalized);return Number.isFinite(value)?value:NaN;
}
