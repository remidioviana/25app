import React,{useState,useEffect,useRef} from 'react';
import {View,Text,TextInput} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {File} from 'expo-file-system';
import {AgentAPI} from '../src/api';
import type {Document} from '../src/types';
import {styles as s,colors} from '../src/theme';
import {EvidenceSearch} from './EvidenceSearch';
import {Button,Notice} from './Controls';
type DocumentProps={api:AgentAPI;agent:string;onError:(v:string)=>void};
export function Documents(props:DocumentProps){
 const [identity,setIdentity]=useState({api:props.api,agent:props.agent,key:0});
 if(identity.api!==props.api||identity.agent!==props.agent){setIdentity({api:props.api,agent:props.agent,key:identity.key+1})}
 return <DocumentForm key={identity.key} {...props}/>;
}
function DocumentForm({api,agent,onError}:DocumentProps){
 const [documents,setDocuments]=useState<Document[]>([]),[title,setTitle]=useState(''),[text,setText]=useState(''),[source,setSource]=useState(''),[asOf,setAsOf]=useState(''),[warnings,setWarnings]=useState<string[]>([]),[busy,setBusy]=useState(false);
 const scope=useRef<object|null>(null),errorHandler=useRef(onError);
 useEffect(()=>{errorHandler.current=onError},[onError]);
 useEffect(()=>{
  const current={};scope.current=current;
  api.documents(agent).then(x=>{if(scope.current===current)setDocuments(x.documents)}).catch(e=>{if(scope.current===current)errorHandler.current(e instanceof Error?e.message:'Load failed')});
  return ()=>{scope.current=null};
 },[agent,api]);
 async function pick(){
  const current=scope.current;setBusy(true);
  try{
   const result=await DocumentPicker.getDocumentAsync({type:['text/plain','text/markdown','text/csv','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],copyToCacheDirectory:true,multiple:false});
   if(scope.current!==current||result.canceled)return;
   const asset=result.assets[0],file=new File(asset.uri);
   if((asset.size??file.size)>2_000_000)throw new Error('File exceeds 2 MB');
   const content=await file.base64();if(scope.current!==current)return;
   const extracted=await api.preview(asset.name,content);if(scope.current!==current)return;
   setTitle(asset.name);setText(extracted.text);setSource('');setAsOf('');setWarnings(extracted.warnings);
  }catch(e){if(scope.current===current)errorHandler.current(e instanceof Error?e.message:'Import failed')}
  finally{if(scope.current===current)setBusy(false)}
 }
 async function save(){
  const current=scope.current;setBusy(true);
  try{
   await api.addDocument(agent,title,text,source,asOf);if(scope.current!==current)return;
   setTitle('');setText('');setSource('');setAsOf('');setWarnings([]);
   const result=await api.documents(agent);if(scope.current===current)setDocuments(result.documents);
  }catch(e){if(scope.current===current)errorHandler.current(e instanceof Error?e.message:'Save failed')}
  finally{if(scope.current===current)setBusy(false)}
 }
 return <View style={{gap:12}}><EvidenceSearch key={agent} api={api} agent={agent}/><Text style={s.h2}>Evidence library</Text><Text style={s.muted}>TXT, MD, CSV, text PDF or DOCX, up to 2 MB. Extraction runs on your server. Review the text before saving it.</Text><Button secondary busy={busy} title="Choose document" onPress={pick}/>{warnings.length>0&&<Notice>{warnings.map((w,i)=><Text key={i} style={s.text}>{w}</Text>)}</Notice>}
 <TextInput editable={!busy} style={s.input} accessibilityLabel="Document title" placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle}/><TextInput editable={!busy} style={s.input} accessibilityLabel="Source reference" placeholder="Source / reference" placeholderTextColor={colors.muted} value={source} onChangeText={setSource}/><TextInput editable={!busy} style={s.input} accessibilityLabel="Source date" placeholder="Source date: YYYY-MM-DD (optional)" placeholderTextColor={colors.muted} value={asOf} onChangeText={setAsOf}/><TextInput editable={!busy} style={[s.input,{minHeight:160,maxHeight:320,textAlignVertical:'top'}]} multiline accessibilityLabel="Extracted text" placeholder="Extracted or pasted text" placeholderTextColor={colors.muted} value={text} onChangeText={setText}/><Button title="Add to evidence" busy={busy} disabled={!title.trim()||!text.trim()} onPress={save}/>
 <Text style={s.h3}>{documents.length} documents for this agent</Text>{documents.map(d=><View key={d.id} style={s.card}><Text style={s.h3}>{d.title}</Text><Text style={s.muted}>{d.source} · {d.as_of||'undated'}</Text></View>)}</View>;
}
