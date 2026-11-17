import {StyleSheet} from 'react-native';
import {brandId} from './brand';
import {designs} from './experience/designs';
export const experience=designs[brandId];
export const screenEdges:('top'|'bottom')[]=experience.navigation==='drawer'||experience.navigation==='segmented'?[]:['top'];
export const colors={bg:experience.bg,panel:experience.panel,line:experience.line,accent:experience.accent,text:experience.ink,muted:experience.muted,error:experience.dark?'#FFB4A7':'#B42318'};
const rgb=experience.accent.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
export const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.bg},scroll:{padding:20,paddingBottom:32,gap:14},row:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'},
 top:{paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderColor:colors.line,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 title:{fontSize:30,lineHeight:35,fontWeight:'800',color:colors.text,letterSpacing:-.7},h2:{fontSize:21,fontWeight:'700',color:colors.text},h3:{fontSize:16,fontWeight:'700',color:colors.text},
 text:{color:colors.text,fontSize:15,lineHeight:23},muted:{color:colors.muted,fontSize:13,lineHeight:20},label:{color:colors.muted,fontSize:13,marginTop:10,marginBottom:6},
 card:{borderWidth:1,borderColor:colors.line,backgroundColor:colors.panel,borderRadius:experience.radius,padding:18,marginVertical:5,gap:12},
 input:{backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line,borderRadius:12,padding:13,color:colors.text,fontSize:16,minHeight:48},
 button:{backgroundColor:colors.accent,borderRadius:experience.radius,paddingHorizontal:17,paddingVertical:14,minHeight:48,alignItems:'center',justifyContent:'center'},buttonText:{color:luminance>.179?'#101B16':'#FFFFFF',fontWeight:'700',fontSize:14},
 secondary:{backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line},secondaryText:{color:colors.text},disabled:{opacity:.45},
 notice:{borderLeftWidth:3,borderLeftColor:colors.accent,padding:13,backgroundColor:colors.panel,borderRadius:10,gap:7},error:{color:colors.error,fontSize:13,lineHeight:20},
 tag:{color:colors.muted,fontSize:11,fontWeight:'700',letterSpacing:1,textTransform:'uppercase'},tab:{padding:12,borderBottomWidth:2,borderColor:'transparent'},activeTab:{borderColor:colors.accent},
 group:{borderWidth:1,borderColor:colors.line,borderRadius:12,padding:12,marginVertical:6},separator:{height:1,backgroundColor:colors.line,marginVertical:12},
 code:{fontFamily:'monospace',fontSize:12,lineHeight:19,color:colors.muted},smallButton:{padding:8},value:{color:colors.accent,fontWeight:'700',fontSize:14},
});
