import React,{useState} from 'react';
import {Pressable,Text,View,ActivityIndicator,Animated,Platform} from 'react-native';
import {styles as s,colors,experience} from '../src/theme';
import {useReducedMotion} from '../src/experience/useReducedMotion';
export function Button({title,onPress,secondary=false,disabled=false,busy=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;busy?:boolean}){
 const [scale]=useState(()=>new Animated.Value(1)),reduced=useReducedMotion();
 function feedback(value:number){if(reduced){scale.setValue(1);return}if((disabled||busy)&&value!==1)return;Animated.timing(scale,{toValue:value,duration:value===1?experience.motion_ms/2:70,useNativeDriver:Platform.OS!=='web'}).start()}
 return <Animated.View style={{transform:[{scale}]}}><Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled:disabled||busy,busy}} disabled={disabled||busy} onPress={onPress} onPressIn={()=>feedback(.985)} onPressOut={()=>feedback(1)} style={[s.button,secondary&&s.secondary,(disabled||busy)&&s.disabled]}>{busy?<ActivityIndicator color={colors.text}/>:<Text style={[s.buttonText,secondary&&s.secondaryText]}>{title}</Text>}</Pressable></Animated.View>
}
export function Notice({children}:{children:React.ReactNode}){return <View style={s.notice}>{children}</View>}
