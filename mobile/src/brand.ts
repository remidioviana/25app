import Constants from 'expo-constants';
import {brands,assets} from './brands';
const auditId=process.env.EXPO_PUBLIC_VISUAL_AUDIT==='1'&&typeof window!=='undefined'?new URLSearchParams(window.location.search).get('variant'):null;
export const brandId=(auditId||Constants.expoConfig?.extra?.agentId||'mizan') as keyof typeof brands;
if(!brands[brandId])throw Error('Unknown standalone app');
export const brand=brands[brandId];export const brandAssets=assets[brandId];
