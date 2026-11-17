import React from 'react';
import {View,Text} from 'react-native';
import {experience as d,styles as s} from '../src/theme';
import type {Run} from '../src/types';
export function ExecutionMap({run}:{run:Run}){
 const groups=[{label:'Plan',phases:['planner']},{label:d.tabs[2],phases:['source_retrieved','retrieving','acting']},{label:'Final review',phases:['critic','verifying']}];
 const horizontal=d.navigation==='compact'||d.navigation==='floating';
 return <View style={{gap:14,paddingVertical:10}}><Text style={s.tag}>Execution record · {run.status}</Text><View style={{flexDirection:horizontal?'row':'column',gap:horizontal?8:0}}>{groups.map((g,i)=>{const events=run.events.filter(e=>g.phases.includes(e.phase));const last=events.at(-1);return <View key={g.label} style={{flex:horizontal?1:undefined,borderLeftWidth:horizontal?0:1,borderTopWidth:horizontal?2:0,borderColor:last?d.accent:d.line,padding:12,gap:8,backgroundColor:d.navigation==='floating'?d.panel:d.bg,borderRadius:d.navigation==='floating'?12:0}}><Text style={{fontSize:10,color:d.accent,fontWeight:'700'}}>{String(i+1).padStart(2,'0')}</Text><Text style={{fontSize:13,lineHeight:19,color:d.ink,fontWeight:'700'}}>{g.label}</Text><Text style={{fontSize:11,lineHeight:17,color:d.muted}}>{last?'Recorded '+new Date(last.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'No event recorded'}</Text></View>})}</View>{run.result&&<Text style={s.muted}>{run.result.evidence.length} retrieved passages · outcome {run.result.decision||'not recorded'}</Text>}</View>;
}
