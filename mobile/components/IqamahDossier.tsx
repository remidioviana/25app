import React,{useEffect,useState} from 'react';
import {View,Text,Pressable,TextInput,Animated,Platform} from 'react-native';
import {temporaryReportFile} from '../src/temporaryReportFile';
import {cleanupTemporaryReport,type TemporaryReport} from '../src/temporaryReport';
import * as Sharing from 'expo-sharing';
import {assessDossier,dossierIssue,type DocumentState,type DossierInput} from '../src/dossier';
import {updateDossierRecord,dossierExport} from '../src/experience/dossierPreparation';
import {styles as s,experience as d} from '../src/theme';
import {useReducedMotion} from '../src/experience/useReducedMotion';
import {useHeadlineFont,useScriptFont} from '../src/experience/TypefaceProvider';
import {Button} from './Controls';
const labels:Record<DocumentState,string>={missing:'Missing evidence',expired:'Recorded expiry has passed',present_unverified:'Recorded · authenticity unverified'};
/** Editorial preparation desk. Every finding is derived from the supplied checklist. */
export function IqamahDossier({input,onChange}:{input:unknown;onChange?:(next:DossierInput)=>void}){
 const [selection,setSelection]=useState<{input:unknown;name:string}|null>(null),[reference,setReference]=useState(''),[expires,setExpires]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[limit,setLimit]=useState(25),[reveal]=useState(()=>new Animated.Value(1));
 const selected=selection&&selection.input===input?selection.name:null;
 const reduced=useReducedMotion(),font=useHeadlineFont(),scriptFont=useScriptFont(reference);
 useEffect(()=>{reveal.stopAnimation();if(reduced||!selected){reveal.setValue(1);return}reveal.setValue(0);const animation=Animated.timing(reveal,{toValue:1,duration:280,useNativeDriver:Platform.OS!=='web'});animation.start();return()=>animation.stop()},[selected,reduced,reveal]);
 const issue=dossierIssue(input);
 if(issue)return <View style={s.notice}><Text style={s.h2}>Review your dossier inputs</Text><Text accessibilityRole="alert" style={s.error}>{issue}</Text><Text style={s.muted}>Open Dossier to correct your checklist and review date.</Text></View>;
 const result=assessDossier(input),value=input as DossierInput,active=result.checks.find(x=>x.requirement===selected);
 function open(name:string){const doc=value.documents.find(x=>x.name===name);setSelection(name===selected?null:{input,name});setReference(doc?.reference||'');setExpires(doc?.expires||'');setError('')}
 function save(remove=false){if(!onChange||!active)return;try{onChange(updateDossierRecord(input,active.requirement,remove?null:{reference,expires}));setError('');setSelection(null)}catch(e){setError(e instanceof Error?e.message:'Check the document record.')}}
 async function exportFile(){if(busy)return;setBusy(true);setError('');let file:TemporaryReport|undefined;
  try{const content=dossierExport(input);if(Platform.OS==='web'){const uri=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));const link=document.createElement('a');link.href=uri;link.download='iqamah-preparation.json';link.click();setTimeout(()=>URL.revokeObjectURL(uri),1000)}else{file=temporaryReportFile('iqamah-preparation','json');file.create();file.write(content);if(!await Sharing.isAvailableAsync())throw Error('Sharing is unavailable on this device.');await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Export visa preparation dossier'})}}catch(e){setError(e instanceof Error?e.message:'Dossier export failed.')}finally{if(!cleanupTemporaryReport(file))setError(previous=>previous||'Could not remove the temporary report file.');setBusy(false)}
 }
 return <View style={{gap:28}}>
  <View style={{borderTopWidth:1,borderBottomWidth:1,borderColor:d.ink,paddingVertical:24,gap:12}}><Text style={s.tag}>IQAMAH / PREPARATION FOLIO</Text><Text accessibilityRole="header" style={{fontFamily:font,fontSize:38,lineHeight:44,color:d.ink}}>A place for every piece of evidence.</Text><Text style={s.text}>Review date · {result.as_of}</Text><Text style={s.muted}>Your selected checklist, organized into a working dossier. Open Criteria to consult the official requirements.</Text></View>
  <View style={{gap:0}}>{[{n:result.checks.length,label:'Checklist items'},{n:result.counts.missing,label:'Evidence to gather'},{n:result.counts.expired,label:'Recorded expiries to resolve'},{n:result.counts.present_unverified,label:'Document records to verify'}].map((step,index)=><View key={step.label} style={{flexDirection:'row',gap:18,minHeight:64}}><View style={{width:28,alignItems:'center'}}><Text style={{fontFamily:font,fontSize:24,color:d.ink}}>{index+1}</Text>{index<3&&<View style={{width:1,flex:1,backgroundColor:d.line}}/>}</View><View style={{flex:1,borderBottomWidth:1,borderColor:d.line,paddingBottom:18,marginBottom:16}}><Text style={s.h3}>{step.n} · {step.label}</Text></View></View>)}</View>
  {!!error&&<Text role="alert" style={s.error}>{error}</Text>}
  <Text accessibilityRole="header" style={[s.h2,font&&{fontFamily:font,fontWeight:'400'}]}>The evidence index</Text>
  <Text style={s.muted}>Select a checklist item to inspect or edit its document reference. Names match exactly.</Text>
  {result.checks.slice(0,limit).map((check,index)=><View key={check.requirement} style={{gap:14,borderBottomWidth:1,borderColor:d.line,paddingBottom:20}}><Pressable accessibilityRole="button" accessibilityLabel={`${check.requirement}: ${labels[check.status]}. Show recorded details`} accessibilityState={{expanded:selected===check.requirement}} onPress={()=>open(check.requirement)} style={{minHeight:64,flexDirection:'row',gap:16,alignItems:'center'}}><Text style={{fontSize:20,fontFamily:font,color:d.muted}}>{String(index+1).padStart(2,'0')}</Text><View style={{flex:1,gap:6}}><Text style={s.h3} numberOfLines={2}>{check.requirement.replaceAll('_',' ')}</Text><Text style={s.muted}>{labels[check.status]}</Text></View><Text style={s.h2}>{selected===check.requirement?'−':'+'}</Text></Pressable>
   {selected===check.requirement&&<Animated.View testID="iqamah-document-reveal" style={{gap:16,paddingLeft:18,borderLeftWidth:2,borderColor:d.accent,opacity:reveal,transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[12,0]})}]}}><Text selectable style={s.text}>{check.requirement}</Text><Text style={s.label}>Document reference</Text><TextInput accessibilityLabel="Dossier document reference" value={reference} onChangeText={setReference} editable={!!onChange} maxLength={100000} multiline style={[s.input,scriptFont&&{fontFamily:scriptFont}]}/><Text style={s.label}>Recorded expiry</Text><TextInput accessibilityLabel="Dossier document expiry" value={expires} onChangeText={setExpires} editable={!!onChange} maxLength={10} placeholder="YYYY-MM-DD · leave blank if unknown" placeholderTextColor={d.muted} style={s.input}/><Text style={s.muted}>A blank expiry stays unknown. Recording a document does not authenticate it or establish visa eligibility.</Text>{onChange&&<><Button title="Save document record" onPress={()=>save()}/>{check.status!=='missing'&&<Button secondary title="Remove document record" onPress={()=>save(true)}/>}</>}</Animated.View>}
  </View>)}
  {limit<result.checks.length&&<Button secondary title="Show more checklist items" onPress={()=>setLimit(n=>n+25)}/>}
  <Button title="Export my preparation dossier" busy={busy} onPress={exportFile}/><Text style={s.muted}>Exports the exact checklist, document references and dated findings as editable JSON. No official application is submitted.</Text>
 </View>;
}
