import React,{useEffect,useMemo,useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import {agendaRequests} from '../src/agendaRequests';
import {scheduleInput} from '../src/scheduleInput';
import {schedulePresentation} from '../src/schedulePresentation';
import {AgentAPI} from '../src/api';
import type {Json,Mode,Schedule} from '../src/types';
import {styles as s,colors} from '../src/theme';
import {Button,Notice} from './Controls';
export function Agenda({api,agent,goal,input,mode,example,onError}:{api:AgentAPI;agent:string;goal:string;input:Record<string,Json>;mode:Mode;example:boolean;onError:(v:string)=>void}){
 const [items,setItems]=useState<Schedule[]>([]),[first,setFirst]=useState(()=>new Date(Date.now()+3600000).toISOString()),[interval,setInterval]=useState(0),[count,setCount]=useState('1'),[busy,setBusy]=useState(false);
 const requests=useMemo(()=>agendaRequests(api,agent,{items:setItems,busy:setBusy,error:onError}),[api,agent,onError]);
 useEffect(()=>{void requests.start();return requests.dispose},[requests]);
 async function create(){try{const timing=scheduleInput(first,interval,count);await requests.create({goal,input,mode,example,...timing})}catch(e){onError(e instanceof Error?e.message:'Scheduling failed.')}}
 async function disable(id:string){await requests.disable(id)}
 return <View style={{gap:12}}><Text style={s.h2}>Schedule</Text><Notice><Text style={s.text}>Saves the current goal and data. The server must remain running. Inputs are not automatically refreshed.</Text></Notice><Text style={s.muted}>Mode: {mode}. AI may incur costs on each run.</Text><Text style={s.muted}>Inputs: {example?'Demonstration inputs':'Supplied inputs'}</Text><Text style={s.label}>First run, ISO timestamp with timezone</Text><TextInput editable={!busy} accessibilityLabel="First run" value={first} onChangeText={setFirst} style={s.input} autoCapitalize="none" placeholderTextColor={colors.muted}/><View style={s.row}>{[[0,'Once'],[3600,'Hourly'],[86400,'24 hours']] .map(([v,label])=><Button key={v} disabled={busy} secondary={interval!==v} title={String(label)} onPress={()=>{setInterval(Number(v));if(!v)setCount('1')}}/>)}</View><Text style={s.label}>Total runs (up to 100)</Text><TextInput editable={!busy&&interval!==0} accessibilityLabel="Total runs" style={s.input} keyboardType="number-pad" value={count} onChangeText={setCount}/><Button busy={busy} title="Schedule with these inputs" onPress={create}/>{items.map(x=>{const summary=schedulePresentation(x);return <View key={x.id} style={s.card}><Text style={s.h3}>{x.goal}</Text><Text style={s.muted}>{summary.status} · {x.remaining} remaining</Text><Text style={s.muted}>{summary.mode} · {summary.provenance}</Text><Text style={s.muted}>{new Date(x.next_at_iso).toLocaleString('en-US')}</Text>{!!x.enabled&&<Button secondary disabled={busy} title="Disable" onPress={()=>disable(x.id)}/>}</View>})}</View>;
}
