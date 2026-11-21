import {sourceRequestScope} from '../src/sourceRequestScope';
import React,{useEffect,useRef,useState} from 'react';
import {View,Text} from 'react-native';
import type {AgentAPI} from '../src/api';
import type {PublicSource,PublicSourceRead} from '../src/types';
import {styles as s} from '../src/theme';
import {Button,Notice} from './Controls';

type Props={api:AgentAPI|null;agent:string;onRetrieved?:()=>void};

/** Real source read controls; a listed source is never labelled connected or current. */
export function PublicSources(props:Props){
 const [identity,setIdentity]=useState({api:props.api,agent:props.agent,key:0});
 if(identity.api!==props.api||identity.agent!==props.agent)setIdentity({api:props.api,agent:props.agent,key:identity.key+1});
 return <SourcePanel key={identity.key} {...props}/>;
}
function SourcePanel({api,agent,onRetrieved}:Props){
 const [sources,setSources]=useState<PublicSource[]>([]),[reads,setReads]=useState<PublicSourceRead[]>([]),[loading,setLoading]=useState(!!api),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState('');
 const [requests]=useState(()=>sourceRequestScope()),retrieved=useRef(onRetrieved);
 useEffect(()=>{retrieved.current=onRetrieved},[onRetrieved]);
 useEffect(()=>{
  requests.start();const controller=requests.catalogue()!;
  if(api)api.publicSources(agent,controller.signal).then(result=>{if(requests.current(controller)){setSources(result.sources);setReads(result.reads)}}).catch(e=>{if(requests.current(controller))setError(e instanceof Error?e.message:'Could not load the source catalogue.')}).finally(()=>{if(requests.current(controller)){setLoading(false);requests.finish(controller)}});
  return()=>requests.dispose();
 },[api,agent,requests]);
 async function reload(){
  if(!api)return;const controller=requests.catalogue();if(!controller)return;
  setLoading(true);setError('');
  try{const value=await api.publicSources(agent,controller.signal);if(requests.current(controller)){setSources(value.sources);setReads(value.reads)}}
  catch(e){if(requests.current(controller))setError(e instanceof Error?e.message:'Could not reload source history.')}
  finally{if(requests.current(controller)){requests.finish(controller);setLoading(false)}}
 }
 async function refresh(source:PublicSource){
  if(!api)return;const controller=requests.read();if(!controller)return;
  setLoading(false);setBusy(source.id);setError('');
  try{
   const value=await api.refreshPublicSource(agent,source.id,controller.signal);
   if(!requests.current(controller))return;
   if(value.receipt.status!=='retrieved'||value.receipt.source_id!==source.id)throw new Error('The server did not confirm the requested source read.');
   setReads(old=>[value.receipt,...old].slice(0,20));retrieved.current?.();
  }catch(e){
   if(!requests.current(controller))return;
   setError(e instanceof Error?e.message:'The source read was not confirmed.');
   // The backend records failed read attempts; show their actual receipts too.
   try{const latest=await api.publicSources(agent,controller.signal);if(requests.current(controller))setReads(latest.reads)}catch{/* Keep the real read error; do not invent a failed receipt. */}
  }finally{if(requests.current(controller)){setBusy(null);requests.finish(controller)}}
 }
 function cancel(){requests.cancelRead();setBusy(null);setError('Stopped waiting for the source read. The server may finish a request already started; revisit the source history to reconcile it.')}
 return <View style={{gap:12}}>
  <Text style={s.h2}>Public source evidence</Text>
  <Text style={s.muted}>Read-only retrieval from fixed, reviewed URLs on your server. A source in the catalogue has not necessarily been read successfully.</Text>
  {!api&&<Notice><Text style={s.text}>Connect a workspace to inspect its source catalogue and actual read history. No source has been contacted by this screen.</Text></Notice>}
  {loading&&<Text style={s.muted}>Loading configured source catalogue and recorded reads…</Text>}
  {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  {api&&!loading&&!sources.length&&!error&&<Text style={s.muted}>No reviewed source is configured for this app. No live-source capability is implied.</Text>}
  {api&&<Button secondary title="Reload source history" disabled={busy!==null||loading} onPress={reload}/>}
  {sources.map(source=><View key={source.id} style={s.group}>
   <Text style={s.h3}>{source.title}</Text>{source.source_scope&&<Text style={s.muted}>{source.source_scope}</Text>}<Text style={s.muted}>{source.authority} · read-only source</Text><Text selectable style={s.code}>{source.url}</Text>
   <Text style={s.muted}>Available to attempt. This is not a successful connection or freshness assertion.</Text>
   <Button secondary title={'Read source: '+source.title} disabled={busy!==null} busy={busy===source.id} onPress={()=>refresh(source)}/>
  </View>)}
  {busy&&<><Text style={s.muted}>Reading the selected source through the server. No result is confirmed yet.</Text><Button secondary title="Stop waiting for source read" onPress={cancel}/></>}
  {api&&!loading&&<><Text style={s.h3}>Recorded source reads</Text>{!reads.length&&<Text style={s.muted}>No source read has been recorded for this app.</Text>}</>}
  {reads.map((read,index)=><View key={`${read.source_id}:${read.fetched_at||read.finished_at}:${index}`} style={s.group}>
   <Text style={s.h3}>{read.title||read.source_id}</Text>
   <Text style={s.text}>{read.status==='retrieved'?'Retrieved source text':'Source read failed'}</Text>
   <Text style={s.muted}>{read.fetched_at||read.finished_at||read.started_at}</Text>
   {read.status==='failed'?<Text style={s.error}>{read.error||'No content was verified.'}</Text>:<>
    <Text style={s.muted}>HTTP {read.http_status} · {read.characters} extracted characters. Publication date and legal applicability are not verified by this retrieval.</Text>
    <Text selectable style={s.code}>Raw SHA-256: {read.raw_sha256||'Not provided'}</Text>
    {read.document_id&&<Text selectable style={s.code}>Saved evidence document: {read.document_id}</Text>}
    {read.warnings?.map((warning,i)=><Text key={i} style={s.muted}>{warning}</Text>)}
   </>}
   <Text selectable style={s.code}>{read.url}</Text>
  </View>)}
  <Text style={s.muted}>Retrieval does not verify a legal conclusion, current eligibility, a live service status or an external submission. Read receipts are evidence of retrieval only.</Text>
 </View>;
}
