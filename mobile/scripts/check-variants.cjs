const {getConfig}=require('@expo/config');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),brands=require('../../brand-assets/brands.json');
const premium=require('../../brand-assets/premium-ivory.json').icons;
const packages=new Set(),bundles=new Set(),icons=new Set(),splashes=new Set();
for(const brand of brands){
 process.env.AGENT_ID=brand.id;const {exp}=getConfig(root);const approved=premium[brand.id];
 assert.equal(exp.extra.agentId,brand.id);assert.equal(exp.owner,'remidiovianas-team');assert.equal(exp.slug,'25app');assert.equal(exp.extra.eas.projectId,'b2d48b85-5e43-4a6f-8cdb-826487e7b03e');assert.equal(exp.extra.standalone,true);assert.equal(exp.orientation,'portrait');assert.equal(exp.ios.supportsTablet,false);assert.equal(exp.name,brand.name);
 packages.add(exp.android.package);bundles.add(exp.ios.bundleIdentifier);icons.add(exp.icon);assert.ok(fs.existsSync(path.join(root,exp.icon)));
 const splash=exp.plugins.find(x=>Array.isArray(x)&&x[0]==='expo-splash-screen')[1];assert.equal(splash.resizeMode,'contain');assert.equal(splash.image,exp.icon);assert.equal(splash.backgroundColor,approved.background);splashes.add(splash.image);assert.ok(fs.existsSync(path.join(root,splash.image)));assert.ok(fs.existsSync(path.join(root,'assets/variants',brand.id,'logo.svg')));
 assert.equal(path.resolve(root,exp.icon),path.resolve(root,'..',approved.icon));
 if(approved.androidForeground){assert.equal(path.resolve(root,exp.android.adaptiveIcon.foregroundImage),path.resolve(root,'..',approved.androidForeground));assert.notEqual(exp.icon,exp.android.adaptiveIcon.foregroundImage);assert.equal(exp.android.adaptiveIcon.backgroundColor,approved.background)}
 else assert.equal(exp.android.adaptiveIcon,undefined);
 const eas=require('../eas.json');assert.equal(eas.build[brand.id+'-preview'].env.AGENT_ID,brand.id);assert.equal(eas.build.preview.android.buildType,'apk');assert.equal(eas.build.preview.distribution,'internal');
}
delete process.env.AGENT_ID;assert.equal(getConfig(root).exp.extra.agentId,'mizan');assert.equal(brands.length,25);for(const values of [packages,bundles,icons,splashes])assert.equal(values.size,25);process.env.AGENT_ID='unknown';assert.throws(()=>getConfig(root));delete process.env.AGENT_ID;
console.log('PASS: 25 standalone portrait variants; unique names/IDs/icons/splashes, logos and EAS profiles; Mizan default; invalid variants rejected. No signed binary/device validation claimed.');
require('./check-dimensional-icons.cjs');
require('./check-dimensional-logos.cjs');
require('./check-premium-icons.cjs');

// An individually hashed SVG must still embed the current symbol, never an older revision.
const {Buffer}=require('node:buffer');
const crypto=require('crypto'),logoProducts=require('../../brand-assets/dimensional-logos.json').products;
for(const {id} of brands){
 const symbol=fs.readFileSync(path.resolve(root,'..',logoProducts[id].symbol.path));
 const actual=crypto.createHash('sha256').update(symbol).digest('hex');
 assert.equal(actual,logoProducts[id].symbol.sha256,`${id}: dimensional symbol hash mismatch; rebuild the registry after an approved revision`);
 for(const theme of ['light','dark']){
  const composition=fs.readFileSync(path.resolve(root,'..',logoProducts[id].files['logo_'+theme].path),'utf8');
  const embedded=[...composition.matchAll(/href="data:image\/png;base64,([^"\s]+)"/g)];
  assert.equal(embedded.length,1,`${id}: expected exactly one embedded dimensional symbol`);
  assert.deepEqual(Buffer.from(embedded[0][1],'base64'),symbol,`${id}: ${theme} composition embeds an outdated symbol`);
 }
}
console.log('PASS: every light/dark logo composition embeds the exact current dimensional PNG.');
