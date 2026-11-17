// Read-only PNG geometry validation; does not transform artwork or simulate device acceptance.
const {Buffer}=require('node:buffer');
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),registry=require('../../brand-assets/dimensional-icons.json');
function png(file,rgba=false){
 const b=fs.readFileSync(file);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);assert.equal(width,height);assert(width>=1024&&width<=4096);assert.equal(b[24],8);assert.equal(b[28],0);
 if(!rgba){assert.equal(b[25],2,'Launcher artwork must be opaque RGB.');return {width,height}}
 assert.equal(b[25],6,'Android foreground needs RGBA.');let offset=8;const parts=[];
 while(offset<b.length){const size=b.readUInt32BE(offset),type=b.toString('ascii',offset+4,offset+8);assert(offset+size+12<=b.length);if(type==='IDAT')parts.push(b.subarray(offset+8,offset+8+size));offset+=size+12;if(type==='IEND')break}
 const stride=width*4,raw=zlib.inflateSync(Buffer.concat(parts),{maxOutputLength:height*(stride+1)});assert.equal(raw.length,height*(stride+1));
 let previous=Buffer.alloc(stride),opaque=0,insideSafe=0,insideVisible=0,maxRadius=0,edgeAlpha=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c};
 for(let y=0;y<height;y++){
  const start=y*(stride+1),filter=raw[start],row=Buffer.alloc(stride);assert(filter<=4);
  for(let i=0;i<stride;i++){const left=i>=4?row[i-4]:0,up=previous[i],corner=i>=4?previous[i-4]:0;row[i]=(raw[start+1+i]+(filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,corner)))&255}
  for(let x=0;x<width;x++){const alpha=row[x*4+3];if(x===0||x===width-1||y===0||y===height-1)edgeAlpha=Math.max(edgeAlpha,alpha);if(alpha>=128){opaque++;const r=Math.hypot(x+.5-width/2,y+.5-height/2)/width;maxRadius=Math.max(maxRadius,r);if(r<=33/108)insideSafe++;if(r<=36/108)insideVisible++}}
  previous=row;
 }
 assert(opaque>0);assert(edgeAlpha<=8,'Foreground frame must be transparent.');assert.equal(insideVisible,opaque,'Visible silhouette crosses the default 72dp circle.');assert(insideSafe/opaque>=.999,'At least 99.9% of the core silhouette must fit the 66dp safe circle.');
 return {width,height,edge_alpha_max:edgeAlpha,core_pixels:opaque,fraction_inside_66dp:insideSafe/opaque,fraction_inside_72dp:insideVisible/opaque,maximum_core_radius_fraction:maxRadius};
}
const brandIds=new Set(require('../../brand-assets/brands.json').map(item=>item.id));
const rows=[];
for(const [id,item]of Object.entries(registry.icons)){
 assert(brandIds.has(id),'Dimensional artwork must belong to a registered app.');
 const row={app:id,files:{}};
 for(const [key,rgba]of [['icon',false],['android_foreground',true]]){const asset=item[key],file=path.resolve(root,asset.path);assert(file.startsWith(path.join(root,'mobile/assets/variants',id)+path.sep));const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');assert.equal(sha,asset.sha256);row.files[key]={sha256:sha,...png(file,rgba)}}
 assert.notEqual(row.files.icon.sha256,row.files.android_foreground.sha256);rows.push(row);
}
assert(rows.length>0&&rows.length<=brandIds.size);
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'project/evidence/dimensional-icon-geometry.json'),JSON.stringify({scope:'PNG alpha, dimensions, provenance hashes and core-silhouette geometry only. Not physical launcher inspection, small-size expert approval, Icon Composer layering or a signed build.',apps:rows},null,2)+'\n');
console.log(`PASS: ${rows.length} opaque launcher artworks and ${rows.length} separate adaptive foregrounds; hashes, transparency and circular-mask geometry. No device acceptance claimed.`);
