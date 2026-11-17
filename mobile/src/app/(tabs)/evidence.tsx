import React,{useState} from 'react';
import {ScrollView,Text,View} from 'react-native';
import {FocusScreen} from '../../../components/FocusScreen';
import {router} from 'expo-router';
import {useApp} from '../../AppState';
import {brandId} from '../../brand';
import {experience as d,screenEdges,styles as s} from '../../theme';
import {ExperienceTitle} from '../../experience/TypefaceProvider';
import {briefs} from '../../experience/briefs';
import {savedIntelligence} from '../../experience/intelligence';
import guides from '../../experience/sourceGuides.json';
import {Documents} from '../../../components/Documents';
import {Button} from '../../../components/Controls';
import {PublicSources} from '../../../components/PublicSources';
import {SourceBrief} from '../../../components/HomeExperience';
import {IntelligenceNote} from '../../../components/IntelligenceNote';
export default function Evidence(){const {api}=useApp(),brief=briefs[brandId],analysis=savedIntelligence(brandId);const [error,setError]=useState(''),[refreshVersion,setRefreshVersion]=useState(0);return <FocusScreen route="evidence" style={s.screen} edges={screenEdges}><ScrollView contentContainerStyle={{padding:22,paddingBottom:35,gap:23}}><View style={{borderBottomWidth:d.serif?1:3,borderColor:d.accent,paddingBottom:18,gap:10}}><Text style={s.tag}>{brief.authority}</Text><ExperienceTitle style={{fontSize:d.serif?38:30,lineHeight:44}}>{d.tabs[2]}</ExperienceTitle><Text style={s.muted}>Public reading · {new Date(brief.fetched_at).toLocaleDateString('en-GB')}</Text></View>{!!error&&<Text style={s.error}>{error}</Text>}<View style={{padding:d.navigation==='drawer'?0:20,borderLeftWidth:d.navigation==='drawer'?2:0,borderColor:d.accent,paddingLeft:d.navigation==='drawer'?18:20,borderRadius:d.radius,backgroundColor:d.navigation==='floating'?d.panel:d.bg,gap:18}}><Text style={[s.h2,{fontSize:23,lineHeight:30}]}>{brief.title}</Text>{analysis&&<IntelligenceNote value={analysis}/>}<Text style={s.h3}>{guides[brandId].title.replaceAll('\n',' ')}</Text><Text style={s.text}>{guides[brandId].meaning}</Text><Text style={s.muted}>{guides[brandId].next_step}</Text><SourceBrief brief={brief} status="Published excerpt"/></View><Button title={'Bring this context to '+d.tabs[1].toLowerCase()} onPress={()=>router.push('/mission')}/>{api&&<><PublicSources api={api} agent={brandId} onRetrieved={()=>setRefreshVersion(x=>x+1)}/><Documents api={api} agent={brandId} onError={setError} refreshVersion={refreshVersion}/></>}<View style={{borderTopWidth:1,borderColor:d.line,paddingTop:18,gap:10}}><Text style={s.h3}>{d.tabs[1]} · private material</Text><Text style={s.muted}>{d.case_intro}</Text><Button secondary title={d.action} onPress={()=>router.push('/mission')}/></View></ScrollView></FocusScreen>}
