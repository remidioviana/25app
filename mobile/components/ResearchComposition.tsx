import React from 'react';
import {View,Text} from 'react-native';
import {brandId} from '../src/brand';
import {experience as d,styles as s} from '../src/theme';
import {ExperienceTitle} from '../src/experience/TypefaceProvider';
import {briefs} from '../src/experience/briefs';
import guides from '../src/experience/sourceGuides.json';
import {SourceBrief} from './HomeExperience';
/** Public research has no fabricated user case, metric, transaction or execution state. */
export function ResearchComposition(){
 const b=briefs[brandId],g=guides[brandId];
 const title=<ExperienceTitle style={{fontSize:29,lineHeight:36}}>{g.title.replaceAll('\n',' ')}</ExperienceTitle>;
 const observation=<Text style={s.text}>{g.meaning}</Text>,next=<Text style={s.muted}>{g.next_step}</Text>;
 const source=<SourceBrief brief={b} status="Published excerpt"/>;
 const label=(x:string)=><Text style={[s.tag,{fontSize:12,lineHeight:18}]}>{x}</Text>;
 const rule=(children:React.ReactNode)=><View style={{borderTopWidth:2,borderColor:d.accent,paddingTop:18,gap:16}}>{children}</View>;
 const sheet=(children:React.ReactNode)=><View style={{padding:20,gap:17,backgroundColor:d.panel,borderRadius:d.radius}}>{children}</View>;
 switch(brandId){
 case 'himayah':return <View style={{gap:22}}>{title}<View style={{borderLeftWidth:4,borderColor:d.accent,paddingLeft:18,gap:20}}>{label('SOURCE / CLAUSE')}{source}</View>{observation}{rule(<>{label('What to examine next')}{next}</>)}</View>;
 case 'iqamah':return <View style={{borderWidth:1,borderColor:d.accent,padding:20,gap:18}}>{label('Residency / source folio')}{title}{observation}{rule(source)}{next}</View>;
 case 'istithmar':return <View style={{gap:20}}>{label('Business setup / published basis')}{title}{sheet(<>{label('The jurisdiction context')}{observation}</>)}{rule(source)}{next}</View>;
 case 'munagasah':return <View style={{gap:20}}>{rule(<>{label('01 / Procurement channel')}{title}{observation}</>)}{rule(<>{label('02 / The published material')}{source}</>)}{rule(<>{label('03 / Before a bid review')}{next}</>)}</View>;
 case 'sahil':return <View style={{gap:20}}>{title}{sheet(<>{label('Understand the service')}{observation}</>)}<View style={{paddingLeft:20,borderLeftWidth:2,borderColor:d.accent,gap:16}}>{label('Read the official step')}{source}</View>{next}</View>;
 case 'tawteen':return <View style={{gap:18}}>{label('Policy context / people records')}{title}{observation}{rule(<>{label('Official workforce reading')}{source}</>)}{sheet(next)}</View>;
 case 'adl':return <View style={{borderLeftWidth:2,borderColor:d.accent,paddingLeft:22,gap:24}}>{label('Context before a case')}{title}{observation}{rule(source)}{label('Prepare the chronology')}{next}</View>;
 case 'tawassul':return <View style={{gap:24}}>{label('From the trade correspondence desk')}{title}{observation}{rule(source)}<View style={{alignSelf:'flex-end',width:'85%'}}>{next}</View></View>;
 case 'adab':return <View style={{gap:22}}>{label('THE EDIT / SOURCE NOTES')}{title}{rule(observation)}{sheet(source)}{next}</View>;
 case 'khidmah':return <View style={{gap:18}}>{sheet(<>{title}{observation}</>)}{label('The customer’s published context')}{source}{rule(next)}</View>;
 case 'jomrok':return <View style={{borderWidth:2,borderColor:d.ink,padding:18,gap:18}}>{label('DOCUMENT REFERENCE / CUSTOMS')}{title}{rule(source)}{observation}{rule(next)}</View>;
 case 'khibrat':return <View style={{gap:20}}>{title}{rule(<>{label('Role context')}{observation}</>)}{rule(<>{label('What the official source says')}{source}</>)}{sheet(next)}</View>;
 case 'majlis':return <View style={{paddingHorizontal:12,gap:24}}>{label('An arrival reading')}{title}{observation}<View style={{borderTopWidth:1,borderBottomWidth:1,borderColor:d.accent,paddingVertical:20}}>{source}</View>{next}</View>;
 case 'rafiq':return <View style={{gap:22}}>{title}{sheet(observation)}{label('A source in perspective')}{source}{rule(next)}</View>;
 case 'sawm':return <View style={{gap:28,paddingVertical:10}}>{label('A thoughtful reading')}{title}{observation}<View style={{marginHorizontal:12,borderLeftWidth:1,borderColor:d.accent,paddingLeft:18}}>{source}</View>{next}</View>;
 case 'mizan':return <View style={{gap:22}}>{label('FINANCE / VALUES / BASIS')}{title}{rule(<>{label('Official Islamic-finance context')}{source}</>)}{observation}{sheet(<>{label('Interpretation boundary')}{next}</>)}</View>;
 case 'thawg':return <View style={{gap:24}}>{label('FOOD DESK / A CONSIDERED READING')}{title}<View style={{borderTopWidth:3,borderBottomWidth:1,borderColor:d.accent,paddingVertical:20,gap:18}}>{observation}{source}</View>{next}</View>;
 case 'manzil':return <View style={{borderTopWidth:6,borderColor:d.accent,backgroundColor:d.panel,padding:20,gap:20}}>{label('THE HOUSEHOLD TAX NOTE')}{title}{observation}<View style={{borderTopWidth:1,borderStyle:'dashed',borderColor:d.line,paddingTop:20}}>{source}</View>{next}</View>;
 case 'gurbah':return <View style={{gap:20}}>{title}{label('Before a dependency becomes a task')}{observation}<View style={{borderLeftWidth:2,borderStyle:'dashed',borderColor:d.accent,paddingLeft:20}}>{source}</View>{sheet(next)}</View>;
 case 'amanah-eco':return <View style={{gap:20}}>{label('OBSERVATION / RESOURCE USE')}{title}{sheet(observation)}{rule(<>{label('Conservation source')}{source}</>)}{label('Compare with care')}{next}</View>;
 case 'nafas':return <View style={{gap:28,paddingVertical:14}}>{title}{observation}<View style={{padding:22,backgroundColor:d.panel,borderTopLeftRadius:40,borderBottomRightRadius:40}}>{source}</View>{next}</View>;
 case 'tadweer':return <View style={{gap:20}}>{label('MATERIAL / HANDLING / ROUTE')}{title}{observation}{rule(<>{label('The municipal basis')}{source}</>)}<View style={{borderLeftWidth:7,borderColor:d.accent,paddingLeft:18}}>{next}</View></View>;
 case 'turath':return <View style={{gap:22}}>{label('ARCHIVE FOLIO / OFFICIAL READING')}{title}{rule(source)}{label('The source opens a story')}{observation}<View style={{borderTopWidth:1,borderStyle:'dashed',borderColor:d.accent,paddingTop:20}}>{next}</View></View>;
 case 'himam':return <View style={{gap:26}}>{title}{observation}{rule(<>{label('Access evidence to inspect')}{source}</>)}{sheet(<>{label('What remains to establish')}{next}</>)}</View>;
 case 'hisad':return <View style={{gap:20}}>{label('RESCUE DESK / HANDLING CONTEXT')}{title}{sheet(source)}{rule(observation)}{label('Before an allocation')}{next}</View>;
 }
}
