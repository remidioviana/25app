const fs=require('node:fs'),path=require('node:path'),ts=require('../../mobile/node_modules/typescript');
const source=fs.readFileSync(path.join(__dirname,'../../mobile/src/setupComparison.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const text='/* Generated from mobile/src/setupComparison.ts; do not hand-edit. */\nglobalThis.IstithmarEngine=(()=>{const exports={};\n'+js+'\nreturn exports;})();\n';
const dest=path.join(__dirname,'engine.js');
if(process.argv.includes('--check')){if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==text){process.stderr.write('Regenerate the Istithmar browser engine.\n');process.exit(1)}process.stdout.write('Istithmar browser engine matches native source.\n')}
else{fs.writeFileSync(dest,text);process.stdout.write('Generated Istithmar engine.\n')}
