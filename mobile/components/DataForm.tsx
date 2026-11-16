import React,{useState} from 'react';
import {View,Text,TextInput,Switch,Pressable} from 'react-native';
import {styles as s,colors} from '../src/theme';
import {blank,inputLabel} from '../src/forms';
import type {Json,Schema} from '../src/types';
import {Button} from './Controls';
export function DataForm({value,schema,onChange,label='Data'}:{value:Json;schema:Schema;onChange:(v:Json)=>void;label?:string}){
 const [expanded,setExpanded]=useState(true);
 if(Array.isArray(value))return <View style={s.group}><Pressable accessibilityRole="button" onPress={()=>setExpanded(!expanded)}><Text style={s.h3}>{label} ({value.length}) {expanded?'−':'+'}</Text></Pressable>{expanded&&<>{value.map((item,i)=><View key={i} style={s.group}><DataForm value={item} schema={schema.items!} label={`Item ${i+1}`} onChange={v=>onChange(value.map((x,j)=>j===i?v:x))}/><Button secondary title="Remove item" onPress={()=>onChange(value.filter((_,j)=>j!==i))}/></View>)}<Button secondary title="Add item" onPress={()=>onChange([...value,blank(schema.items!)])}/></>}</View>;
 if(value!==null&&typeof value==='object')return <View>{Object.entries(value).map(([key,v])=><DataForm key={key} value={v} schema={schema.properties?.[key]||(typeof schema.additionalProperties==='object'?schema.additionalProperties:{type:'string'})} label={inputLabel(key)} onChange={next=>onChange({...value,[key]:next})}/>)}</View>;
 if(schema.type==='boolean'||typeof value==='boolean'||value===null&&Array.isArray(schema.type)&&schema.type.includes('boolean'))return <View style={[s.row,{marginVertical:8}]}><Text style={[s.text,{flex:1}]}>{label}{value===null?' · not provided':''}</Text><Switch accessibilityLabel={label+(value===null?' · not provided':'')} value={value===true} onValueChange={onChange} trackColor={{true:colors.accent,false:colors.line}}/>{value===null&&<Button secondary title="Set no" onPress={()=>onChange(false)}/>}<Button secondary title="Clear answer" onPress={()=>onChange(null)}/></View>;
 const numeric=schema.type==='number'||schema.type==='integer';
 return <View><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={String(value??'')} onChangeText={text=>onChange(numeric?(text===''?null:Number(text.replace(',','.'))):text)} keyboardType={numeric?'decimal-pad':'default'} multiline={!numeric&&String(value??'').length>100} autoCapitalize="none" style={s.input} placeholderTextColor={colors.muted}/></View>;
}
