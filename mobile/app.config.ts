import type {ExpoConfig,ConfigContext} from 'expo/config';
import fs from 'node:fs';
import path from 'node:path';
export default ({config}:ConfigContext):ExpoConfig=>{
 const id=process.env.AGENT_ID||'mizan';
 const brands=JSON.parse(fs.readFileSync(path.join(__dirname,'../brand-assets/brands.json'),'utf8'));
 const brand=brands.find((item:{id:string})=>item.id===id);if(!brand)throw Error('Unknown AGENT_ID');
 const prefix=process.env.APP_ID_PREFIX||'com.agenticmobile';
 if(!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(prefix))throw Error('Invalid APP_ID_PREFIX');
 return {...config,name:brand.name,slug:id+'-mobile',version:'6.0.0',orientation:'portrait',userInterfaceStyle:'light',scheme:id+'-mobile',
 ios:{supportsTablet:false,bundleIdentifier:prefix+'.'+id.replaceAll('-','')},
 android:{package:prefix+'.'+id.replaceAll('-',''),adaptiveIcon:{foregroundImage:`./assets/variants/${id}/icon.png`,backgroundColor:'#F8FAF9'}},
 plugins:['expo-router','expo-secure-store','expo-document-picker','expo-sharing',['expo-splash-screen',{image:`./assets/variants/${id}/splash.png`,imageWidth:390,resizeMode:'contain',backgroundColor:id==='himayah'?'#0B192C':'#F8FAF9'}]],
 extra:{agentId:id,standalone:true},icon:`./assets/variants/${id}/icon.png`,web:{bundler:'metro',output:'single',favicon:`./assets/variants/${id}/icon.png`}};
};
