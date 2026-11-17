import React from 'react';
import {View,Platform,type ViewProps} from 'react-native';
import {GlassView} from 'expo-glass-effect';
import {useNavigationMaterial} from '../src/experience/MaterialProvider';
import {experience as d} from '../src/theme';
/** Control layer only. Solid Android/Web surfaces use the same layout and children. */
export function NavigationMaterial({style,...props}:ViewProps){
 const material=useNavigationMaterial();
 if(material==='native-glass')return <GlassView {...props} glassEffectStyle="regular" colorScheme={d.dark?'dark':'light'} tintColor={d.bg} style={[style,{backgroundColor:'transparent'}]}/>;
 return <View {...props} style={[style,{backgroundColor:d.panel,borderColor:d.line,borderWidth:1,...(Platform.OS==='android'?{elevation:8}:{})}]}/>;
}
