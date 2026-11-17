import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePathname} from 'expo-router';
type Props=React.ComponentProps<typeof SafeAreaView>&{route:'home'|'mission'|'evidence'|'activity'|'workbench'};
export function FocusScreen({route,style,...props}:Props){const path=usePathname(),active=route==='home'?path==='/':path.endsWith('/'+route);return <SafeAreaView {...props} aria-hidden={!active} accessibilityElementsHidden={!active} importantForAccessibility={active?'auto':'no-hide-descendants'} style={[style,!active&&{display:'none'}]}/>}
