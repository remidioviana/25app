import React from 'react';
import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from '../AppState';
import {experience} from '../theme';
export default function Layout(){return <SafeAreaProvider><AppProvider><StatusBar style={experience.dark?"light":"dark"}/><Stack screenOptions={{headerShown:false}}><Stack.Screen name="(tabs)"/><Stack.Screen name="connect" options={{presentation:'modal',headerShown:true,title:'Connection'}}/></Stack></AppProvider></SafeAreaProvider>}
