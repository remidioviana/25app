import {operationGate} from '../src/operationGate';
import {downloadText} from '../src/webDownload';
import {temporaryReportFile} from '../src/temporaryReportFile';
import {cleanupTemporaryReport,type TemporaryReport} from '../src/temporaryReport';
import {InteractiveRecords} from './InteractiveRecords';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {View,Text,TextInput,FlatList,Modal,ScrollView,Platform,Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,usePathname} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import {FocusScreen} from './FocusScreen';
import {Button} from './Controls';
import {RunView} from './RunView';
import {ClaimEvidence} from './ClaimEvidence';
import {useApp,spec} from '../src/AppState';
import type {AgentAPI} from '../src/api';
import type {Document} from '../src/types';
import {styles as s,experience as d,screenEdges} from '../src/theme';
import {useReducedMotion} from '../src/experience/useReducedMotion';
import {useScriptFont} from '../src/experience/TypefaceProvider';
import {pickedFileBase64} from '../src/experience/pickedFile';
import {inspectClauses,documentBlocks,inspectionMarkdown,type ScreeningRule,type ClauseHit} from '../src/experience/clauseInspection';
import {providerStatus} from '../src/providerStatus';
import {inputIssue} from '../src/validateInput';
import {useHimayahLanguage} from '../src/experience/HimayahLanguage';
const arabic:Record<string,string>={
 "HIMAYAH / DOCUMENT INSPECTOR": "حماية / فاحص المستندات",
 "Your document, in focus.": "مستندك في بؤرة الاهتمام",
 "Import PDF": "استيراد ملف PDF",
 "Connect PDF extraction": "ربط خدمة استخراج PDF",
 "Edit text": "تعديل النص",
 "Paste text": "لصق النص",
 "Screening rules": "قواعد الفحص",
 "Findings index": "فهرس النتائج",
 "Each entry is a supplied phrase rule, not a legal verdict.": "كل بند قاعدة عبارة مقدمة، وليس حكماً قانونياً.",
 "literal match found": "تم العثور على تطابق حرفي",
 "no literal match": "لا يوجد تطابق حرفي",
 "Show more rule findings": "عرض المزيد من نتائج القواعد",
 "Add your screening rules": "أضف قواعد الفحص",
 "Start with the document.": "ابدأ بالمستند",
 "Paste authorized text to inspect it locally, or connect your extraction service to import a text PDF. Highlights follow the exact phrases you define.": "ألصق نصاً مصرحاً به لفحصه محلياً، أو اربط خدمة الاستخراج لاستيراد PDF نصي. تتبع العلامات العبارات التي تحددها.",
 "Export annotations": "تصدير التعليقات",
 "Analyze with the agent team": "التحليل بواسطة فريق الوكلاء",
 "Open recorded analysis": "فتح التحليل المسجل",
 "Clause annotation": "تعليق على البند",
 "Your annotation": "تعليقك",
 "Next finding": "النتيجة التالية",
 "Back to the document": "العودة إلى المستند",
 "Authorized document text": "نص المستند المصرح به",
 "Document inspector text": "نص فاحص المستند",
 "Use this document text": "استخدم نص هذا المستند",
 "Cancel text edit": "إلغاء تعديل النص",
 "Recorded document analysis": "تحليل المستند المسجل",
 "Traceable retrieved claims": "مطالبات مسترجعة قابلة للتتبع",
 "No completed analysis with this exact current document and rules has been recorded here.": "لم يُسجل هنا تحليل مكتمل للمستند والقواعد الحالية المطابقة تماماً.",
 "Return to the inspector": "العودة إلى الفاحص",
 "This is a literal match in your current document. Regulatory support is shown only in a separately recorded matching analysis.": "هذا تطابق حرفي في مستندك الحالي. تظهر الأدلة التنظيمية فقط في تحليل منفصل مسجل ومطابق.",
 "Match display limit reached; export retains the same bounded screening scope.": "تم بلوغ حد عرض التطابقات؛ يحتفظ التصدير بنطاق الفحص المحدود نفسه.",
 "Up to three match shortcuts per rule; Next finding in the overlay visits every recorded match.": "تتوفر ثلاثة اختصارات للتطابق لكل قاعدة؛ يتيح زر النتيجة التالية التنقل بين جميع التطابقات المسجلة."
};
interface Imported {api:AgentAPI;document:Document;originalText:string}
export function HimayahInspector(){
 const {language}=useHimayahLanguage();const rtl=language==='ar';const t=(value:string)=>rtl?(arabic[value]??value):value;const rtlText={textAlign:rtl?'right':'left',writingDirection:rtl?'rtl':'ltr'} as const;
 const app=useApp(),text=typeof app.draft.text==='string'?app.draft.text:'',rules=Array.isArray(app.draft.rules)?app.draft.rules as unknown as ScreeningRule[]:[],rulesKey=JSON.stringify(rules),snapshot=text+'\u0000'+rulesKey,path=usePathname();
 const [editor,setEditor]=useState(false),[editText,setEditText]=useState(''),[selected,setSelected]=useState<{snapshot:string;id:string}|null>(null),[notes,setNotes]=useState<{snapshot:string;values:Record<string,string>}>({snapshot:'',values:{}}),[hash,setHash]=useState<{text:string;value:string}|null>(null),[imported,setImported]=useState<Imported|null>(null),[busyState,setBusyState]=useState<{api:AgentAPI|null;value:boolean}>({api:null,value:false}),[error,setError]=useState(''),[warnings,setWarnings]=useState<string[]>([]),[analysisOpen,setAnalysisOpen]=useState(false),[findingsLimit,setFindingsLimit]=useState(25),[panel]=useState(()=>new Animated.Value(0));
 const busy=busyState.api===app.api&&busyState.value,setBusy=(value:boolean)=>setBusyState({api:app.api,value});
 const abort=useRef<AbortController|null>(null);
 const revision=useRef(0),list=useRef<FlatList<ReturnType<typeof documentBlocks>[number]>>(null),pending=useRef<{payload:string;key:string}|null>(null),gate=useMemo(()=>operationGate(),[]),reduced=useReducedMotion(),scriptFont=useScriptFont(text),editFont=useScriptFont(editText);
 useEffect(()=>{const id=++revision.current;return()=>{revision.current=id+1;abort.current?.abort()}},[app.api]);
 useEffect(()=>{let active=true;Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,text).then(value=>{if(active)setHash({text,value})}).catch(()=>{if(active)setError('The current document fingerprint could not be computed.')});return()=>{active=false}},[text]);
 const review=useMemo(()=>{try{return {value:inspectClauses(text,rules),error:''}}catch(e){return {value:null,error:e instanceof Error?e.message:'Check the screening rules.'}}},[text,rulesKey]); // eslint-disable-line react-hooks/exhaustive-deps
 const blocks=useMemo(()=>documentBlocks(text),[text]),hit=selected?.snapshot===snapshot?review.value?.hits.find(x=>x.id===selected.id):undefined,activeNotes=notes.snapshot===snapshot?notes.values:{},fingerprint=hash?.text===text?hash.value:null,currentImport=imported?.api===app.api?imported:null;
 const matchingRun=app.run?.agent==='himayah'&&app.run.input.text===text&&JSON.stringify(app.run.input.rules)===rulesKey?app.run:null;
 const modelResult=matchingRun?.status==='completed'&&matchingRun.result?.analysis.input_text_sha256===fingerprint?matchingRun.result:null;
 useEffect(()=>{panel.stopAnimation();if(!hit)return;if(reduced){panel.setValue(1);return}panel.setValue(0);const spring=Animated.spring(panel,{toValue:1,damping:24,stiffness:240,mass:.8,useNativeDriver:Platform.OS!=='web'});spring.start();return()=>spring.stop()},[hit?.id,reduced,panel]); // eslint-disable-line react-hooks/exhaustive-deps
 function choose(h:ClauseHit){setSelected({snapshot,id:h.id})}
 async function pick(){
  if(!app.api){router.push('/connect');return}const scope=revision.current,lease=gate.acquire(scope);if(!lease)return;setBusy(true);setError('');const api=app.api,controller=new AbortController();abort.current=controller;let cache:File|undefined;let blob:string|undefined;
  try{
   const picked=await DocumentPicker.getDocumentAsync({type:'application/pdf',copyToCacheDirectory:true,multiple:false,base64:true});if(picked.canceled||revision.current!==scope)return;
   const asset=picked.assets[0];if(!/\.pdf$/i.test(asset.name))throw Error('Choose a PDF file for the document inspector.');if(Platform.OS==='web'&&asset.uri.startsWith('blob:'))blob=asset.uri;
   const base64=await pickedFileBase64(asset,Platform.OS,async uri=>{cache=new File(uri);return cache.base64()});if(revision.current!==scope)return;
   const preview=await api.preview(asset.name,base64,controller.signal);if(revision.current!==scope)return;if(preview.text.length>100000)throw Error('This PDF exceeds the 100,000 text-unit inspector limit. Use an authorized shorter extract.');
   const saved=await api.addDocument('himayah',asset.name,preview.text,'User-selected PDF','',{filename:asset.name,base64},controller.signal);if(revision.current!==scope)return;
   const documents=await api.documents('himayah',controller.signal);if(revision.current!==scope)return;const document=documents.documents.find(doc=>doc.id===saved.id);if(!document?.import_provenance)throw Error('The PDF was saved, but its import receipt could not be loaded. Reopen the evidence library to inspect it.');
   if(!app.commitDraft(app.draft,{...app.draft,text:preview.text}))throw Error('The PDF was saved, but your case changed while importing. Your newer edits were preserved; reimport to replace them.');setImported({api,document,originalText:preview.text});setWarnings(preview.warnings);app.setExample(false);setSelected(null);setEditor(false);
  }catch(e){if(revision.current===scope)setError(e instanceof Error?e.message:'PDF import failed.')}
  finally{try{if(blob)URL.revokeObjectURL(blob);if(cache?.exists&&cache.uri.startsWith(Paths.cache.uri))cache.delete()}catch{if(revision.current===scope)setError(previous=>previous||'Could not remove temporary import resources.')}finally{if(gate.release(lease)&&revision.current===scope)setBusy(false)}}
 }
 async function analyze(){
  if(!app.api){router.push('/connect');return}const scope=revision.current,lease=gate.acquire(scope);if(!lease)return;const issue=inputIssue(app.draft,spec.schema);if(issue||!text.trim()){gate.release(lease);setError(issue||'Add document text first.');return}setBusy(true);setError('');
  try{const payload=JSON.stringify(app.draft);if(pending.current?.payload!==payload)pending.current={payload,key:Crypto.randomUUID()};const run=await app.api.start('himayah',spec.goal,app.draft,'team',app.example,pending.current!.key);if(revision.current===scope){pending.current=null;app.setRun(run);setAnalysisOpen(true)}}catch(e){if(revision.current===scope)setError(e instanceof Error?e.message:'Analysis could not start.')}finally{if(gate.release(lease)&&revision.current===scope)setBusy(false)}
 }
 async function exportReview(){
  if(!review.value||!fingerprint)return;const scope=revision.current,lease=gate.acquire(scope);if(!lease)return;setBusy(true);setError('');let file:TemporaryReport|undefined;
  try{const source=currentImport?.document.import_provenance;const md=inspectionMarkdown(text,fingerprint,review.value,activeNotes,source?{filename:source.filename,rawSha256:source.raw_sha256,extractedSha256:source.extracted_text_sha256,documentId:currentImport!.document.id}:{});
   if(Platform.OS==='web'){downloadText(md,'himayah-inspection.md','text/markdown;charset=utf-8')}else{file=temporaryReportFile('himayah-inspection','md');file.create();file.write(md);const available=await Sharing.isAvailableAsync();if(revision.current!==scope)return;if(!available)throw Error('Sharing is unavailable on this device.');await Sharing.shareAsync(file.uri,{mimeType:'text/markdown',dialogTitle:'Export document annotations'})}
  }catch(e){if(revision.current===scope)setError(e instanceof Error?e.message:'Annotation export failed.')}finally{const cleaned=cleanupTemporaryReport(file);if(gate.release(lease)&&revision.current===scope){if(!cleaned)setError(previous=>previous||'Could not remove the temporary report file.');setBusy(false)}}
 }
 function renderBlock(block:ReturnType<typeof documentBlocks>[number]){
  const chars=Array.from(block.text),ranges=review.value?.hits.filter(h=>h.start<block.end&&h.end>block.start)||[];const cuts=[...new Set([block.start,block.end,...ranges.flatMap(h=>[Math.max(block.start,h.start),Math.min(block.end,h.end)])])].sort((a,b)=>a-b);
  return <View style={{paddingHorizontal:24,paddingVertical:16,borderLeftWidth:2,borderColor:d.line,marginHorizontal:12}}><Text selectable={!ranges.length} style={{fontFamily:scriptFont,color:d.ink,fontSize:18,lineHeight:30,writingDirection:'auto'}}>{cuts.slice(0,-1).map((start,i)=>{const end=cuts[i+1],matches=ranges.filter(h=>h.start<end&&h.end>start),content=chars.slice(start-block.start,end-block.start).join('');return matches.length?<Text key={start} accessibilityRole="button" accessibilityLabel={'Inspect '+matches.map(h=>h.rule).join(', ')} onPress={()=>choose(matches[0])} style={{backgroundColor:d.accent,color:d.bg,textDecorationLine:'underline'}}>{content}</Text>:<Text key={start}>{content}</Text>})}</Text></View>;
 }
 return <FocusScreen route="workbench" style={[s.screen,{direction:rtl?'rtl':'ltr'}]} edges={screenEdges}>
  <View style={{padding:18,gap:10,borderBottomWidth:1,borderColor:d.line}}><Text style={s.tag}>{t("HIMAYAH / DOCUMENT INSPECTOR")}</Text><Text style={[s.h2,rtlText]}>{currentImport?.document.title||t("Your document, in focus.")}</Text><View style={s.row}><Button secondary title={app.api?t("Import PDF"):t("Connect PDF extraction")} busy={busy} onPress={pick}/><Button secondary title={text?t("Edit text"):t("Paste text")} onPress={()=>{setEditText(text);setEditor(true)}}/><Button secondary title={t("Screening rules")} onPress={()=>router.push('/mission')}/></View>{!!error&&<Text role="alert" style={s.error}>{error}</Text>}{!!review.error&&<Text role="alert" style={s.error}>{review.error}</Text>}{warnings.map((w,i)=><Text key={i} style={[s.muted,rtlText]}>{w}</Text>)}{currentImport&&<Text style={[s.muted,rtlText]}>{text===currentImport.originalText?'Extracted PDF text · import receipt saved':'Edited text · original PDF receipt retained separately'}. File authenticity is not verified.</Text>}{fingerprint&&!!text&&<Text selectable style={s.code}>Text {fingerprint.slice(0,16)} · Unicode offsets</Text>}</View>
  {text?<FlatList ref={list} data={blocks} keyExtractor={x=>String(x.index)} renderItem={({item})=>renderBlock(item)} style={{flex:1}} initialNumToRender={3} windowSize={5} ListFooterComponent={<View style={{padding:24,gap:12}}><InteractiveRecords/><Text style={[s.h3,rtlText]}>{t("Findings index")}</Text><Text style={[s.muted,rtlText]}>{t("Each entry is a supplied phrase rule, not a legal verdict.")}</Text>{review.value?.findings.slice(0,findingsLimit).map(f=><View key={f.ruleIndex} style={{borderTopWidth:1,borderColor:d.line,paddingVertical:12,gap:10}}><Text style={s.text}>{f.label}: {f.found?t("literal match found"):t("no literal match")}</Text>{f.hits.slice(0,3).map(h=><Button secondary key={h.id} title={'Inspect '+f.label+' · '+h.start} onPress={()=>choose(h)}/>)}{f.truncated&&<Text style={[s.muted,rtlText]}>{t("Match display limit reached; export retains the same bounded screening scope.")}</Text>}</View>)}{review.value&&review.value.findings.length>findingsLimit&&<Button secondary title={t("Show more rule findings")} onPress={()=>setFindingsLimit(n=>n+25)}/>}<Text style={[s.muted,rtlText]}>{t("Up to three match shortcuts per rule; Next finding in the overlay visits every recorded match.")}</Text>{!rules.length&&<Button secondary title={t("Add your screening rules")} onPress={()=>router.push('/mission')}/>}</View>}/>:<View style={{flex:1,padding:28,justifyContent:'center',gap:20}}><Text style={[s.title,rtlText]}>{t("Start with the document.")}</Text><Text style={s.text}>{t("Paste authorized text to inspect it locally, or connect your extraction service to import a text PDF. Highlights follow the exact phrases you define.")}</Text></View>}
  <View style={{padding:16,gap:10,borderTopWidth:1,borderColor:d.line}}><Button title={t("Export annotations")} disabled={!text||!fingerprint||!review.value} busy={busy} onPress={exportReview}/>{!!text&&<Button secondary title={t("Analyze with the agent team")} disabled={!providerStatus(app.config).canAttempt||!app.config?.langgraph_available} onPress={analyze}/>}<Button secondary title={t("Open recorded analysis")} disabled={!matchingRun} onPress={()=>setAnalysisOpen(true)}/></View>
  <Modal visible={!!hit} transparent animationType="none" onRequestClose={()=>setSelected(null)}><View style={{flex:1,justifyContent:'flex-end',backgroundColor:'#00000088'}}><Animated.View style={{maxHeight:'85%',backgroundColor:d.bg,opacity:panel,transform:[{translateY:panel.interpolate({inputRange:[0,1],outputRange:[35,0]})}]}}><SafeAreaView edges={['bottom']}><ScrollView contentContainerStyle={{padding:24,gap:18}}>{hit&&<><Text style={s.tag}>CONTEXTUAL CLAUSE / {hit.start}–{hit.end}</Text><Text style={s.h2}>{hit.rule}</Text><Text selectable style={s.text}>{hit.quote}</Text><Text style={[s.muted,rtlText]}>{t("This is a literal match in your current document. Regulatory support is shown only in a separately recorded matching analysis.")}</Text><TextInput accessibilityLabel={t("Clause annotation")} multiline maxLength={4000} value={activeNotes[hit.id]||''} onChangeText={value=>setNotes(old=>({snapshot,values:{...(old.snapshot===snapshot?old.values:{}),[hit.id]:value}}))} style={[s.input,{minHeight:100}]} placeholder={t("Your annotation")} placeholderTextColor={d.muted}/><View style={s.row}>{review.value!.hits.length>1&&<Button secondary title={t("Next finding")} onPress={()=>{const hits=review.value!.hits,index=hits.findIndex(x=>x.id===hit.id);choose(hits[(index+1)%hits.length])}}/>}<Button title={t("Back to the document")} onPress={()=>setSelected(null)}/></View></>}</ScrollView></SafeAreaView></Animated.View></View></Modal>
  <Modal visible={editor} animationType={reduced?'none':'slide'} onRequestClose={()=>setEditor(false)}><SafeAreaView style={s.screen}><View style={{flex:1,padding:24,gap:18}}><Text style={s.h2}>{t("Authorized document text")}</Text><TextInput accessibilityLabel={t("Document inspector text")} multiline maxLength={100000} value={editText} onChangeText={setEditText} style={[s.input,{flex:1,textAlignVertical:'top',fontFamily:editFont}]} placeholderTextColor={d.muted}/><Button title={t("Use this document text")} onPress={()=>{app.setDraft(old=>({...old,text:editText}));setEditor(false);setSelected(null)}}/><Button secondary title={t("Cancel text edit")} onPress={()=>setEditor(false)}/></View></SafeAreaView></Modal>
  <Modal visible={analysisOpen} animationType={reduced?'none':'slide'} onRequestClose={()=>setAnalysisOpen(false)}><SafeAreaView style={s.screen}><ScrollView contentContainerStyle={{padding:24,gap:20}}><Text style={s.h2}>{t("Recorded document analysis")}</Text>{analysisOpen&&matchingRun&&app.api&&path.endsWith('/workbench')&&<RunView api={app.api} initial={matchingRun} onUpdate={app.setRun}/>}<Text style={[s.h3,rtlText]}>{t("Traceable retrieved claims")}</Text>{modelResult?<ClaimEvidence result={modelResult}/>:<Text style={[s.muted,rtlText]}>{t("No completed analysis with this exact current document and rules has been recorded here.")}</Text>}<Button title={t("Return to the inspector")} onPress={()=>setAnalysisOpen(false)}/></ScrollView></SafeAreaView></Modal>
 </FocusScreen>;
}
