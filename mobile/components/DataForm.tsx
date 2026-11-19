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
import identities from '../src/experience/identities.json';
export function DataForm({value,schema,onChange,label='Data'}:{value:Json;schema:Schema;onChange:(v:Json)=>void;label?:string}){
 const scriptFont=useScriptFont(typeof value==='string'?value:'');
 const [expanded,setExpanded]=useState(true),[newKey,setNewKey]=useState(''),[keyError,setKeyError]=useState('');
 const categoryFont=useScriptFont(newKey);
 if(Array.isArray(value))return <View style={s.group}><Pressable accessibilityRole="button" accessibilityState={{expanded}} style={{minHeight:48,justifyContent:'center'}} onPress={()=>setExpanded(!expanded)}><Text style={s.h3}>{label} ({value.length}) {expanded?'−':'+'}</Text></Pressable>{expanded&&<>{value.map((item,i)=><View key={i} style={s.group}><DataForm value={item} schema={schema.items!} label={`Item ${i+1}`} onChange={v=>onChange(value.map((x,j)=>j===i?v:x))}/><Button secondary title="Remove item" onPress={()=>onChange(value.filter((_,j)=>j!==i))}/></View>)}<Button secondary title="Add item" onPress={()=>onChange([...value,blank(schema.items!)])}/></>}</View>;
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)&&typeof schema.additionalProperties==='object'&&!schema.properties){
  const itemSchema=schema.additionalProperties;
  return <View style={s.group}><Text style={s.h3}>{label}</Text>{Object.entries(value).map(([key,v])=><View key={key} style={{gap:8,paddingVertical:10}}><DataForm label={key} value={v} schema={itemSchema} onChange={next=>onChange({...value,[key]:next})}/><Button secondary title={'Remove '+key} onPress={()=>onChange(removeMapEntry(value,key))}/></View>)}<TextInput accessibilityLabel={'New '+label.toLowerCase()+' category'} style={[s.input,{fontFamily:categoryFont,fontSize:categoryFont?identities[brandId].arabic_input_size:16,writingDirection:'auto'}]} value={newKey} onChangeText={setNewKey} placeholder="Category name" placeholderTextColor={colors.muted}/>{!!keyError&&<Text role="alert" style={s.error}>{keyError}</Text>}<Button secondary title="Add category" onPress={()=>{try{onChange(addMapEntry(value,newKey,itemSchema));setNewKey('');setKeyError('')}catch(e){setKeyError(e instanceof Error?e.message:'Could not add the category.')}}}/></View>;
 }
 if(value!==null&&typeof value==='object')return <View>{Object.entries(value).map(([key,v])=><DataForm key={key} value={v} schema={schema.properties?.[key]||(typeof schema.additionalProperties==='object'?schema.additionalProperties:{type:'string'})} label={inputLabel(key)} onChange={next=>onChange({...value,[key]:next})}/>)}</View>;
 if(schema.type==='boolean'||typeof value==='boolean'||value===null&&Array.isArray(schema.type)&&schema.type.includes('boolean'))return <View style={[s.row,{marginVertical:8}]}><Text style={[s.text,{flex:1}]}>{label}{value===null?' · not provided':''}</Text><FormSwitch label={label+(value===null?' · not provided':'')} value={value===true} onChange={onChange}/>{value===null&&<Button secondary title="Set no" onPress={()=>onChange(false)}/>}<Button secondary title="Clear answer" onPress={()=>onChange(null)}/></View>;
 const numeric=schema.type==='number'||schema.type==='integer';
 return <View><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={String(value??'')} onChangeText={text=>onChange(numeric?numericInput(text):text)} keyboardType={numeric?'decimal-pad':'default'} multiline={!numeric&&String(value??'').length>100} autoCapitalize="none" style={[s.input,{fontFamily:scriptFont,fontSize:scriptFont?identities[brandId].arabic_input_size:16,writingDirection:'auto'}]} placeholderTextColor={colors.muted}/></View>;
}
