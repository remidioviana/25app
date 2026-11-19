import {useReducedMotion} from '../src/experience/useReducedMotion';
import React,{useState,useEffect} from 'react';
import {View,Text,Pressable,ScrollView,Animated,Platform} from 'react-native';
import {router} from 'expo-router';
import {useApp,spec} from '../src/AppState';
import {brandId} from '../src/brand';
import {styles as s,experience as d} from '../src/theme';
import {useHeadlineFont} from '../src/experience/TypefaceProvider';
import {inputIssue} from '../src/validateInput';
import {interactiveRecords,type InteractiveRecord,type RecordView} from '../src/experience/interactiveRecords';
import type {Json} from '../src/types';
import {Button} from './Controls';
const format=(n:number)=>new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(n);
const narrative=new Set<RecordView>(['chronology','dependencies','onboarding','chapters','checkpoints']);
const tile=new Set<RecordView>(['workforce','manifest','competencies','materials','policy','coverage']);
const ribbon=new Set<RecordView>(['day','energy','reflection']);
/** Accessible native controls; the domain supplies its own data, layout and detail vocabulary. */
export function InteractiveRecords({editLink=true,input}:{editLink?:boolean;input?:Record<string,Json>}){
 const app=useApp(),font=useHeadlineFont(),[selection,setSelection]=useState(''),[filter,setFilter]=useState<'all'|'attention'>('all'),[page,setPage]=useState(0);
 const reduced=useReducedMotion(),[opacity]=useState(()=>new Animated.Value(1));
 useEffect(()=>{opacity.stopAnimation();if(reduced){opacity.setValue(1);return}opacity.setValue(.65);const animation=Animated.timing(opacity,{toValue:1,duration:d.motion_ms,useNativeDriver:Platform.OS!=='web'});animation.start();return()=>animation.stop()},[selection,filter,opacity,reduced]);
 const draft=input||app.draft;
 if(inputIssue(draft,spec.schema))return null;
 const scene=interactiveRecords(brandId,draft);if(!scene)return null;
 const records=scene.records.filter(x=>filter==='all'||x.state!=='recorded');
 const pageCount=Math.max(1,Math.ceil(records.length/24)),currentPage=Math.min(page,pageCount-1),visible=records.slice(currentPage*24,(currentPage+1)*24);
 const selected=visible.find(x=>`${x.id}:${x.label}`===selection)||visible[0];
 const max=Math.max(1,...scene.records.map(x=>Math.abs(x.value)));
 const choose=(r:InteractiveRecord)=>setSelection(`${r.id}:${r.label}`);
 function item(r:InteractiveRecord,i:number){
  const active=selected===r,bar=Math.abs(r.value)/max*100;
  const text=<><Text numberOfLines={2} style={{fontSize:15,lineHeight:22,color:d.ink,fontWeight:active?'700':'400'}}>{r.label}</Text><Text style={{color:active?d.accent:d.muted,fontSize:12,lineHeight:19}}>{!r.available?'Unavailable':r.unit?`${format(r.value)} ${r.unit}`:'Preferred activity'}</Text></>;
  let content:React.ReactNode;
  if(scene!.view==='workforce')content=<View style={{gap:10,alignItems:'center'}}><View style={{width:24,height:24,borderRadius:12,backgroundColor:r.value?d.accent:d.line}}/><View style={{width:48,height:20,borderTopLeftRadius:24,borderTopRightRadius:24,backgroundColor:r.value?d.accent:d.line}}/>{text}</View>;
  else if(scene!.view==='competencies')content=<View style={{gap:12}}>{text}<View style={{flexDirection:'row',gap:5}}>{Array.from({length:Math.max(1,Math.min(5,r.value))},(_,j)=><View key={j} style={{width:14,height:14,borderRadius:7,borderWidth:1,borderColor:d.accent,backgroundColor:r.value?d.accent:d.panel}}/>)}</View></View>;
  else if(scene!.view==='manifest')content=<View style={{gap:10,borderTopWidth:3,borderColor:d.accent,paddingTop:10}}><Text style={{color:d.muted,fontSize:10,letterSpacing:2}}>FIELD {String(i+1).padStart(2,'0')}</Text>{text}<Text style={{color:d.accent,fontWeight:'700',fontSize:10}}>{r.value?'PRESENT':'MISSING'}</Text></View>;
  else if(scene!.view==='policy')content=<View style={{gap:10,borderLeftWidth:4,borderColor:r.state==='recorded'?d.accent:d.muted,paddingLeft:12}}><Text style={{color:d.accent,fontSize:28}}>0{i+1}</Text>{text}<Text style={{color:d.muted,fontSize:11}}>{r.state==='recorded'?'Within entered policy':'Check this gate'}</Text></View>;
  else if(scene!.view==='materials')content=<View style={{gap:12}}><View style={{height:32,borderBottomWidth:2,borderColor:d.line,justifyContent:'center'}}><View style={{alignSelf:'flex-end',width:20,height:20,borderWidth:4,borderColor:d.accent,borderRadius:10}}/></View>{text}</View>;
  else if(scene!.view==='coverage')content=<View style={{flexDirection:'row',alignItems:'center',gap:10}}><View style={{width:20,height:20,borderRadius:4,borderWidth:2,borderColor:d.accent,backgroundColor:r.value?d.accent:d.panel}}/><View style={{flex:1,gap:6}}>{text}</View></View>;
  else if(scene!.view==='dependencies')content=<View style={{gap:10,paddingLeft:14,borderLeftWidth:2,borderColor:d.accent}}><Text style={{color:d.accent,fontSize:11}}>PREREQUISITES → TASK</Text>{text}<Text numberOfLines={2} style={{color:d.muted,fontSize:12}}>{r.reference}</Text></View>;
  else if(scene!.view==='chapters')content=<View style={{flexDirection:'row',gap:14}}><View style={{width:40,borderLeftWidth:3,borderColor:d.accent,justifyContent:'center',paddingLeft:10}}><Text style={{fontFamily:font,fontSize:28,color:d.accent}}>{i+1}</Text></View><View style={{flex:1,gap:6}}>{text}</View></View>;
  else if(scene!.view==='onboarding')content=<View style={{gap:12,borderBottomWidth:r.value?3:1,borderColor:d.accent,paddingBottom:12}}><Text style={{color:d.muted,fontSize:10}}>COMMITMENT {i+1} / {r.value?'COMPLETE':'OPEN'}</Text>{text}</View>;
  else if(scene!.view==='energy')content=<View style={{gap:10}}><View style={{height:70,justifyContent:'flex-end',alignItems:'center'}}><View style={{width:34,height:Math.max(4,bar*.7),backgroundColor:d.accent,borderTopLeftRadius:17,borderTopRightRadius:17}}/></View>{text}</View>;
  else if(scene!.view==='reflection')content=<View style={{gap:16,paddingVertical:16,alignItems:'center'}}><View style={{width:44,height:44,borderWidth:2,borderColor:d.accent,borderRadius:22,alignItems:'center',justifyContent:'center'}}><View style={{width:18,height:18,backgroundColor:d.accent,borderRadius:9}}/></View>{text}</View>;
  else if(scene!.view==='receipts')content=<View style={{gap:12,borderBottomWidth:1,borderStyle:'dashed',borderColor:d.accent,paddingBottom:14}}><Text style={{color:d.muted,fontSize:10,letterSpacing:2}}>RECEIPT / {String(i+1).padStart(3,'0')}</Text><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:d.ink}}>{r.label}</Text><Text style={{color:d.accent,fontWeight:'700'}}>{format(r.value)} {r.unit}</Text></View></View>;
  else if(scene!.view==='accessibility')content=<View style={{gap:12,paddingLeft:16,borderLeftWidth:3,borderStyle:r.state==='unknown'?'dashed':'solid',borderColor:d.accent}}>{text}<Text style={{color:d.muted,fontSize:11}}>{r.state==='unknown'?'Access needs confirmation':'All entered needs reported available'}</Text></View>;
  else if(scene!.view==='dining')content=<View style={{gap:12,flexDirection:'row',alignItems:'center'}}><View style={{width:64,height:64,borderRadius:32,borderWidth:2,borderColor:d.accent,justifyContent:'center',alignItems:'center'}}><Text style={{color:d.accent,fontSize:20}}>{format(r.value)}</Text></View><View style={{flex:1,gap:8}}>{text}</View></View>;
  else if(scene!.view==='clauses')content=<View style={{gap:10,borderLeftWidth:3,borderColor:d.accent,paddingLeft:14}}><Text style={{fontFamily:font,fontSize:26,color:d.accent}}>{format(r.value)} <Text style={{fontSize:12}}>matches</Text></Text><Text style={{color:d.ink}}>{r.label}</Text></View>;
  else if(narrative.has(scene!.view))content=<View style={{flexDirection:'row',gap:16,alignItems:'center'}}><View style={{width:36,height:36,borderRadius:18,borderWidth:active?2:1,borderColor:active?d.accent:d.line,alignItems:'center',justifyContent:'center'}}><Text style={{color:d.accent}}>{String(i+1).padStart(2,'0')}</Text></View><View style={{flex:1,gap:4}}>{text}</View></View>;
  else if(tile.has(scene!.view))content=<View style={{gap:12}}><View style={{height:5,width:`${Math.max(4,bar)}%`,backgroundColor:r.state==='recorded'?d.accent:d.muted,borderRadius:4}}/>{text}<Text style={{color:d.muted,fontSize:10,letterSpacing:1}}>{r.state==='recorded'?'RECORDED':r.state==='attention'?'CHECK':'UNKNOWN'}</Text></View>;
  else if(ribbon.has(scene!.view))content=<View style={{gap:10,borderLeftWidth:3,borderColor:d.accent,paddingLeft:12}}><Text style={{fontSize:24,color:d.accent,fontFamily:font}}>{format(r.value)}</Text>{text}</View>;
  else content=<View style={{gap:10}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><Text style={{color:d.ink,fontSize:15,flex:1}}>{r.label}</Text><Text style={{color:d.accent,fontSize:15}}>{r.available?`${format(r.value)} ${r.unit}`:'Unavailable'}</Text></View><View style={{height:scene!.view==='consumption'?24:10,backgroundColor:d.line,borderRadius:scene!.view==='budget'?8:0}}><View style={{width:`${bar}%`,height:'100%',backgroundColor:d.accent,borderRadius:scene!.view==='budget'?8:0}}/></View></View>;
  return <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`Inspect ${r.label}`} accessibilityState={{selected:active}} aria-pressed={active} onPress={()=>choose(r)} style={{minHeight:60,padding:16,gap:8,borderWidth:active?2:1,borderColor:active?d.accent:d.line,borderRadius:scene!.view==='receipts'?0:d.radius,backgroundColor:d.panel,...(tile.has(scene!.view)?{width:'47%' as const}:ribbon.has(scene!.view)?{width:180}: {})}}>{content}</Pressable>;
 }
 return <View testID={`interactive-${brandId}`} style={{gap:16,paddingVertical:22,borderTopWidth:2,borderColor:d.accent}}>
  <Text style={s.tag}>{scene.axis} · entered records</Text><Text accessibilityRole="header" style={[s.h2,{fontFamily:font}]}>{scene.title}</Text>
  <View style={{flexDirection:'row',gap:10,flexWrap:'wrap'}}>{(['all','attention'] as const).map(value=><Pressable key={value} accessibilityRole="button" accessibilityState={{selected:filter===value}} aria-pressed={filter===value} onPress={()=>{setFilter(value);setPage(0)}} style={{minHeight:44,padding:12,borderRadius:22,borderWidth:1,borderColor:filter===value?d.accent:d.line}}><Text style={{color:filter===value?d.accent:d.muted}}>{value==='all'?'All records':'Needs attention'}</Text></Pressable>)}</View>
  {ribbon.has(scene.view)?<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:6}}>{visible.map(item)}</ScrollView>:<View style={{gap:12,...(tile.has(scene.view)?{flexDirection:'row' as const,flexWrap:'wrap' as const}: {})}}>{visible.map(item)}</View>}
  {pageCount>1&&<View style={{gap:12}}><Text style={s.muted}>Page {currentPage+1} of {pageCount} · {records.length} records</Text><Button secondary title="Previous records" disabled={currentPage===0} onPress={()=>setPage(currentPage-1)}/><Button secondary title="Next records" disabled={currentPage===pageCount-1} onPress={()=>setPage(currentPage+1)}/></View>}
  {selected?<Animated.View testID="selected-record-detail" accessibilityLiveRegion="polite" style={{opacity,gap:12,padding:20,backgroundColor:d.panel,borderLeftWidth:3,borderColor:d.accent,borderRadius:d.radius}}><Text style={s.tag}>Selected record</Text><Text style={s.h3}>{selected.label}</Text><Text selectable style={s.text}>{selected.detail}</Text>{!!selected.reference&&<Text selectable style={s.muted}>{selected.reference}</Text>}</Animated.View>:<Text style={s.muted}>{filter==='attention'?'No flagged or unknown records in this view.':'Add records in the case details to explore this view.'}</Text>}
  {editLink&&<Button secondary title="Edit these records" onPress={()=>router.push('/mission')}/>}
 </View>;
}
