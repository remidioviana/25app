import React from 'react';
import {ScrollView,View,Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {router} from 'expo-router';
import {useApp} from '../../AppState';
import {brand,brandAssets} from '../../brand';
import {styles as s} from '../../theme';
import {Button} from '../../../components/Controls';
import {DomainExperience} from '../../../components/DomainExperience';
export default function Overview(){const app=useApp();return <SafeAreaView style={s.screen} edges={['top']}><ScrollView contentContainerStyle={s.scroll}><View style={s.row}><SvgXml xml={brandAssets.logo} width={64} height={64}/><View style={{flex:1}}><Text style={s.tag}>{brand.pillar} · {brand.persona}</Text><Text style={s.h2}>{brand.name}</Text></View></View><Text style={s.title}>{brand.homeTitle}</Text><Text style={s.muted}>{brand.title}</Text><View style={s.notice}><Text style={s.text}>{app.hasInputs?(app.example?'Explicitly marked demonstration draft':'Your supplied draft · not authenticated'):'Start with your own information'}</Text><Text style={s.muted}>Calculations and checklists use supplied assumptions. No live certification or external action is implied.</Text></View>{app.hasInputs?<DomainExperience/>:<View style={s.card}><Text style={s.h2}>No task data supplied yet</Text><Text style={s.text}>Add your own information in the mission workspace or review an input proposal from a configured service.</Text><Text style={s.muted}>No document has been analyzed, no real-world fact has been verified and no external action has been performed.</Text></View>}<Button title="Open mission workspace" onPress={()=>router.push('/mission')}/><Button secondary title={app.api?'Connection settings':'Connect AI workspace'} onPress={()=>router.push('/connect')}/>{!!app.connectionError&&<Text style={s.error}>{app.connectionError}</Text>}</ScrollView></SafeAreaView>}
