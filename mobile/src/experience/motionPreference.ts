export interface MotionPreferenceSource {
 read:()=>Promise<boolean>;
 subscribe:(changed:(reduced:boolean)=>void)=>()=>void;
}
/** Preference events are newer than the asynchronous startup snapshot. */
export function observeMotionPreference(source:MotionPreferenceSource,update:(reduced:boolean)=>void){
 let live=true,changed=false;
 const unsubscribe=source.subscribe(value=>{if(live){changed=true;update(value)}});
 void source.read().then(value=>{if(live&&!changed)update(value)}).catch(()=>{});
 return ()=>{if(!live)return;live=false;unsubscribe()};
}
