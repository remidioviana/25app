import React from 'react';
import {MaterialProvider} from '../experience/MaterialProvider';
import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from '../AppState';
import {experience} from '../theme';
import {MotionProvider} from '../experience/useReducedMotion';
import {TypefaceProvider} from '../experience/TypefaceProvider';
import {NafasProvider} from '../experience/NafasState';
import {HimayahLanguageProvider} from '../experience/HimayahLanguage';
export default function Layout(){return <MaterialProvider><MotionProvider><TypefaceProvider><SafeAreaProvider><AppProvider><NafasProvider><HimayahLanguageProvider><StatusBar style={experience.dark?"light":"dark"}/><Stack screenOptions={{headerShown:false}}><Stack.Screen name="(tabs)"/><Stack.Screen name="connect" options={{presentation:'modal',headerShown:true,title:'Connection'}}/></Stack></HimayahLanguageProvider></NafasProvider></AppProvider></SafeAreaProvider></TypefaceProvider></MotionProvider></MaterialProvider>}
