/** Global display positions stay tied to the filtered list, not to a page-local index. */
export function recordPage<T>(records:readonly T[],requestedPage:number){
 const size=24,pageCount=Math.max(1,Math.ceil(records.length/size));
 const page=Math.min(Math.max(0,Number.isFinite(requestedPage)?Math.floor(requestedPage):0),pageCount-1);
 return {page,pageCount,items:records.slice(page*size,(page+1)*size).map((record,index)=>({record,ordinal:page*size+index+1}))};
}
