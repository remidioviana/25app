import {FormSwitch} from './FormSwitch';
import React,{useState} from 'react';
import {View,Text,TextInput,Pressable} from 'react-native';
import {styles as s,colors} from '../src/theme';
import {blank,inputLabel,addMapEntry,removeMapEntry} from '../src/forms';
import type {Json,Schema} from '../src/types';
import {Button} from './Controls';
import {useScriptFont} from '../src/experience/TypefaceProvider';
import {numericInput} from '../src/experience/numericInput';
import {brandId} from '../src/brand';
import {useHimayahWorkspaceCopy} from '../src/experience/useHimayahWorkspaceCopy';
import identities from '../src/experience/identities.json';
export function DataForm({value,schema,onChange,label='Data'}:{value:Json;schema:Schema;onChange:(v:Json)=>void;label?:string}){
 const {t,rtl,aligned,direction}=useHimayahWorkspaceCopy();
 const displayLabel=t(label);
 const notProvided=rtl?' · '+t('Not provided'):' · not provided';
 const scriptFont=useScriptFont(typeof value==='string'?value:'');
 const [expanded,setExpanded]=useState(true),[newKey,setNewKey]=useState(''),[keyError,setKeyError]=useState('');
 const categoryFont=useScriptFont(newKey);
 if(Array.isArray(value))return <View style={[s.group,direction]}><Pressable accessibilityRole="button" accessibilityState={{expanded}} style={{minHeight:48,justifyContent:'center'}} onPress={()=>setExpanded(!expanded)}><Text style={[s.h3,aligned]}>{displayLabel} ({value.length}) {expanded?'−':'+'}</Text></Pressable>{expanded&&<>{value.map((item,i)=><View key={i} style={[s.group,direction]}><DataForm value={item} schema={schema.items!} label={`${t('Item')} ${(i+1).toLocaleString(rtl?'ar-AE':'en-AE')}`} onChange={v=>onChange(value.map((x,j)=>j===i?v:x))}/><Button secondary title={t("Remove item")} onPress={()=>onChange(value.filter((_,j)=>j!==i))}/></View>)}<Button secondary title={t("Add item")} onPress={()=>onChange([...value,blank(schema.items!)])}/></>}</View>;
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)&&typeof schema.additionalProperties==='object'&&!schema.properties){
  const itemSchema=schema.additionalProperties;
  return <View style={[s.group,direction]}><Text style={[s.h3,aligned]}>{displayLabel}</Text>{Object.entries(value).map(([key,v])=><View key={key} style={{gap:8,paddingVertical:10}}><DataForm label={key} value={v} schema={itemSchema} onChange={next=>onChange({...value,[key]:next})}/><Button secondary title={'Remove '+key} onPress={()=>onChange(removeMapEntry(value,key))}/></View>)}<TextInput accessibilityLabel={'New '+label.toLowerCase()+' category'} style={[s.input,{fontFamily:categoryFont,fontSize:categoryFont?identities[brandId].arabic_input_size:16,writingDirection:'auto'}]} value={newKey} onChangeText={setNewKey} placeholder="Category name" placeholderTextColor={colors.muted}/>{!!keyError&&<Text role="alert" style={s.error}>{keyError}</Text>}<Button secondary title="Add category" onPress={()=>{try{onChange(addMapEntry(value,newKey,itemSchema));setNewKey('');setKeyError('')}catch(e){setKeyError(e instanceof Error?e.message:'Could not add the category.')}}}/></View>;
 }
 if(value!==null&&typeof value==='object')return <View>{Object.entries(value).map(([key,v])=><DataForm key={key} value={v} schema={schema.properties?.[key]||(typeof schema.additionalProperties==='object'?schema.additionalProperties:{type:'string'})} label={inputLabel(key)} onChange={next=>onChange({...value,[key]:next})}/>)}</View>;
 if(schema.type==='boolean'||typeof value==='boolean'||value===null&&Array.isArray(schema.type)&&schema.type.includes('boolean'))return <View style={[s.row,{marginVertical:8}]}><Text style={[s.text,{flex:1},aligned]}>{displayLabel}{value===null?notProvided:''}</Text><FormSwitch label={displayLabel+(value===null?notProvided:'')} value={value===true} onChange={onChange}/>{value===null&&<Button secondary title={t("Set no")} onPress={()=>onChange(false)}/>}<Button secondary title={t("Clear answer")} onPress={()=>onChange(null)}/></View>;
 const numeric=schema.type==='number'||schema.type==='integer';
 return <View><Text style={[s.label,aligned]}>{displayLabel}</Text><TextInput accessibilityLabel={displayLabel} value={String(value??'')} onChangeText={text=>onChange(numeric?numericInput(text):text)} keyboardType={numeric?'decimal-pad':'default'} multiline={!numeric&&String(value??'').length>100} autoCapitalize="none" style={[s.input,{fontFamily:scriptFont,fontSize:scriptFont?identities[brandId].arabic_input_size:16,writingDirection:'auto'},rtl?{textAlign:'right'}:undefined]} placeholderTextColor={colors.muted}/></View>;
}
