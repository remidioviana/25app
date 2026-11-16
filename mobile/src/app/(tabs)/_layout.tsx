import React from 'react';
import {Text} from 'react-native';
import {Tabs} from 'expo-router';
import {colors} from '../../theme';
import {brand} from '../../brand';
export default function Layout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.muted,tabBarStyle:{backgroundColor:'#FFFFFF',minHeight:64},tabBarLabelStyle:{fontSize:11},tabBarHideOnKeyboard:true}}><Tabs.Screen name="index" options={{title:'Overview',tabBarAccessibilityLabel:brand.homeTitle,tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◈</Text>}}/><Tabs.Screen name="mission" options={{title:'Mission',tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◎</Text>}}/><Tabs.Screen name="evidence" options={{title:'Evidence',tabBarIcon:({color})=><Text style={{color,fontSize:23}}>▤</Text>}}/><Tabs.Screen name="activity" options={{title:'Activity',tabBarIcon:({color})=><Text style={{color,fontSize:23}}>◷</Text>}}/></Tabs>}
