import React from 'react';
import {Text} from 'react-native';
import {Tabs} from 'expo-router';
import {colors,experience} from '../../theme';
import {brand} from '../../brand';
export default function Layout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.muted,tabBarStyle:{backgroundColor:colors.bg,borderTopColor:colors.line,minHeight:64},tabBarLabelStyle:{fontSize:11},tabBarHideOnKeyboard:true}}><Tabs.Screen name="index" options={{title:experience.tabs[0],tabBarAccessibilityLabel:brand.homeTitle,tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◈</Text>}}/><Tabs.Screen name="mission" options={{title:experience.tabs[1],tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◎</Text>}}/><Tabs.Screen name="evidence" options={{title:experience.tabs[2],tabBarIcon:({color})=><Text style={{color,fontSize:23}}>▤</Text>}}/><Tabs.Screen name="activity" options={{title:experience.tabs[3],tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◷</Text>}}/></Tabs>}
