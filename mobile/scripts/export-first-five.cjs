const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {spawnSync}=require('child_process');
const {getConfig}=require('@expo/config');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'dist','first-five');
const ids=['himayah','iqamah','istithmar','munagasah','sahil'];
const report={scope:'Android/iOS JavaScript and assets export only; not APK/IPA, device acceptance or release',signed_binary:false,device_verified:false,apps:[]};
const env={CI:'1',EXPO_NO_DOTENV:'1',EXPO_NO_TELEMETRY:'1'};
for(const name of ['PATH','HOME','TMPDIR','TMP','TEMP','SYSTEMROOT','LANG','APP_ID_PREFIX'])if(process.env[name])env[name]=process.env[name];
if(process.env.EXPO_PUBLIC_API_URL){
 const url=new URL(process.env.EXPO_PUBLIC_API_URL);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('API URL must be a public HTTPS origin without credentials or paths');
 env.EXPO_PUBLIC_API_URL=url.origin;
}
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');
for(const id of ids){
 const target=path.join(output,id);
 const child=spawnSync(process.execPath,[require.resolve('expo/bin/cli'),'export','--platform','android','--platform','ios','--max-workers','2','--dump-assetmap','--output-dir',target],{cwd:root,env:{...env,AGENT_ID:id},stdio:'inherit'});
 if(child.error||child.status!==0)throw Error('Export failed for '+id);
 process.env.AGENT_ID=id;
 const {exp}=getConfig(root);
 const variant={id,name:exp.name,android_package:exp.android.package,ios_bundle_identifier:exp.ios.bundleIdentifier,orientation:exp.orientation};
 fs.writeFileSync(path.join(target,'variant.json'),JSON.stringify(variant,null,2)+'\n');
 const metadata=JSON.parse(fs.readFileSync(path.join(target,'metadata.json'),'utf8'));
 const bundles={};
 for(const platform of ['android','ios']){
  const bundle=metadata.fileMetadata?.[platform]?.bundle;
  if(typeof bundle!=='string')throw Error('Missing '+platform+' bundle for '+id);
  const raw=fs.readFileSync(path.join(target,bundle));
  bundles[platform]={path:bundle,bytes:raw.length,sha256:crypto.createHash('sha256').update(raw).digest('hex')};
 }
 report.apps.push({...variant,bundles});
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');
}
console.log('Verified exports for '+report.apps.length+' apps on Android and iOS; no signed binaries claimed.');
