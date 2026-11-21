import React,{useEffect,useRef,useState} from 'react';
import {View,Text,TextInput} from 'react-native';
import {limitCharacters} from '../src/experience/textMetrics';
import {AgentAPI} from '../src/api';
import type {EvidenceSearchResult} from '../src/types';
import {styles as s,colors} from '../src/theme';
import {Button} from './Controls';

const clientIds=new WeakMap<AgentAPI,number>();let nextClientId=0;
export function EvidenceSearch({api,agent}:{api:AgentAPI;agent:string}){
 if(!clientIds.has(api))clientIds.set(api,++nextClientId);
 return <SearchPanel key={`${clientIds.get(api)}:${agent}`} api={api} agent={agent}/>;
}
function SearchPanel({api,agent}:{api:AgentAPI;agent:string}){
 const [query,setQuery]=useState(''),[result,setResult]=useState<EvidenceSearchResult|null>(null),[searched,setSearched]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const pending=useRef<AbortController|null>(null);
 useEffect(()=>()=>{pending.current?.abort();pending.current=null},[]);
 function clear(){pending.current?.abort();pending.current=null;setBusy(false);setResult(null);setSearched('');setError('')}
 async function search(){
  pending.current?.abort();const controller=new AbortController();pending.current=controller;
  setBusy(true);setResult(null);setError('');const submitted=query.trim();setSearched(submitted);
  try{const response=await api.searchEvidence(agent,submitted,controller.signal);if(pending.current===controller)setResult(response)}
  catch(e){if(pending.current===controller&&!controller.signal.aborted)setError(e instanceof Error?e.message:'Evidence search failed')}
  finally{if(pending.current===controller){pending.current=null;setBusy(false)}}
 }
 return <View style={s.card}>
  <Text style={s.h2}>Find supporting evidence</Text>
  <Text style={s.muted}>Search documents saved to this app on your server. Keyword search does not call an AI provider. A matching excerpt is not proof that its source is correct.</Text>
  <TextInput accessibilityLabel="Search evidence" placeholder="Enter a phrase or topic" placeholderTextColor={colors.muted} style={s.input} value={query} onChangeText={value=>{const next=limitCharacters(value,2000);if(next!==query){clear();setQuery(next)}}}/>
  <View style={s.row}><Button title="Search documents" busy={busy} disabled={!query.trim()} onPress={search}/><Button secondary title={busy?'Cancel search':'Clear results'} onPress={clear}/></View>
  {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  {result&&<><Text style={s.h3}>{result.matches.length} excerpts for “{searched}”</Text>{result.matches.length===0&&<Text style={s.muted}>No matching evidence. Try another term or add a document below.</Text>}
   {result.warnings.map((warning,i)=><Text key={i} style={s.muted}>{warning}</Text>)}
   {result.matches.map(match=><View key={match.citation} style={s.group}><Text style={s.h3}>{match.title}</Text><Text selectable style={s.text}>{match.text}</Text><Text selectable style={s.muted}>Source: {match.source||'Not provided'}</Text><Text style={s.muted}>Source date: {match.as_of||'Not provided'}</Text><Text selectable style={s.code}>Citation: {match.citation}</Text></View>)}
  </>}
 </View>;
}
