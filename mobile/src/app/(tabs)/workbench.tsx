import {InteractiveRecords} from '../../../components/InteractiveRecords';
import {MunagasahDesk} from '../../../components/MunagasahDesk';
import {HimayahInspector} from '../../../components/HimayahInspector';
import {NafasExperience} from '../../../components/NafasExperience';
import React from 'react';
import {ScrollView,Text,View} from 'react-native';
import {router} from 'expo-router';
import {FocusScreen} from '../../../components/FocusScreen';
import {BrandSignature} from '../../../components/BrandSignature';
import {DomainExperience} from '../../../components/DomainExperience';
import {DataForm} from '../../../components/DataForm';
import {BreathingPause} from '../../../components/BreathingPause';
import {WorldClock} from '../../../components/WorldClock';
import {Button} from '../../../components/Controls';
import {useApp,spec} from '../../AppState';
import {brandId} from '../../brand';
import {styles as s,screenEdges,experience as d} from '../../theme';
import {ExperienceTitle} from '../../experience/TypefaceProvider';
import {caseInputIssue} from '../../experience/readiness';
import {inputIssue} from '../../validateInput';
import {inputLabel} from '../../forms';
import workbenches from '../../experience/workbenches.json';
/** Product-specific existing deterministic tools; no model/provider call is made here. */
function Workbench(){
 const app=useApp(),w=workbenches[brandId],ready=app.hasInputs&&!caseInputIssue(brandId,app.draft)&&!inputIssue(app.draft,spec.schema);
 if(brandId==='munagasah'&&ready)return <FocusScreen route="workbench" style={s.screen} edges={screenEdges}><ScrollView contentContainerStyle={{padding:22,paddingBottom:36}} keyboardShouldPersistTaps="handled"><InteractiveRecords/><MunagasahDesk input={app.draft} onChange={next=>app.setDraft({...next})}/></ScrollView></FocusScreen>;
 return <FocusScreen route="workbench" style={s.screen} edges={screenEdges}><ScrollView contentContainerStyle={{padding:22,paddingBottom:36,gap:24}} keyboardShouldPersistTaps="handled"><BrandSignature/><ExperienceTitle>{w.title}</ExperienceTitle><Text style={s.text}>{w.purpose}</Text>{brandId==='nafas'&&!ready&&<BreathingPause/>}{brandId==='rafiq'&&<WorldClock/>}{ready?<><Text style={s.tag}>Interactive tools · entered records</Text><DomainExperience/></>:<View style={{gap:22,borderTopWidth:2,borderColor:d.accent,paddingTop:20}}>{w.fields.map(key=><DataForm key={key} label={inputLabel(key)} schema={spec.schema.properties![key]} value={app.draft[key]} onChange={value=>app.setDraft(old=>({...old,[key]:value}))}/>)}<Text style={s.muted}>Add the remaining case details to use the complete tool. Entered values are kept when moving between screens.</Text></View>}<Button secondary title={'Open '+d.tabs[1].toLowerCase()} onPress={()=>router.push('/mission')}/><Text style={s.muted}>Device-side tools use entered records. They do not call a model, read a live account or perform external actions.</Text></ScrollView></FocusScreen>;
}

export default function ProductScreen(){const {workspaceEpoch}=useApp();return brandId==='himayah'?<HimayahInspector key={workspaceEpoch}/>:brandId==='nafas'?<NafasExperience screen='breathing'/>:<Workbench key={workspaceEpoch}/>}
