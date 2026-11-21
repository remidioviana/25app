import React from 'react';
import {StyleSheet,View,Text} from 'react-native';
import {brand,brandId} from '../src/brand';
import {colors,experience as d} from '../src/theme';
import {useHimayahLanguage} from '../src/experience/HimayahLanguage';
import {himayahNavigation} from '../src/experience/himayahNavigation';
/** The 3D brand asset is reserved for the launcher, splash and presentation. */
export function BrandSignature(){
 const {language}=useHimayahLanguage();
 const localized=brandId==='himayah'?himayahNavigation[language]:null;
 const rtl=!!localized&&language==='ar';
 const name=localized?.name??brand.name;
 const kicker=localized?.kicker??(d.kicker||brand.name.toUpperCase());
 const aligned=rtl?{textAlign:'right' as const,writingDirection:'rtl' as const}:undefined;
 return (
  <View accessible accessibilityRole="header" accessibilityLabel={name} style={[v.header,rtl&&{direction:'rtl'}]}>
   <View style={v.copy}>
    <Text style={[v.kicker,aligned]}>{kicker}</Text>
    <Text style={[v.title,aligned]}>{name}</Text>
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
