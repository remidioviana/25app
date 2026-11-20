import React from 'react';
import {Platform,Switch} from 'react-native';
import {colors} from '../src/theme';
/** Web uses valid boolean DOM attributes and built-in keyboard/focus semantics. */
export function FormSwitch({label,value,onChange,disabled=false}:{label:string;value:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
 if(Platform.OS!=='web')return <Switch disabled={disabled} accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{true:colors.accent,false:colors.line}}/>;
 return <label style={{display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:52,minHeight:44,opacity:disabled?0.5:1,cursor:'pointer'}}><input type="checkbox" role="switch" disabled={disabled} aria-label={label} checked={value} onChange={event=>onChange(event.currentTarget.checked)} style={{appearance:'none',width:48,height:28,margin:0,borderRadius:16,cursor:'pointer',backgroundColor:value?colors.accent:colors.line,backgroundImage:`radial-gradient(circle at ${value?34:14}px 14px, white 0 10px, transparent 11px)`}}/></label>;
}
