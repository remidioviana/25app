import React from 'react';
import {View,Image} from 'react-native';
import {brandId,brand} from '../src/brand';
import {designs} from '../src/experience/designs';
import {artwork} from '../src/experience/artwork';
export function ExperienceArt({height=210,round=0}:{height?:number;round?:number}){return <View style={{height,width:'100%',overflow:'hidden',borderRadius:round,backgroundColor:designs[brandId].panel}}><Image accessibilityLabel={brand.name+' original editorial illustration'} source={artwork[brandId]} resizeMode="cover" style={{width:'100%',height:'100%'}}/></View>}
