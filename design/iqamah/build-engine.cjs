// One source of truth for the native and browser dossier assessment.
const fs=require('node:fs'),path=require('node:path');
const ts=require('../../mobile/node_modules/typescript');
const source=fs.readFileSync(path.join(__dirname,'../../mobile/src/dossier.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,removeComments:false}}).outputText;
const output='/* Generated from mobile/src/dossier.ts. Run node design/iqamah/build-engine.cjs. */\n'+
  'globalThis.IqamahDossierEngine = (() => { const exports = {};\n'+js+'\nreturn exports; })();\n';
const dest=path.join(__dirname,'engine.js');
if(process.argv.includes('--check')){
  if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==output){process.stderr.write('Dossier browser engine is stale. Regenerate it.\n');process.exit(1);}
  process.stdout.write('Browser engine matches the native source.\n');
}else{fs.writeFileSync(dest,output);process.stdout.write('Generated browser engine from native source.\n');}
