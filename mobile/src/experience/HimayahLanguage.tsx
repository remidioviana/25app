import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Language='en'|'ar';
const key='himayah.language.v1';
const Context=createContext<{language:Language;setLanguage:(value:Language)=>void;storageError:boolean}>({language:'en',setLanguage:()=>{},storageError:false});
export function HimayahLanguageProvider({children}:{children:React.ReactNode}){
 const [language,update]=useState<Language>('en');
 const [storageError,setStorageError]=useState(false);
 const revision=useRef(0),queue=useRef(Promise.resolve());
 useEffect(()=>{
  if(Platform.OS==='web')return;
  let active=true;const start=revision.current;
  SecureStore.getItemAsync(key).then(value=>{if(active&&revision.current===start&&(value==='en'||value==='ar'))update(value)}).catch(()=>{if(active&&revision.current===start)setStorageError(true)});
  return()=>{active=false};
 },[]);
 function setLanguage(value:Language){
  const version=++revision.current;update(value);setStorageError(false);
  if(Platform.OS==='web')return;
  queue.current=queue.current.catch(()=>{}).then(()=>SecureStore.setItemAsync(key,value)).catch(()=>{if(revision.current===version)setStorageError(true)});
 }
 return <Context.Provider value={{language,setLanguage,storageError}}>{children}</Context.Provider>;
}
export function useHimayahLanguage(){return useContext(Context)}
