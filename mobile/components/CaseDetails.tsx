import {InteractiveRecords} from './InteractiveRecords';
import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {useApp,spec} from '../src/AppState';
import {brandId} from '../src/brand';
import {experience as d,styles as s} from '../src/theme';
import {caseForms} from '../src/experience/caseForms';
import {inputLabel} from '../src/forms';
import {DataForm} from './DataForm';
import {Button} from './Controls';
/** Leaf field editing is shared; the domain chooses order, grouping and disclosure. */
export function CaseDetails(){
 const app=useApp(),form=caseForms[brandId];const [step,setStep]=useState(0),[pane,setPane]=useState(0),[detail,setDetail]=useState(false);
 const field=(key:string)=><DataForm key={key} label={inputLabel(key)} schema={spec.schema.properties![key]} value={app.draft[key]} onChange={value=>app.setDraft(old=>({...old,[key]:value}))}/>;
 const note=(text:string)=><Text style={s.muted}>{text}</Text>;
 const title=(text:string)=><Text accessibilityRole="header" style={[s.h3,{lineHeight:25}]}>{text}</Text>;
 const section=(name:string,keys:string[],kind:'plain'|'rule'|'sheet'='plain')=><View style={{gap:12,padding:kind==='sheet'?18:0,paddingTop:kind==='rule'?15:kind==='sheet'?18:0,borderTopWidth:kind==='rule'?2:0,borderColor:d.accent,backgroundColor:kind==='sheet'?d.panel:d.bg,borderRadius:kind==='sheet'?d.radius:0}}>{title(name)}{keys.map(field)}</View>;
 const panes=(labels:string[])=><View accessibilityRole="tablist" style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{labels.map((label,i)=><Pressable key={label} accessibilityRole="tab" accessibilityState={{selected:pane===i}} onPress={()=>setPane(i)} style={{minHeight:48,padding:12,borderBottomWidth:2,borderColor:pane===i?d.accent:d.line,justifyContent:'center'}}><Text style={{fontSize:14,color:pane===i?d.accent:d.muted}}>{label}</Text></Pressable>)}</View>;
 const reveal=(label:string,children:React.ReactNode)=><View style={{gap:12}}><Button secondary title={(detail?'Hide ':'Open ')+label} onPress={()=>setDetail(!detail)}/>{detail&&children}</View>;
 const journey=()=><View style={{gap:16}}><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{form.sections.map((x,i)=><Pressable key={x.title} accessibilityRole="button" accessibilityLabel={x.title} accessibilityState={{selected:step===i}} onPress={()=>setStep(i)} style={{minHeight:48,padding:12,borderBottomWidth:2,borderColor:step===i?d.accent:d.line}}><Text style={{color:step===i?d.accent:d.muted,fontSize:14}}>Step {i+1}</Text></Pressable>)}</View>{section(form.sections[step].title,form.sections[step].fields)}{step<form.sections.length-1&&<Button secondary title={'Next: '+form.sections[step+1].title} onPress={()=>setStep(step+1)}/>}</View>;
 let body:React.ReactNode;
 switch(brandId){
 case 'himayah':body=<>{section('The agreement',['text'])}<View style={{borderLeftWidth:3,borderColor:d.accent,paddingLeft:17,gap:12}}>{title('Margin instructions')}{note('Keep clause rules beside the text they govern.')}{field('rules')}</View></>;break;
 case 'iqamah':body=<>{section('Dossier reference date',['as_of'],'rule')}{panes(['Route requirements','Documents held'])}{pane===0?section('What the selected route asks for',['requirements'],'sheet'):section('The document shelf',['documents'])}{note('A listed document is not verified eligibility.')}</>;break;
 case 'istithmar':body=<>{section('The activity brief',['activity','currency'])}<View style={{borderTopWidth:1,borderBottomWidth:1,borderColor:d.accent,paddingVertical:16,gap:12}}>{title('Set the comparison horizon')}{field('years')}{field('visas')}</View>{section('Alternatives to compare',['options'])}</>;break;
 case 'munagasah':body=<>{section('Tender clock',['deadline','as_of'],'rule')}{panes(['Buyer requirements','Our evidence'])}{section(pane===0?'Requirement register':'Capability register',[pane===0?'requirements':'capabilities'],'sheet')}{note('Public procurement guidance does not replace the tender pack.')}</>;break;
 case 'sahil':body=<>{note('Start at the service checkpoint. Move between prerequisites whenever you need.')}{journey()}</>;break;
 case 'tawteen':body=<>{section('The supplied target',['target_percent'],'sheet')}{section('The people behind the calculation',['employees'],'rule')}{note('Workforce records are entered here; no payroll connection is implied.')}</>;break;
 case 'adl':body=<>{field('currency')}<View style={{borderLeftWidth:3,borderColor:d.accent,paddingLeft:20,gap:20}}>{section('01 / The event chronology',['events'])}{section('02 / Amounts being claimed',['claims'])}</View></>;break;
 case 'tawassul':body=<>{section('To: the account',['account'],'rule')}{section('What this account needs',['needs'])}{reveal('approved product facts',section('Facts we may use',['products'],'sheet'))}</>;break;
 case 'adab':body=<>{section('The original expression',['copy'])}{panes(['Claim checks','Language boundaries'])}{pane===0?section('Evidence before persuasion',['claims','approved_claims'],'rule'):section('The editorial brief',['prohibited_terms','max_characters'],'sheet')}</>;break;
 case 'khidmah':body=<>{section('Tell us what happened',['reason','purchase_date','as_of'],'sheet')}{section('The amount at issue',['amount','refund_limit'])}{reveal('merchant policy',section('Policy terms',['return_window_days','eligible_reasons'],'rule'))}</>;break;
 case 'jomrok':body=<>{section('Shipment manifest',['shipment'],'rule')}{reveal('document requirements',section('Required fields',['required_fields']))}{section('Declared valuation',['goods_value','freight','currency'],'sheet')}{section('Supplied duty assumption',['duty_rate_percent'])}</>;break;
 case 'khibrat':body=<>{note('Define the rubric before assessing candidate evidence.')}{panes(['The role rubric','Candidate evidence'])}{section(pane===0?'Competencies to substantiate':'Evidence submitted',[pane===0?'criteria':'evidence'],'rule')}</>;break;
 case 'majlis':body=<>{section('The arrival reference',['as_of'])}<View style={{borderWidth:1,borderColor:d.line,padding:22,gap:15}}>{note('THE EXECUTIVE ONBOARDING BOOK')}{field('tasks')}</View></>;break;
 case 'rafiq':body=<>{section('The edges of your day',['start','end'])}{section('Space between commitments',['buffer_minutes'],'rule')}{panes(['Committed time','Things to place'])}{field(pane===0?'busy':'tasks')}</>;break;
 case 'sawm':body=<>{section('A day with boundaries',['start','end'],'sheet')}{section('Protected commitments and rest',['busy'])}{reveal('work to arrange',section('A gentler plan',['tasks','buffer_minutes'],'rule'))}</>;break;
 case 'mizan':body=<>{field('currency')}{panes(['Whole ledger','Spending intentions','Transaction evidence'])}{pane!==2&&section('Intentional categories',['budgets'],'rule')}{pane!==1&&section('Verified records',['transactions'])}{note('Arithmetic and Islamic-finance interpretation remain separate.')}</>;break;
 case 'thawg':body=<>{section('A table for your occasion',['party_size','budget'],'rule')}{section('Non-negotiables',['required_tags'],'sheet')}{section('Places under consideration',['restaurants'])}</>;break;
 case 'manzil':body=<>{section('Bring the receipts first',['transactions'],'sheet')}{field('currency')}{reveal('the household spending plan',section('Family categories',['budgets'],'rule'))}{note('Repeated identifiers are checked when the ledger is reconciled.')}</>;break;
 case 'gurbah':body=<>{section('Where the move stands',['as_of'],'rule')}<View style={{borderLeftWidth:2,borderStyle:'dashed',borderColor:d.accent,paddingLeft:18,gap:12}}>{title('The relocation dependency map')}{field('tasks')}</View></>;break;
 case 'amanah-eco':body=<>{field('unit')}{panes(['Previous period','Current period'])}{section(pane===0?'The reference period':'The comparison period',pane===0?['previous_usage','previous_days']:['current_usage','current_days'],'sheet')}{note('The period length matters as much as the reading.')}</>;break;
 case 'nafas':body=<>{section('Practices you would like to explore',['preferred_activities'])}{reveal('a gentle routine',section('Your chosen starting point',['start_date','days'],'sheet'))}{note('You can also use the breathing pause on the opening screen without a connection.')}</>;break;
 case 'tadweer':body=<>{section('What needs its next life',['material','hazardous'],'sheet')}{section('Collection routes you can substantiate',['routes'],'rule')}{note('Material and handling constraints determine which routes can be considered.')}</>;break;
 case 'turath':body=<>{section('Open the source folios',['sources'],'rule')}{section('The stories to follow',['topics'])}{note('A learning trail can only cite material in the archive.')}</>;break;
 case 'himam':body=<>{section('Your access requirements come first',['needs'],'sheet')}{section('Routes and barrier evidence',['routes'])}{note('Missing access evidence stays unknown; it is not a safe-route guarantee.')}</>;break;
 case 'hisad':body=<>{section('Food available for rescue',['lot'],'rule')}{section('Handling reference',['as_of'])}{section('Recipient capacities',['recipients'],'sheet')}{note('Allocation depends on recorded handling conditions and actual recipient constraints.')}</>;break;
 }
 return <View style={{gap:24}}><InteractiveRecords editLink={false}/>{body}</View>;
}
