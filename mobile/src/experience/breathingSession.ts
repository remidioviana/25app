/** A pacing clock, not a breathing sensor or a clinical protocol. */
export interface BreathConfig {inhaleSeconds:number;exhaleSeconds:number;durationSeconds:number}
export interface BreathSession {id:string;config:BreathConfig;status:'running'|'paused'|'completed'|'stopped';elapsedMs:number;anchorMs:number|null}
export function validateBreathConfig(c:BreathConfig){if(![c.inhaleSeconds,c.exhaleSeconds,c.durationSeconds].every(Number.isFinite)||c.inhaleSeconds<2||c.inhaleSeconds>8||c.exhaleSeconds<2||c.exhaleSeconds>10||c.durationSeconds<10||c.durationSeconds>600)throw Error('Choose a 10–600 second pause with comfortable 2–8 second inhales and 2–10 second exhales.');}
export function startBreath(id:string,config:BreathConfig,now:number):BreathSession{validateBreathConfig(config);if(!Number.isFinite(now))throw Error('A finite monotonic clock value is required.');return {id,config:{...config},status:'running',elapsedMs:0,anchorMs:now}}
export function advanceBreath(s:BreathSession,now:number):BreathSession{
 if(s.status!=='running'||s.anchorMs===null||!Number.isFinite(now)||now<s.anchorMs)return s;
 const elapsedMs=Math.min(s.config.durationSeconds*1000,s.elapsedMs+now-s.anchorMs),completed=elapsedMs>=s.config.durationSeconds*1000;
 return {...s,elapsedMs,status:completed?'completed':'running',anchorMs:completed?null:now};
}
export function pauseBreath(s:BreathSession,now:number):BreathSession{const next=advanceBreath(s,now);return next.status==='running'?{...next,status:'paused',anchorMs:null}:next}
export function resumeBreath(s:BreathSession,now:number):BreathSession{return s.status==='paused'&&Number.isFinite(now)?{...s,status:'running',anchorMs:now}:s}
export function stopBreath(s:BreathSession,now:number):BreathSession{const next=advanceBreath(s,now);return next.status==='completed'?next:{...next,status:'stopped',anchorMs:null}}
export function breathPhase(s:BreathSession){const cycle=(s.config.inhaleSeconds+s.config.exhaleSeconds)*1000,within=s.elapsedMs%cycle,inhale=within<s.config.inhaleSeconds*1000;return {name:inhale?'Inhale':'Exhale',remainingMs:inhale?s.config.inhaleSeconds*1000-within:cycle-within}}
