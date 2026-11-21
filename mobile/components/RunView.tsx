import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AppState,View,Text,Pressable,Share,Platform} from 'react-native';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
import {useFocusEffect} from 'expo-router';
import {runOperations,shareRunReport} from '../src/runOperations';
import {AgentAPI} from '../src/api';
import type {Run,Json} from '../src/types';
import {styles as s,colors} from '../src/theme';
import {pollRunStatus} from '../src/runPolling';
import {inputLabel} from '../src/forms';
import {ClaimEvidence} from './ClaimEvidence';
import {AgentReview} from './AgentReview';
import {ExecutionMap} from './ExecutionMap';
import {Button,Notice} from './Controls';
const status:Record<Run['status'],string>={queued:'Queued',running:'Running',completed:'Completed',failed:'Failed',cancelled:'Cancelled'};
function Values({value}:{value:Json}){
 if(Array.isArray(value))return <View>{value.slice(0,50).map((v,i)=><View key={i} style={s.group}><Values value={v}/></View>)}{value.length>50&&<Text style={s.muted}>Showing 50 of {value.length} items. Export the complete report.</Text>}</View>;
 if(value!==null&&typeof value==='object')return <View>{Object.entries(value).map(([k,v])=><View key={k} style={{marginVertical:5}}><Text style={s.label}>{inputLabel(k)}</Text><Values value={v}/></View>)}</View>;
 return <Text selectable style={s.text}>{value===null?'Not provided':typeof value==='boolean'?(value?'Yes':'No'):String(value)}</Text>;
}
export function RunView({api,initial,onError,onUpdate}:{api:AgentAPI;initial:Run;onError:(s:string)=>void;onUpdate?:(r:Run)=>void}){
 const [run,setRun]=useState(initial),[busy,setBusy]=useState(false),[details,setDetails]=useState(false),[pollingError,setPollingError]=useState(''),[pollVersion,setPollVersion]=useState(0),[foreground,setForeground]=useState(AppState.currentState==='active');
 const session=useMemo(()=>({api,id:run.id,operations:runOperations()}),[api,run.id]);
 const operations=session.operations;
 const stopPolling=useRef<(()=>void)|null>(null);
 useFocusEffect(useCallback(()=>{operations.start(setBusy);return operations.dispose},[operations,setBusy]));
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>setForeground(state==='active'));return ()=>sub.remove()},[]);
 useEffect(()=>{
  if(!foreground||busy||!['queued','running'].includes(run.status))return;
  const stop=pollRunStatus(api,run.id,{run:next=>{setRun(next);onUpdate?.(next)},error:setPollingError});stopPolling.current=stop;return()=>{stop();if(stopPolling.current===stop)stopPolling.current=null};
 },[api,run.id,run.status,foreground,onUpdate,pollVersion,busy]);
 async function action(name:'cancel'|'retry'|'accepted'|'rejected'){
  await operations.execute(async()=>{stopPolling.current?.();return name==='cancel'||name==='retry'?session.api.action(session.id,name):session.api.review(run,name)},next=>{setRun(next);onUpdate?.(next)},onError,setBusy,'Action failed');
 }
 async function share(){
  await operations.execute(async current=>{stopPolling.current?.();await shareRunReport(()=>session.api.exportMarkdown(session.id),current,{
   web:Platform.OS==='web',shareText:text=>Share.share({message:text}),file:()=>new File(Paths.cache,`agent-${session.id}.md`),available:()=>Sharing.isAvailableAsync(),shareFile:uri=>Sharing.shareAsync(uri,{mimeType:'text/markdown',dialogTitle:'Share report'}),
  })},()=>{},onError,setBusy,'Export failed');
 }
 return <View style={s.card}><View style={[s.row,{justifyContent:'space-between'}]}><Text style={s.h2}>Run</Text><Text style={s.tag}>{status[run.status]}</Text></View><Text style={s.muted}>{run.goal}</Text>{!!run.example&&<Notice><Text style={s.text}>Demo data</Text></Notice>}{run.error&&<Text style={s.error}>{run.error}</Text>}{!!pollingError&&<><Text style={s.error}>{pollingError}</Text>{['queued','running'].includes(run.status)&&<Button secondary disabled={busy} title="Refresh run status" onPress={()=>setPollVersion(value=>value+1)}/>}</>}
 <ExecutionMap run={run}/>{run.result&&<><AgentReview result={run.result}/><ClaimEvidence result={run.result}/><Text style={s.h3}>Tool analysis</Text>{run.result.decision==='requires_human_review'&&<Notice><Text style={s.text}>The reviewer found unresolved issues. Review before use.</Text></Notice>}<Values value={run.result.analysis}/>{run.result.narrative&&<><Text style={s.h3}>AI synthesis</Text><Text selectable style={s.text}>{run.result.narrative}</Text></>}
 <Text style={s.muted}>External actions: {run.result.external_actions_performed?'recorded in this run':'none'}. Feedback: {run.review}.</Text>{run.review==='pending'&&<View style={s.row}><Button disabled={busy} title="Mark useful" onPress={()=>action('accepted')}/><Button secondary disabled={busy} title="Not useful" onPress={()=>action('rejected')}/></View>}<Button secondary busy={busy} title="Share report" onPress={share}/>
 {run.result.evidence.length>0&&<><Text style={s.h3}>Evidence</Text>{run.result.evidence.map(e=><View key={e.citation} style={s.group}><Text style={s.h3}>{e.title}</Text><Text selectable style={s.text}>{e.text}</Text><Text style={s.muted}>{e.source} · {e.as_of||'undated'}</Text><Text selectable style={s.code}>{e.citation}</Text></View>)}</>}
 </>}
 {['queued','running'].includes(run.status)&&<Button secondary disabled={busy} title="Cancel run" onPress={()=>action('cancel')}/>}{['failed','cancelled'].includes(run.status)&&<Button disabled={busy} title="Resume run" onPress={()=>action('retry')}/>}
 <Pressable accessibilityRole="button" onPress={()=>setDetails(!details)}><Text style={[s.text,{color:colors.accent}]}>{details?'Hide':'View'} steps ({run.events.length})</Text></Pressable>{details&&run.events.map(e=><View key={e.id} style={s.group}><Text style={s.tag}>{e.phase}</Text><Text style={s.muted}>{new Date(e.at).toLocaleString('en-US')}</Text><Text selectable style={s.code}>{JSON.stringify(e.detail,null,2)}</Text></View>)}
 </View>;
}
