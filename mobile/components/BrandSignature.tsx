import React from 'react';
import {View,Text,Platform,type TextStyle} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {brand,brandId,brandAssets} from '../src/brand';
import {experience as d} from '../src/theme';
import {useHeadlineFont} from '../src/experience/TypefaceProvider';
import identities from '../src/experience/identities.json';
import {decorativeSvgProps} from '../src/experience/svgAccessibility';
/** Each case owns its visual grammar. Text stays native and scales with the OS. */
export function BrandSignature(){
 const family=useHeadlineFont(),id=identities[brandId];
 const mark=(size:number)=><SvgXml xml={brandAssets.logo} width={size} height={size} {...decorativeSvgProps(Platform.OS)}/>;
 const word=(text:string,style:TextStyle={})=><Text style={[{fontFamily:family,fontWeight:family?'400':'600',fontSize:id.word_size,letterSpacing:id.tracking,color:d.ink,flexShrink:1},style]}>{text}</Text>;
 const label=(text:string)=><Text style={{fontSize:11,lineHeight:17,letterSpacing:1.5,color:d.muted}}>{text}</Text>;
 let content:React.ReactNode;
 switch(brandId){
 case 'himayah':content=<View style={{borderLeftWidth:3,borderColor:d.accent,paddingLeft:16,gap:4}}>{word('himayah')}{label('THE PRIVACY DOCKET')}</View>;break;
 case 'iqamah':content=<View style={{alignItems:'center',gap:8}}>{mark(43)}{word('Iqamah')}{label('A PLACE TO BELONG')}</View>;break;
 case 'istithmar':content=<View style={{flexDirection:'row',alignItems:'flex-end',gap:10}}>{mark(48)}<View style={{flex:1}}>{label('CAPITAL / CHOICES')}{word('istithmar')}</View></View>;break;
 case 'munagasah':content=<View style={{borderTopWidth:5,borderColor:d.accent,paddingTop:11,gap:5}}><View style={{flexDirection:'row',justifyContent:'space-between'}}>{label('M / PROCUREMENT')}{mark(25)}</View>{word('MUNAGASAH',{fontSize:24,letterSpacing:1})}</View>;break;
 case 'sahil':content=<View style={{flexDirection:'row',alignItems:'center',gap:14}}>{word('sahil',{fontSize:39})}<View style={{flex:1}}>{mark(60)}</View>{label('A CLEAR\nNEXT STEP')}</View>;break;
 case 'tawteen':content=<View style={{flexDirection:'row',gap:15,alignItems:'center'}}>{mark(48)}<View>{word('TAW',{fontSize:25})}{word('TEEN',{fontSize:25})}</View><View style={{flex:1,alignItems:'flex-end'}}>{label('PEOPLE\n& POLICY')}</View></View>;break;
 case 'adl':content=<View style={{flexDirection:'row',borderBottomWidth:1,borderColor:d.ink,paddingBottom:16,alignItems:'center',gap:18}}>{word('adl',{fontSize:55})}<View style={{width:1,height:38,backgroundColor:d.accent}}/>{label('THE CASE\nCHRONICLE')}</View>;break;
 case 'tawassul':content=<View style={{gap:8}}><View style={{alignItems:'flex-end'}}>{label('GCC / BUSINESS CORRESPONDENCE')}</View><View style={{flexDirection:'row',alignItems:'center',gap:10}}>{word('tawassul')}{mark(35)}{label('B2B')}</View></View>;break;
 case 'adab':content=<View style={{alignItems:'center',borderBottomWidth:4,borderColor:d.accent,paddingBottom:10}}>{word('ADAB')}{label('LANGUAGE, CONSIDERED.')}</View>;break;
 case 'khidmah':content=<View style={{flexDirection:'row',alignItems:'center',gap:13,padding:16,borderTopLeftRadius:28,borderBottomRightRadius:28,backgroundColor:d.panel}}>{mark(43)}<View style={{flex:1}}>{word('khidmah')}{label('A HUMAN KIND OF CARE')}</View></View>;break;
 case 'jomrok':content=<View style={{borderWidth:2,borderColor:d.ink,padding:12,gap:5}}>{word('JOMROK')}{label('CROSS-BORDER / DOCUMENT CONTROL')}<View style={{height:5,backgroundColor:d.accent,marginTop:5}}/></View>;break;
 case 'khibrat':content=<View style={{flexDirection:'row',gap:14,alignItems:'center'}}><View style={{flex:1}}>{word('khibrat')}{label('EVIDENCE EARNS THE MATCH')}</View>{mark(56)}</View>;break;
 case 'majlis':content=<View style={{alignItems:'center',gap:6,paddingVertical:9}}>{label('YOU ARE WELCOME AT')}{word('Majlis')}{mark(45)}</View>;break;
 case 'rafiq':content=<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>{word('rafiq.')}<View style={{alignItems:'flex-end'}}>{mark(38)}{label('MAKE ROOM')}</View></View>;break;
 case 'sawm':content=<View style={{gap:7,alignItems:'center',paddingVertical:12}}><View style={{height:1,width:55,backgroundColor:d.accent}}/>{word('sawm')}{label('INTENTION / WORK / REST')}</View>;break;
 case 'mizan':content=<View style={{flexDirection:'row',alignItems:'center',gap:16}}>{mark(57)}<View style={{flex:1}}>{word('Mizan')}{label('WEALTH WITH INTENTION')}</View></View>;break;
 case 'thawg':content=<View style={{gap:3,borderBottomWidth:1,borderTopWidth:1,borderColor:d.accent,paddingVertical:10}}><View style={{alignItems:'flex-end'}}>{label('THE DINING EDITION')}</View>{word('Thawg',{fontSize:56})}</View>;break;
 case 'manzil':content=<View style={{paddingLeft:20,borderLeftWidth:1,borderColor:d.accent,gap:7}}>{label('THE HOUSEHOLD BOOK')}{word('Manzil')}<View style={{width:70,height:2,backgroundColor:d.accent}}/></View>;break;
 case 'gurbah':content=<View style={{flexDirection:'row',alignItems:'center',gap:12}}>{mark(45)}<View style={{flex:1}}>{word('GURBAH',{fontSize:30,letterSpacing:2})}{label('BEFORE → ARRIVAL → SETTLED')}</View></View>;break;
 case 'amanah-eco':content=<View style={{flexDirection:'row',justifyContent:'space-between',gap:14}}><View style={{flex:1}}>{word('AMANAH',{fontSize:26,letterSpacing:2.1})}{word('eco',{fontSize:46,letterSpacing:-2})}</View><View style={{alignItems:'flex-end',justifyContent:'space-between'}}>{mark(40)}{label('RESOURCE\nOBSERVATORY')}</View></View>;break;
 case 'nafas':content=<View style={{alignItems:'center',paddingVertical:12,gap:8}}>{word('nafas')}{label('ROOM TO BREATHE')}</View>;break;
 case 'tadweer':content=<View style={{flexDirection:'row',alignItems:'center',gap:18,borderBottomWidth:3,borderColor:d.accent,paddingBottom:14}}>{mark(40)}<View style={{flex:1}}>{label('MATERIAL / NEXT LIFE')}{word('tadweer')}</View></View>;break;
 case 'turath':content=<View style={{gap:10}}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>{label('THE LIVING ARCHIVE')}{mark(32)}</View>{word('Turath')}<View style={{borderBottomWidth:1,borderStyle:'dashed',borderColor:d.accent}}/></View>;break;
 case 'himam':content=<View style={{gap:12}}><View style={{flexDirection:'row',alignItems:'center',gap:14}}>{mark(48)}{word('Himam')}</View>{label('ACCESS EVIDENCE BEFORE ROUTING')}</View>;break;
 case 'hisad':content=<View style={{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:d.panel,padding:16}}><View style={{flex:1}}>{label('FOOD RESCUE / DISPATCH')}{word('HISAD')}</View>{mark(46)}</View>;break;
 }
 return <View accessible accessibilityRole="header" accessibilityLabel={brand.name} style={{marginBottom:10}}>{content}</View>;
}
