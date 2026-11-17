import React,{createContext,useContext,useEffect,useState} from 'react';
import {AccessibilityInfo,Platform} from 'react-native';
import {isLiquidGlassAvailable,isGlassEffectAPIAvailable} from 'expo-glass-effect';
import {navigationMaterial,type MaterialPreferences} from './navigationMaterial';
const Context=createContext<'native-glass'|'solid'>('solid');
export function MaterialProvider({children}:{children:React.ReactNode}){
 const [prefs,setPrefs]=useState<MaterialPreferences>({reduceTransparency:null,enhanceContrast:null,invertColors:null});
 const [support]=useState(()=>{try{return {native:Platform.OS==='ios'&&isLiquidGlassAvailable(),api:Platform.OS==='ios'&&isGlassEffectAPIAvailable()}}catch{return {native:false,api:false}}});
 useEffect(()=>{
  if(Platform.OS!=='ios')return;
  let live=true;const revisions={reduceTransparency:0,enhanceContrast:0,invertColors:0};
  const receive=(key:keyof MaterialPreferences,value:boolean)=>{revisions[key]++;if(live)setPrefs(old=>({...old,[key]:value}))};
  const subscriptions=[AccessibilityInfo.addEventListener('reduceTransparencyChanged',v=>receive('reduceTransparency',v)),AccessibilityInfo.addEventListener('darkerSystemColorsChanged',v=>receive('enhanceContrast',v)),AccessibilityInfo.addEventListener('invertColorsChanged',v=>receive('invertColors',v))];
  const read=(key:keyof MaterialPreferences,query:()=>Promise<boolean>)=>{const revision=revisions[key];query().then(value=>{if(live&&revisions[key]===revision)setPrefs(old=>({...old,[key]:value}))}).catch(()=>{})};
  read('reduceTransparency',()=>AccessibilityInfo.isReduceTransparencyEnabled());read('enhanceContrast',()=>AccessibilityInfo.isDarkerSystemColorsEnabled());read('invertColors',()=>AccessibilityInfo.isInvertColorsEnabled());
  return()=>{live=false;subscriptions.forEach(x=>x.remove())};
 },[]);
 return <Context.Provider value={navigationMaterial(Platform.OS,support.native,support.api,prefs)}>{children}</Context.Provider>;
}
export function useNavigationMaterial(){return useContext(Context)}
