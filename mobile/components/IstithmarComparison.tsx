import React,{useState} from 'react';
import {View,Text,TextInput,Pressable} from 'react-native';
import {compareSetup,setupIssue,formatCost,taxScenario} from '../src/setupComparison';
import {styles as s} from '../src/theme';

export function IstithmarComparison({input}:{input:unknown}){
  const [query,setQuery]=useState(''),[selected,setSelected]=useState<string|null>(null);
  const [income,setIncome]=useState(''),[threshold,setThreshold]=useState(''),[rate,setRate]=useState('');
  const issue=setupIssue(input);
  if(issue)return <View style={s.notice}><Text style={s.h2}>Complete your comparison inputs</Text><Text accessibilityRole="alert" style={s.error}>{issue}</Text><Text style={s.muted}>Open Mission to correct the supplied data. No cost ranking has been calculated.</Text></View>;
  const result=compareSetup(input),rows=result.comparison.filter(o=>o.name.toLowerCase().includes(query.trim().toLowerCase()));
  let tax:string|null=null,taxError='';
  if([income,threshold,rate].every(v=>v.trim()!=='')){
    if([income,threshold,rate].some(v=>!/^\d+(?:\.\d+)?$/.test(v.trim())))taxError='Use non-negative decimal values for all three assumptions.';
    else try{tax=taxScenario(Number(income),Number(threshold),Number(rate)).tax;}catch(e){taxError=e instanceof Error?e.message:'Check the scenario assumptions.';}
  }
  return <View style={{gap:20}}>
    <View style={{backgroundColor:'#EAF5F2',padding:22,borderRadius:8,gap:12}}>
      <Text style={{color:'#09675E',fontSize:12,fontWeight:'700',letterSpacing:1.1}}>THE BUSINESS SETUP DECISION ROOM</Text>
      <Text style={{color:'#172E34',fontSize:30,lineHeight:36,fontWeight:'600'}}>Compare the cost.{ '\n'}Expose the assumptions.</Text>
      <Text style={{color:'#435C63',fontSize:15,lineHeight:23}}>{result.activity} · {result.years} years · {result.visas} visas · {result.currency}</Text>
      <Text style={{color:'#435C63',fontSize:14,lineHeight:21}}>Activity matches come from supplied lists, not a verified permit decision. Costs use a two-decimal planning model.</Text>
    </View>
    <View style={{gap:8}}>
      <Text style={s.h2}>Supplied options</Text>
      <Text style={s.label}>Filter option names</Text>
      <TextInput accessibilityLabel="Filter setup option names" style={s.input} value={query} onChangeText={setQuery}/>
      {rows.length===0&&<Text style={s.muted}>No supplied option matches this filter.</Text>}
      {rows.map(o=><Pressable key={o.name} accessibilityRole="button" accessibilityLabel={`${o.name}, ${formatCost(o.total)} ${result.currency}. Show cost breakdown`} accessibilityState={{expanded:selected===o.name}} onPress={()=>setSelected(selected===o.name?null:o.name)} style={{paddingVertical:18,borderBottomWidth:1,borderColor:'#B9D1CE',gap:7,minHeight:64}}>
        <Text style={[s.h3,{color:'#172E34'}]}>{o.name}</Text>
        <Text style={{fontSize:24,lineHeight:30,color:'#09675E',fontWeight:'600'}}>{formatCost(o.total)} {result.currency}</Text>
        <Text style={{fontSize:14,lineHeight:21,color:'#435C63'}}>{o.activity_match?'Activity is listed in the supplied option':'Activity is not listed in the supplied option'}</Text>
        {selected===o.name&&<View style={{gap:6,paddingTop:6}}>
          <Text style={s.text}>One-time setup: {formatCost(o.breakdown.setup)}</Text>
          <Text style={s.text}>Recurring fees × {result.years}: {formatCost(o.breakdown.recurring)}</Text>
          <Text style={s.text}>Visa fees × {result.visas}: {formatCost(o.breakdown.visas)}</Text>
          <Text style={s.muted}>Supplied activities: {o.activities.join(', ')||'None supplied'}. Omitted costs and source dates still require review.</Text>
        </View>}
      </Pressable>)}
      <Text style={s.muted}>{result.assumptions}</Text>
    </View>
    <View style={{gap:8}}>
      <Text style={s.h2}>Tax scenario · your assumptions</Text>
      <Text style={s.muted}>A single-bracket illustration only. Enter your own assessed base, threshold and rate; no current UAE tax rule is preselected.</Text>
      <Text style={s.label}>Assumed taxable income</Text><TextInput accessibilityLabel="Assumed taxable income" keyboardType="decimal-pad" style={s.input} value={income} onChangeText={setIncome}/>
      <Text style={s.label}>Assumed threshold</Text><TextInput accessibilityLabel="Assumed threshold" keyboardType="decimal-pad" style={s.input} value={threshold} onChangeText={setThreshold}/>
      <Text style={s.label}>Assumed rate (%)</Text><TextInput accessibilityLabel="Assumed rate percent" keyboardType="decimal-pad" style={s.input} value={rate} onChangeText={setRate}/>
      {tax!==null&&<Text style={s.h2}>Scenario result: {formatCost(tax)} {result.currency}</Text>}
      {!!taxError&&<Text accessibilityRole="alert" style={s.error}>{taxError}</Text>}
      <Text style={s.muted}>Not a filing calculation. No application, payment or tax return has been submitted.</Text>
    </View>
  </View>;
}
