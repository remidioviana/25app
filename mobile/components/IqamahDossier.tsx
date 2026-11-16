import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {assessDossier,dossierIssue,type DocumentState} from '../src/dossier';
import {styles as s} from '../src/theme';

const labels:Record<DocumentState,string>={missing:'Missing',expired:'Recorded as expired',present_unverified:'Present · unverified'};
const tones:Record<DocumentState,string>={missing:'#8B4A00',expired:'#A02D30',present_unverified:'#526174'};

/** Native overview increment. Full 32-view browser design is not a native build. */
export function IqamahDossier({input}:{input:unknown}){
  const [selected,setSelected]=useState<string|null>(null);
  const issue=dossierIssue(input);
  if(issue)return <View style={s.notice}><Text style={s.h2}>Review your dossier inputs</Text><Text accessibilityRole="alert" style={s.error}>{issue}</Text><Text style={s.muted}>Open Mission to correct the inputs. Your draft is preserved; no eligibility result has been calculated.</Text></View>;
  const result=assessDossier(input);
  return <View style={{gap:20}}>
    <View style={{backgroundColor:'#FBF8F0',padding:22,borderRadius:16,gap:12}}>
      <Text style={{color:'#705716',fontSize:12,fontWeight:'700',letterSpacing:1.2}}>YOUR DOSSIER, IN ORDER</Text>
      <Text style={{fontSize:30,lineHeight:36,fontWeight:'600',color:'#222B36'}}>Prepare the evidence.{ '\n'}Keep the decision human.</Text>
      <Text style={{color:'#535D69',fontSize:15,lineHeight:23}}>Checked against your supplied checklist as of {result.as_of}. No visa route or legal eligibility is verified.</Text>
      <View style={{gap:8,borderTopWidth:1,borderColor:'#D9D1BD',paddingTop:14}}>
        <Text style={{color:'#8B4A00',fontSize:16,fontWeight:'600'}}>{result.counts.missing} missing</Text>
        <Text style={{color:'#A02D30',fontSize:16,fontWeight:'600'}}>{result.counts.expired} recorded as expired</Text>
        <Text style={{color:'#526174',fontSize:16,fontWeight:'600'}}>{result.counts.present_unverified} present · unverified</Text>
      </View>
    </View>
    <View style={{gap:8}}>
      <Text style={s.h2}>Document index</Text>
      <Text style={s.muted}>Names are matched exactly. A supplied reference is not proof of authenticity.</Text>
      {result.checks.map(check=><Pressable key={check.requirement} accessibilityRole="button" accessibilityLabel={`${check.requirement}: ${labels[check.status]}. Show recorded details`} accessibilityState={{expanded:selected===check.requirement}} onPress={()=>setSelected(selected===check.requirement?null:check.requirement)} style={{paddingVertical:16,minHeight:64,borderBottomWidth:1,borderColor:'#D9D1BD',gap:6}}>
        <Text style={[s.h3,{color:'#222B36'}]}>{check.requirement.replaceAll('_',' ')}</Text>
        <Text style={{color:tones[check.status],fontSize:14,lineHeight:21}}>{labels[check.status]}</Text>
        {selected===check.requirement&&<View style={{gap:6,paddingTop:6}}>
          <Text selectable style={s.text}>Reference: {check.reference||'Not supplied'}</Text>
          <Text style={s.muted}>Recorded expiry: {check.expires||'Unknown; verify with the document issuer'}</Text>
          <Text style={s.muted}>{check.status==='missing'?'Gather the item named by your selected checklist.':check.status==='expired'?'Replace or clarify the recorded document before relying on it.':'Confirm authenticity, applicability and current requirements with the appropriate official channel.'}</Text>
        </View>}
      </Pressable>)}
    </View>
    <Text style={s.muted}>This is local dossier organization. No document has been authenticated and no official application has been submitted. A blank expiry is unknown, not perpetual validity.</Text>
  </View>;
}
