const {spawn}=require('child_process');const fs=require('fs'),path=require('path');
const [id,action='start',...args]=process.argv.slice(2);
if(!id||!/^[a-z-]+$/.test(id)||!fs.existsSync(path.join(__dirname,'../../agents',id,'agent.json'))||!['start','config','export','build'].includes(action)){console.error('Usage: node scripts/variant.cjs <agent-id> [start|config|export|build] [...expo args]');process.exit(1)}
const cli=require.resolve('expo/bin/cli');const build=action==='build';const child=spawn(build?'npx':process.execPath,build?['eas-cli@latest','build','--profile',id+'-preview',...args]:[cli,action,...args],{stdio:'inherit',cwd:path.resolve(__dirname,'..'),env:{...process.env,AGENT_ID:id,EXPO_NO_TELEMETRY:'1'}});child.on('exit',code=>process.exit(code||0));
