// Validate production branding without transforming artwork.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {png}=require('./check-dimensional-icons.cjs');
const root=path.resolve(__dirname,'../..'),brands=require('../../brand-assets/brands.json'),products=require('../../brand-assets/dimensional-logos.json').products,hashes=new Set();
assert.deepEqual(Object.keys(products).sort(),brands.map(b=>b.id).sort());
const approved=require('../../brand-assets/approved-identities.json');
assert.equal(approved.schema_version,1);
assert.deepEqual(Object.keys(approved.products).sort(),brands.map(b=>b.id).sort());
const expectedFiles=['logo_dark','logo_light','wordmark_dark','wordmark_light'];
for(const b of brands){const a=products[b.id];
 assert.equal(approved.products[b.id].name,b.name);
 const currentFiles={symbol:a.symbol,...a.files};
 assert.deepEqual(Object.keys(approved.products[b.id].files).sort(),Object.keys(currentFiles).sort());
 for(const [key,file]of Object.entries(currentFiles)){assert.deepEqual(approved.products[b.id].files[key],{path:file.path,sha256:file.sha256},`${b.id}: ${key} differs from the recorded identity reference`);}
 assert.deepEqual(Object.keys(a.files).sort(),expectedFiles,`${b.id}: all four SVG variants are required`);
 for(const key of expectedFiles){const filename=key.replace('_','-on-')+'.svg';assert.equal(a.files[key].path,`brand-assets/production/${b.id}/${filename}`,`${b.id}: unexpected SVG path`);}
 assert.equal(a.typography.font.path,`mobile/assets/typefaces/${b.id}.ttf`);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root,a.typography.font.path))).digest('hex'),a.typography.font.sha256,`${b.id}: source typeface changed; rebuild outlined names`);
 assert.equal(a.name,b.name);assert.equal(a.typography.text,b.name);const symbol=path.resolve(root,a.symbol.path);assert.equal(symbol,path.join(root,'mobile/assets/variants',b.id,'dimensional-logo.png'));png(symbol,true,false);assert(!hashes.has(a.symbol.sha256));hashes.add(a.symbol.sha256);for(const f of [a.symbol,...Object.values(a.files)]){const data=fs.readFileSync(path.resolve(root,f.path));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),f.sha256);if(f.path.endsWith('.svg')){const s=data.toString();assert(s.includes('<path '));assert(!/<(?:script|text|rect)\b/.test(s));assert(s.includes('<title>'+b.name+'</title>'));if(path.basename(f.path).startsWith('logo-'))assert(s.includes('href="data:image/png;base64,'));}}}
console.log('PASS: 25 unique transparent symbols and 100 outlined wordmark/logo files with exact names and matching hashes.');
console.log('PASS: all 25 identity systems match the recorded reference hashes, including explicitly requested revisions.');
