import React from 'react';
import {StyleSheet,View,Text} from 'react-native';
import {brand} from '../src/brand';
import {colors,experience as d} from '../src/theme';
/** Clean native header (Apple HIG - Large Title + Deference):
 *  App name/title in strong native typography (~32 pt, bold), 16-20 pt side margins
 *  inside the Safe Area (FocusScreen) and just a subtle tint-color accent indicator
 *  from the variant. The large graphic mark was removed from internal screen headers;
 *  logo/icon files remain intact in mobile/assets and brand-assets for launch icon,
 *  splash screen and Pitch Decks. */
export function BrandSignature(){
 const kicker=d.kicker||brand.name.toUpperCase();
 return (
  <View accessible accessibilityRole="header" accessibilityLabel={brand.name} style={v.header}>
   <Text style={v.kicker}>{kicker}</Text>
   <Text style={v.title}>{brand.name}</Text>
   <View style={v.tint}/>
  </View>
 );
}

const v=StyleSheet.create({
 header:{paddingHorizontal:18,paddingVertical:10},
 kicker:{fontSize:11,lineHeight:16,fontWeight:'800',letterSpacing:2,color:colors.accent,textTransform:'uppercase'},
 title:{fontSize:32,lineHeight:38,fontWeight:'800',color:colors.text,letterSpacing:-0.6,flexShrink:1},
 tint:{width:4,height:18,backgroundColor:colors.accent,borderRadius:2,marginTop:4},
});