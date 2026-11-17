import type {ChildProcess} from 'node:child_process';
export function backendPort(child:ChildProcess,timeoutMs=10000):Promise<number>{
 return new Promise((resolve,reject)=>{
  let output='';const done=(error:Error|null,port?:number)=>{clearTimeout(timer);child.stdout?.off('data',data);child.off('error',failed);child.off('exit',exited);if(error)reject(error);else resolve(port!)};
  const data=(chunk:Buffer)=>{output=(output+String(chunk)).slice(-4096);const match=output.match(/25 Agent Studio: http:\/\/(?:127\.0\.0\.1|localhost):(\d+)/);if(match&&Number(match[1])>0)done(null,Number(match[1]))};
  const failed=(error:Error)=>done(error),exited=(code:number|null)=>done(Error('Backend exited before readiness: '+code));
  const timer=setTimeout(()=>done(Error('Backend startup timed out.')),timeoutMs);child.stdout?.on('data',data);child.once('error',failed);child.once('exit',exited);
  if(child.exitCode!==null||child.signalCode!==null)done(Error('Backend already exited before readiness.'));
 });
}
export async function stopBackend(child:ChildProcess):Promise<void>{
 if(!child.pid||child.exitCode!==null||child.signalCode!==null)return;
 await new Promise<void>(resolve=>{
  const timer=setTimeout(()=>{child.kill('SIGKILL');resolve()},2000);
  child.once('exit',()=>{clearTimeout(timer);resolve()});child.kill('SIGTERM');
 });
}
