import React,{createContext,useContext} from 'react';
import {Text,type TextProps} from 'react-native';
import {useFonts} from 'expo-font';
import {brandId} from '../brand';
import {typefaces} from './typefaces';
import {styles as s} from '../theme';
const Context=createContext<string|undefined>(undefined);
export function TypefaceProvider({children}:{children:React.ReactNode}){const family='ExperienceDisplay_'+brandId.replaceAll('-','_');const [loaded]=useFonts({[family]:typefaces[brandId]});return <Context.Provider value={loaded?family:undefined}>{children}</Context.Provider>}
export function useHeadlineFont(){return useContext(Context)}
export function ExperienceTitle({style,...props}:TextProps){const family=useHeadlineFont();return <Text accessibilityRole="header" {...props} style={[s.title,style,family&&{fontFamily:family,fontWeight:'400'}]}/>}
