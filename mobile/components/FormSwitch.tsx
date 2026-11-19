import React from 'react';
import {Platform,Pressable,Switch,View} from 'react-native';
import {colors} from '../src/theme';
/** Keep native Switch props off DOM hosts. Web exposes state through ARIA. */
export function FormSwitch({label,value,onChange}:{label:string;value:boolean;onChange:(value:boolean)=>void}){
 if(Platform.OS!=='web')return <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{true:colors.accent,false:colors.line}}/>;
 return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{checked:value}} onPress={()=>onChange(!value)} style={{minWidth:52,minHeight:44,justifyContent:'center',alignItems:'center'}}><View style={{width:48,height:28,padding:3,borderRadius:16,backgroundColor:value?colors.accent:colors.line,alignItems:value?'flex-end':'flex-start'}}><View style={{height:22,width:22,borderRadius:11,backgroundColor:'#FFFFFF'}}/></View></Pressable>;
}
