import React,{useEffect,useState} from 'react';
import {AppState,View,Text,Pressable,Share,Platform} from 'react-native';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
import {AgentAPI} from '../src/api';
import type {Run,Json} from '../src/types';
import {styles as s,colors} from '../src/theme';
import {inputLabel} from '../src/forms';
import {ClaimEvidence} from './ClaimEvidence';
import {AgentReview} from './AgentReview';
import {Button,Notice} from './Controls';
const status:Record<Run['status'],string>={queued:'Queued',running:'Running',completed:'Completed',failed:'Failed',cancelled:'Cancelled'};
function Values({value}:{value:Json}){
 if(Array.isArray(value))return <View>{value.slice(0,50).map((v,i)=><View key={i} style={s.group}><Values value={v}/></View>)}{value.length>50&&<Text style={s.muted}>Showing 50 of {value.length} items. Export the complete report.</Text>}</View>;
 if(value!==null&&typeof value==='object')return <View>{Object.entries(value).map(([k,v])=><View key={k} style={{marginVertical:5}}><Text style={s.label}>{inputLabel(k)}</Text><Values value={v}/></View>)}</View>;
 return <Text selectable style={s.text}>{value===null?'Not provided':typeof value==='boolean'?(value?'Yes':'No'):String(value)}</Text>;
}
export function RunView({api,initial,onError}:{api:AgentAPI;initial:Run;onError:(s:string)=>void}){
 const [run,setRun]=useState(initial),[busy,setBusy]=useState(false),[details,setDetails]=useState(false),[foreground,setForeground]=useState(AppState.currentState==='active');
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>setForeground(state==='active'));return ()=>sub.remove()},[]);
 useEffect(()=>{
  if(!foreground||!['queued','running'].includes(run.status))return;
  const controller=new AbortController();let stopped=false;let timer:ReturnType<typeof setTimeout>;
  async function poll(){try{const next=await api.run(run.id,controller.signal);if(!stopped)setRun(next)}catch(e){if(!stopped)onError(e instanceof Error?e.message:'Connection failed')}finally{if(!stopped)timer=setTimeout(poll,2000)}}
  timer=setTimeout(poll,500);return ()=>{stopped=true;clearTimeout(timer);controller.abort()};
 },[api,run.id,run.status,foreground,onError]);
 async function action(name:'cancel'|'retry'|'accepted'|'rejected'){
  setBusy(true);try{setRun(name==='cancel'||name==='retry'?await api.action(run.id,name):await api.review(run,name))}catch(e){onError(e instanceof Error?e.message:'Action failed')}finally{setBusy(false)}
 }
 async function share(){
  setBusy(true);let file:File|undefined;
  try{const text=await api.exportMarkdown(run.id);if(Platform.OS==='web'){await Share.share({message:text});return}
   file=new File(Paths.cache,`agent-${run.id}.md`);file.create({overwrite:true});file.write(text);
   if(await Sharing.isAvailableAsync())await Sharing.shareAsync(file.uri,{mimeType:'text/markdown',dialogTitle:'Share report'});
   else throw new Error('Sharing is unavailable on this device');
  }catch(e){onError(e instanceof Error?e.message:'Export failed')}finally{if(file?.exists)file.delete();setBusy(false)}
 }
 return <View style={s.card}><View style={[s.row,{justifyContent:'space-between'}]}><Text style={s.h2}>Run</Text><Text style={s.tag}>{status[run.status]}</Text></View><Text style={s.muted}>{run.goal}</Text>{!!run.example&&<Notice><Text style={s.text}>Demo data</Text></Notice>}{run.error&&<Text style={s.error}>{run.error}</Text>}
 {run.result&&<><AgentReview result={run.result}/><ClaimEvidence result={run.result}/><Text style={s.h3}>Tool analysis</Text>{run.result.decision==='requires_human_review'&&<Notice><Text style={s.text}>The reviewer found unresolved issues. Review before use.</Text></Notice>}<Values value={run.result.analysis}/>{run.result.narrative&&<><Text style={s.h3}>AI synthesis</Text><Text selectable style={s.text}>{run.result.narrative}</Text></>}
 <Text style={s.muted}>No external change was executed. Review: {run.review}.</Text>{run.review==='pending'&&<View style={s.row}><Button disabled={busy} title="Accept result" onPress={()=>action('accepted')}/><Button secondary disabled={busy} title="Reject" onPress={()=>action('rejected')}/></View>}<Button secondary busy={busy} title="Share report" onPress={share}/>
 {run.result.evidence.length>0&&<><Text style={s.h3}>Evidence</Text>{run.result.evidence.map(e=><View key={e.citation} style={s.group}><Text style={s.h3}>{e.title}</Text><Text selectable style={s.text}>{e.text}</Text><Text style={s.muted}>{e.source} · {e.as_of||'undated'}</Text><Text selectable style={s.code}>{e.citation}</Text></View>)}</>}
 </>}
 {['queued','running'].includes(run.status)&&<Button secondary disabled={busy} title="Cancel run" onPress={()=>action('cancel')}/>}{['failed','cancelled'].includes(run.status)&&<Button disabled={busy} title="Resume run" onPress={()=>action('retry')}/>}
 <Pressable accessibilityRole="button" onPress={()=>setDetails(!details)}><Text style={[s.text,{color:colors.accent}]}>{details?'Hide':'View'} steps ({run.events.length})</Text></Pressable>{details&&run.events.map(e=><View key={e.id} style={s.group}><Text style={s.tag}>{e.phase}</Text><Text style={s.muted}>{new Date(e.at).toLocaleString('en-US')}</Text><Text selectable style={s.code}>{JSON.stringify(e.detail,null,2)}</Text></View>)}
 </View>;
}
