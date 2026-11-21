import React from 'react';
import {StyleSheet,View,Text,Image,useWindowDimensions} from 'react-native';
import {brand,brandId} from '../src/brand';
import {colors,experience as d} from '../src/theme';
import {premiumIcons} from '../src/experience/premiumIcons';

/** The approved mark leads the home experience; internal headers stay quiet. */
export function BrandSignature({showMark=false}:{showMark?:boolean}={}){
 const {width,fontScale}=useWindowDimensions();
 const stacked=width<350||fontScale>1.3;
 const kicker=d.kicker||brand.name.toUpperCase();
 return (
  <View accessible accessibilityRole="header" accessibilityLabel={brand.name} style={[v.header,showMark&&!stacked&&v.row]}>
   {showMark&&<Image source={premiumIcons[brandId]} style={v.mark} resizeMode="contain" accessible={false}/>}
   <View style={v.copy}>
    <Text style={v.kicker}>{kicker}</Text>
    <Text style={v.title}>{brand.name}</Text>
    <View style={v.tint}/>
   </View>
  </View>
 );
}

const v=StyleSheet.create({
 header:{paddingHorizontal:18,paddingVertical:10,gap:14},
 row:{flexDirection:'row',alignItems:'center'},
 copy:{flexShrink:1,minWidth:0},
 mark:{width:72,height:72,borderRadius:16},
 kicker:{fontSize:11,lineHeight:16,fontWeight:'800',letterSpacing:2,color:colors.accent,textTransform:'uppercase'},
 title:{fontSize:32,lineHeight:38,fontWeight:'800',color:colors.text,letterSpacing:-0.6,flexShrink:1},
 tint:{width:4,height:18,backgroundColor:colors.accent,borderRadius:2,marginTop:4},
});
