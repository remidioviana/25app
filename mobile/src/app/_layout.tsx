import React from 'react';
import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from '../AppState';
export default function Layout(){return <SafeAreaProvider><AppProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false}}><Stack.Screen name="(tabs)"/><Stack.Screen name="connect" options={{presentation:'modal',headerShown:true,title:'Connection'}}/></Stack></AppProvider></SafeAreaProvider>}
