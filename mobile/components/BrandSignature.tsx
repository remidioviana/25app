import React from 'react';
import {StyleSheet,View,Text} from 'react-native';
import {brand} from '../src/brand';
import {colors,experience as d} from '../src/theme';
/** The 3D brand asset is reserved for the launcher, splash and presentation. */
export function BrandSignature(){
 const kicker=d.kicker||brand.name.toUpperCase();
 return (
  <View accessible accessibilityRole="header" accessibilityLabel={brand.name} style={v.header}>
   <View style={v.copy}>
    <Text style={v.kicker}>{kicker}</Text>
    <Text style={v.title}>{brand.name}</Text>
    <View style={v.tint}/>
   </View>
  </View>
 );
}

const v=StyleSheet.create({
 header:{paddingHorizontal:18,paddingVertical:10},
 copy:{flexShrink:1,minWidth:0},
 kicker:{fontSize:11,lineHeight:16,fontWeight:'800',letterSpacing:2,color:colors.accent,textTransform:'uppercase'},
 title:{fontSize:32,lineHeight:38,fontWeight:'800',color:colors.text,letterSpacing:-0.6,flexShrink:1},
 tint:{width:4,height:18,backgroundColor:colors.accent,borderRadius:2,marginTop:4},
});
