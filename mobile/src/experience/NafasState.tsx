import React,{createContext,useContext,useState} from 'react';
import type {BreathConfig,BreathSession} from './breathingSession';
export interface PauseRecord {id:string;status:'completed'|'stopped';activeSeconds:number;at:string}
export interface Reflection {id:string;text:string;at:string}
export interface RoutineDay {date:string;activities:string[]}
interface State {config:BreathConfig;setConfig:(v:BreathConfig)=>void;haptics:boolean;setHaptics:(v:boolean)=>void;records:PauseRecord[];record:(v:BreathSession)=>void;reflections:Reflection[];addReflection:(text:string)=>void;removeReflection:(id:string)=>void;selected:string[];setSelected:(v:string[])=>void;plan:RoutineDay[];setPlan:(v:RoutineDay[])=>void;clear:()=>void}
const Context=createContext<State|null>(null);let sequence=0;
const defaults={inhaleSeconds:4,exhaleSeconds:6,durationSeconds:30};
export function NafasProvider({children}:{children:React.ReactNode}){
 const [config,setConfig]=useState(defaults),[haptics,setHaptics]=useState(false),[records,setRecords]=useState<PauseRecord[]>([]),[reflections,setReflections]=useState<Reflection[]>([]),[selected,setSelected]=useState<string[]>([]),[plan,setPlan]=useState<RoutineDay[]>([]);
 const record=(v:BreathSession)=>{if(v.status!=='completed'&&v.status!=='stopped')return;const row:PauseRecord={id:v.id,status:v.status,activeSeconds:v.elapsedMs/1000,at:new Date().toISOString()};setRecords(old=>old.some(x=>x.id===v.id)?old:[row,...old].slice(0,30))};
 const addReflection=(text:string)=>{if(!text.trim()||text.length>10000)return;setReflections(old=>[{id:'reflection-'+(++sequence),text:text.trim(),at:new Date().toISOString()},...old].slice(0,30))};
 return <Context.Provider value={{config,setConfig,haptics,setHaptics,records,record,reflections,addReflection,removeReflection:id=>setReflections(old=>old.filter(x=>x.id!==id)),selected,setSelected,plan,setPlan,clear:()=>{setRecords([]);setReflections([]);setSelected([]);setPlan([])}}}>{children}</Context.Provider>;
}
export function useNafas(){const value=useContext(Context);if(!value)throw Error('Nafas local state is unavailable.');return value}
