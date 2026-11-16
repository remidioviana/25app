import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {brandId} from './brand';
const KEY=brandId+'.connection.v1';
export interface Connection {url:string;token:string}
export async function loadConnection():Promise<Connection|null>{
 if(Platform.OS==='web')return null;
 const value=await SecureStore.getItemAsync(KEY);if(!value)return null;
 const parsed=JSON.parse(value);if(typeof parsed.url!=='string'||typeof parsed.token!=='string')return null;return parsed;
}
export async function saveConnection(value:Connection){
 if(Platform.OS==='web')return;
 const payload=JSON.stringify(value);if(payload.length>1800)throw new Error('Address or token exceeds secure storage limits.');
 await SecureStore.setItemAsync(KEY,payload,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
}
export async function clearConnection(){if(Platform.OS!=='web')await SecureStore.deleteItemAsync(KEY)}
