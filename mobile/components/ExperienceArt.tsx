import React,{useState} from 'react';
import {View,Image} from 'react-native';
import {brandId,brand} from '../src/brand';
import {designs} from '../src/experience/designs';
const d=designs[brandId];
const ids=Object.keys(designs);const number=ids.indexOf(brandId);
export function ExperienceArt({height=210,round=0}:{height?:number;round?:number}){
 const [width,setWidth]=useState(350);return <View accessibilityRole="image" accessibilityLabel={brand.name+' editorial illustration'} onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{height,overflow:'hidden',borderRadius:round,backgroundColor:d.panel}}><Image source={require('../assets/experience/editorial-atlas.png')} resizeMode="stretch" style={{position:'absolute',width:width*5,height:width*5,left:-(number%5)*width,top:-Math.floor(number/5)*width-(width-height)/2}}/></View>;
}
