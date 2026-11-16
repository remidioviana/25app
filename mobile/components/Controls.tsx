import React from 'react';
import {Pressable,Text,View,ActivityIndicator} from 'react-native';
import {styles as s,colors} from '../src/theme';
export function Button({title,onPress,secondary=false,disabled=false,busy=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;busy?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled||busy} onPress={onPress} style={[s.button,secondary&&s.secondary,(disabled||busy)&&s.disabled]}>{busy?<ActivityIndicator color={colors.bg}/>:<Text style={[s.buttonText,secondary&&s.secondaryText]}>{title}</Text>}</Pressable>}
export function Notice({children}:{children:React.ReactNode}){return <View style={s.notice}>{children}</View>}
