const fs=require('node:fs'),path=require('node:path'),ts=require('../../mobile/node_modules/typescript');
const source=fs.readFileSync(path.join(__dirname,'../../mobile/src/dossier.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const output='/* Shared deterministic document/date primitive generated from mobile/src/dossier.ts. */\nglobalThis.PortfolioDossier=(()=>{const exports={};\n'+js+'\nreturn exports;})();\n';
const dest=path.join(__dirname,'dossier-engine.js');
if(process.argv.includes('--check')){if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==output){process.stderr.write('Shared browser engine is stale.\n');process.exit(1)}process.stdout.write('Shared browser engine matches native source.\n')}
else fs.writeFileSync(dest,output);
