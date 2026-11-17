import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Modal,AppState,Animated,Platform,Switch,ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {Button} from './Controls';
import {experience as d,styles as s} from '../src/theme';
import {useReducedMotion} from '../src/experience/useReducedMotion';
import {useNafas} from '../src/experience/NafasState';
import {startBreath,advanceBreath,pauseBreath,resumeBreath,stopBreath,breathPhase,type BreathSession} from '../src/experience/breathingSession';
let sequence=0;
const now=()=>performance.now();
export function BreathingPause(){
 const local=useNafas(),[open,setOpen]=useState(false),[session,setSession]=useState<BreathSession|null>(null),[scale]=useState(()=>new Animated.Value(1)),reduced=useReducedMotion(),record=useRef(local.record);
 useEffect(()=>{record.current=local.record},[local.record]);
 const status=session?.status,phase=session?breathPhase(session):null,running=status==='running',finished=status==='completed'||status==='stopped';
 useEffect(()=>{if(!open||!running)return;const timer=setInterval(()=>setSession(v=>v?advanceBreath(v,now()):v),100);return()=>clearInterval(timer)},[open,running]);
 useEffect(()=>{if(!open)return;const sub=AppState.addEventListener('change',state=>{if(state!=='active')setSession(v=>v?pauseBreath(v,now()):v)});return()=>sub.remove()},[open]);
 const finalRecorded=useRef<string|null>(null);
 useEffect(()=>{if(!session||!finished||finalRecorded.current===session.id)return;finalRecorded.current=session.id;record.current(session);if(session.status==='completed'&&local.haptics&&!reduced&&Platform.OS!=='web')void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{})},[session,finished,local.haptics,reduced]);
 useEffect(()=>{scale.stopAnimation();if(reduced||!running||!phase){if(reduced||finished)scale.setValue(1);return}const animation=Animated.timing(scale,{toValue:phase.name==='Inhale'?1.16:1,duration:Math.max(1,phase.remainingMs),useNativeDriver:Platform.OS!=='web'});animation.start();return()=>animation.stop();
 // Phase changes and pause/resume start a new remaining-phase animation; clock ticks do not restart it.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[phase?.name,running,reduced,finished,scale]);
 function close(){if(session){record.current(finished?session:stopBreath(session,now()))}setSession(null);setOpen(false);scale.stopAnimation();scale.setValue(1)}
 function start(){finalRecorded.current=null;setSession(startBreath('pause-'+Date.now()+'-'+(++sequence),local.config,now()))}
 return <>
  <Button secondary title="Take a breathing pause" onPress={()=>{setSession(null);setOpen(true)}}/>
  <Modal visible={open} animationType={reduced?'none':'fade'} onRequestClose={close}>
   <SafeAreaView style={{flex:1,backgroundColor:d.bg}}>
    <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1,padding:24,gap:22,justifyContent:'center'}}>
     <Text style={s.tag}>NAFAS · YOUR PACING TIMER</Text>
     {!session ? <>
      <Text style={s.title}>Make a little room.</Text>
      <Text style={s.text}>Choose a comfortable pace. Stop whenever you need.</Text>
      <Text style={s.h3}>Duration</Text>
      <View style={s.row}>{[30,60,120].map(duration=><Button key={duration} secondary={local.config.durationSeconds!==duration} title={duration+' seconds'} onPress={()=>local.setConfig({...local.config,durationSeconds:duration})}/>)}</View>
      <Text style={s.h3}>Pacing</Text>
      <View style={s.row}>{[[3,5],[4,6]].map(([inhale,exhale])=><Button key={inhale} secondary={local.config.inhaleSeconds!==inhale} title={inhale+' in / '+exhale+' out'} onPress={()=>local.setConfig({...local.config,inhaleSeconds:inhale,exhaleSeconds:exhale})}/>)}</View>
      {Platform.OS!=='web'&&<View style={s.row}><Switch accessibilityLabel="Completion haptic feedback" value={local.haptics} onValueChange={local.setHaptics}/><Text style={s.text}>Completion haptic</Text></View>}
      <Button title="Start the pause" onPress={start}/>
     </> : <>
      <View style={{alignItems:'center',paddingVertical:20}}>
       <Animated.View testID="breath-pacing-outline" style={{width:200,minHeight:200,maxWidth:'90%',borderRadius:100,borderWidth:2,borderColor:d.accent,transform:[{scale}],justifyContent:'center',alignItems:'center',padding:20,gap:12}}>
        <Text accessibilityLiveRegion="polite" style={{color:d.ink,fontSize:30,textAlign:'center'}}>{finished?(status==='completed'?'Complete':'Stopped'):status==='paused'?'Paused':phase!.name}</Text>
        {!finished&&<Text style={{fontSize:38,color:d.accent}}>{Math.ceil(phase!.remainingMs/1000)}</Text>}
       </Animated.View>
      </View>
      <Text style={[s.text,{textAlign:'center'}]}>{Math.floor(session.elapsedMs/1000)} / {session.config.durationSeconds} active seconds</Text>
      <Text style={s.muted}>{reduced?'Reduced motion: a steady outline and text cues.':'The outline follows your chosen pace. This is a timer, not a breathing measurement.'}</Text>
      {!finished&&<Button title={running?'Pause the exercise':'Resume the exercise'} onPress={()=>setSession(v=>v?(running?pauseBreath(v,now()):resumeBreath(v,now())):v)}/>}
      <Button secondary title={finished?'Start another pause':'Stop the exercise'} onPress={()=>finished?setSession(null):setSession(v=>v?stopBreath(v,now()):v)}/>
     </>}
    </ScrollView>
    <View style={{padding:24}}><Button secondary title="Return to Nafas" onPress={close}/></View>
   </SafeAreaView>
  </Modal>
 </>;
}
