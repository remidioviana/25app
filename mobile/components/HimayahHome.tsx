import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {useApp} from '../src/AppState';
import {colors,styles as s} from '../src/theme';
import {Button} from './Controls';

const copy={
 en:{name:'Himayah',title:'Your privacy docket',description:'Review the obligations in an agreement, trace the evidence and keep decisions yours.',language:'Preview language',document:'Document',rules:'Screening rules',ready:'Text added',missing:'No text added',empty:'Start a new review',resume:'Continue document review',ruleNote:'User-defined phrase rules',evidence:'Official sources',evidenceNote:'Read the published context before making a decision.',privacy:'Local phrase screening is not a legal verdict. Connected analysis requires a configured service.',scope:'English is used in the remaining workflow while full localization is in development.',next:'Your next step'},
 ar:{name:'حماية',title:'ملف مراجعة الخصوصية',description:'راجع الالتزامات في الاتفاقية، وتتبع الأدلة، واحتفظ بقرارك النهائي.',language:'لغة المعاينة',document:'المستند',rules:'قواعد الفحص',ready:'تمت إضافة النص',missing:'لم يُضف نص بعد',empty:'ابدأ مراجعة جديدة',resume:'تابع مراجعة المستند',ruleNote:'قواعد عبارات يحددها المستخدم',evidence:'المصادر الرسمية',evidenceNote:'اطلع على السياق المنشور قبل اتخاذ القرار.',privacy:'فحص العبارات محلياً ليس حكماً قانونياً. يتطلب التحليل المتصل خدمة مهيأة.',scope:'تُستخدم الإنجليزية في بقية خطوات العمل إلى حين اكتمال التعريب.',next:'خطوتك التالية'}
};

/** Task-first entry to the existing document inspector. No simulated findings. */
export function HimayahHome(){
 const {draft}=useApp();
 const [language,setLanguage]=useState<'en'|'ar'>('en');
 const rtl=language==='ar',t=copy[language];
 const direction=rtl?'rtl':'ltr';
 const align=rtl?'right':'left';
 const text=typeof draft.text==='string'?draft.text.trim():'';
 const rules=Array.isArray(draft.rules)?draft.rules.length:0;
 const aligned={textAlign:align,writingDirection:direction} as const;
 return <View style={[v.root,{direction}]}>
  <View style={v.top}>
   <Text style={[v.wordmark,aligned]}>{t.name}</Text>
   <View accessibilityLabel={t.language} style={v.language}>
    {(['en','ar'] as const).map(code=><Pressable key={code} accessibilityRole="button" accessibilityState={{selected:language===code}} onPress={()=>setLanguage(code)} style={[v.languageChoice,language===code&&v.selected]}><Text style={{color:colors.text,fontSize:14,fontWeight:language===code?'700':'400'}}>{code==='en'?'English':'العربية'}</Text></Pressable>)}
   </View>
  </View>
  <View style={v.intro}>
   <Text accessibilityRole="header" style={[v.title,aligned]}>{t.title}</Text>
   <Text style={[s.text,aligned]}>{t.description}</Text>
  </View>
  <View style={v.docket}>
   <View style={v.record}>
    <Text style={[v.label,aligned]}>{t.document}</Text>
    <Text style={[v.value,aligned]}>{text?t.ready:t.missing}</Text>
   </View>
   <View style={v.separator}/>
   <View style={v.record}>
    <Text style={[v.label,aligned]}>{t.rules}</Text>
    <Text style={[v.value,aligned]}>{rules.toLocaleString(rtl?'ar-AE':'en-AE')}</Text>
    <Text style={[s.muted,aligned]}>{t.ruleNote}</Text>
   </View>
  </View>
  <Text style={[v.label,aligned]}>{t.next}</Text>
  <Button title={text?t.resume:t.empty} onPress={()=>router.push('/workbench')}/>
  <Text style={[s.muted,aligned]}>{t.privacy}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel={t.evidence} style={v.source} onPress={()=>router.push('/evidence')}>
   <Text style={[s.h3,aligned]}>{t.evidence}</Text>
   <Text style={[s.muted,aligned]}>{t.evidenceNote}</Text>
  </Pressable>
  {rtl&&<Text style={[s.muted,aligned]}>{t.scope}</Text>}
 </View>;
}

const v=StyleSheet.create({
 root:{gap:16},top:{gap:8},wordmark:{fontSize:17,fontWeight:'700',color:colors.text},
 language:{flexDirection:'row',alignSelf:'flex-start',borderWidth:1,borderColor:colors.line,borderRadius:12},
 languageChoice:{minHeight:44,minWidth:72,paddingHorizontal:12,justifyContent:'center',alignItems:'center'},
 selected:{backgroundColor:colors.panel,borderRadius:10},
 intro:{gap:10},title:{fontSize:34,lineHeight:41,fontWeight:'700',color:colors.text,letterSpacing:-.5},
 docket:{backgroundColor:colors.panel,borderRadius:12,padding:18,gap:14},
 label:{fontSize:13,fontWeight:'600',color:colors.muted},value:{fontSize:22,fontWeight:'700',color:colors.text},
 record:{gap:4},separator:{height:1,backgroundColor:colors.line},
 source:{minHeight:48,borderTopWidth:1,borderColor:colors.line,paddingVertical:14,gap:5}
});
