import {useHimayahWorkspaceCopy} from '../../experience/useHimayahWorkspaceCopy';
import {NafasExperience} from '../../../components/NafasExperience';
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
import {Documents} from '../../../components/Documents';
import {Button} from '../../../components/Controls';
import {PublicSources} from '../../../components/PublicSources';
import {ResearchComposition} from '../../../components/ResearchComposition';
import {BrandSignature} from '../../../components/BrandSignature';
import {IntelligenceNote} from '../../../components/IntelligenceNote';
function Evidence(){const {t,tabs,direction,aligned,rtl}=useHimayahWorkspaceCopy();const {api}=useApp(),brief=briefs[brandId],analysis=savedIntelligence(brandId);const [error,setError]=useState(''),[refreshVersion,setRefreshVersion]=useState(0);return <FocusScreen route="evidence" style={[s.screen,direction]} edges={screenEdges}><ScrollView contentContainerStyle={{padding:22,paddingBottom:35,gap:23}}><View style={{borderBottomWidth:d.serif?1:3,borderColor:d.accent,paddingBottom:18,gap:10}}><Text style={s.tag}>{brief.authority}</Text><ExperienceTitle style={{fontSize:d.serif?38:30,lineHeight:44}}>{tabs?.[2]??d.tabs[2]}</ExperienceTitle><Text style={[s.muted,aligned]}>{t('Public reading')} · {new Date(brief.fetched_at).toLocaleDateString(rtl?'ar-AE':'en-GB')}</Text></View>{!!error&&<Text style={s.error}>{error}</Text>}<BrandSignature/>{analysis&&<IntelligenceNote value={analysis}/>}<ResearchComposition/><Button title={t('Bring this context to '+d.tabs[1].toLowerCase())} onPress={()=>router.push('/mission')}/>{api&&<><PublicSources api={api} agent={brandId} onRetrieved={()=>setRefreshVersion(x=>x+1)}/><Documents api={api} agent={brandId} onError={setError} refreshVersion={refreshVersion}/></>}<View style={{borderTopWidth:1,borderColor:d.line,paddingTop:18,gap:10}}><Text style={s.h3}>{t(d.tabs[1]+' · private material')}</Text><Text style={[s.muted,aligned]}>{t(d.case_intro)}</Text><Button secondary title={t(d.action)} onPress={()=>router.push('/mission')}/></View></ScrollView></FocusScreen>}

export default function ProductScreen(){const {workspaceEpoch}=useApp();return brandId==='nafas'?<NafasExperience screen='reflections'/>:<Evidence key={workspaceEpoch}/>}
