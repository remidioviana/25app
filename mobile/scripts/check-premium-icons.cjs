const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),brands=require('../../brand-assets/brands.json');
const {icons}=require('../../brand-assets/premium-ivory.json');
const staticRegistry=fs.readFileSync(path.join(root,'mobile/src/experience/premiumIcons.ts'),'utf8');
const hashes=new Set();
assert.equal(Object.keys(icons).length,brands.length);
for(const {id} of brands){
 const record=icons[id],b=fs.readFileSync(path.join(root,record.icon));
 assert.equal(record.background,'#F5E8D0');
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(b.readUInt32BE(16),1024);assert.equal(b.readUInt32BE(20),1024);
 assert.equal(b[25],2,'iOS icon must be opaque RGB');
 const hash=crypto.createHash('sha256').update(b).digest('hex');
 assert.equal(hash,record.sha256);hashes.add(hash);
 assert.ok(staticRegistry.includes(`"${id}": require("../../assets/variants/${id}/premium-ivory.png")`));
 if(record.androidForeground){
  const fg=fs.readFileSync(path.join(root,record.androidForeground));assert.equal(fg[25],6);
  assert.equal(fg.readUInt32BE(16),432);assert.equal(fg.readUInt32BE(20),432);
 }else assert.equal(id,'adab');
}
assert.equal(hashes.size,25);
console.log('PASS: 25 unique approved opaque 1024px PNG assets, 24 adaptive foregrounds, static registry and provenance hashes; device validation pending.');
