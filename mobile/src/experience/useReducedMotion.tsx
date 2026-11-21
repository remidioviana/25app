import {observeMotionPreference} from './motionPreference';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {AccessibilityInfo} from 'react-native';
const Context=createContext(true);
export function MotionProvider({children}:{children:React.ReactNode}){const [reduced,setReduced]=useState(true);useEffect(()=>observeMotionPreference({read:()=>AccessibilityInfo.isReduceMotionEnabled(),subscribe:changed=>{const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',changed);return()=>subscription.remove()}},setReduced),[]);return <Context.Provider value={reduced}>{children}</Context.Provider>}
export function useReducedMotion(){return useContext(Context)}
