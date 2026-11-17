import React,{createContext,useContext,useEffect,useState} from 'react';
import {AccessibilityInfo} from 'react-native';
const Context=createContext(true);
export function MotionProvider({children}:{children:React.ReactNode}){const [reduced,setReduced]=useState(true);useEffect(()=>{let live=true;AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(live)setReduced(value)}).catch(()=>{});const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{live=false;subscription.remove()}},[]);return <Context.Provider value={reduced}>{children}</Context.Provider>}
export function useReducedMotion(){return useContext(Context)}
