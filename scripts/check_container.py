"""Local container acceptance: no provider calls, isolated disposable volume."""
import json
import hashlib
from pathlib import Path
import secrets
import subprocess
import tempfile
import time
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError

ROOT=Path(__file__).resolve().parents[1]
def docker(*args):return subprocess.check_output(['docker',*args],text=True,stderr=subprocess.PIPE).strip()
def main():
    image='25app-backend:local';volume='25app-check-'+secrets.token_hex(6);containers=[]
    token=secrets.token_urlsafe(32);headers={'Host':'25app.test','Authorization':'Bearer '+token}
    report={'scope':'Disposable local container, controlled inputs, no provider inference; not hosted deployment or device acceptance',
            'base_source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
            'dockerfile_sha256':hashlib.sha256((ROOT/'Dockerfile').read_bytes()).hexdigest(),
            'image_id':docker('image','inspect',image,'--format','{{.Id}}'),'apps':[]}
    def request(base,path,body=None,authenticated=True):
        selected=dict(headers)
        if not authenticated:selected.pop('Authorization')
        if body is not None:selected['Content-Type']='application/json'
        with urlopen(Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=selected),timeout=5) as response:return json.load(response)
    try:
        docker('volume','create',volume)
        with tempfile.NamedTemporaryFile(mode='w',prefix='25app-test-env-') as envfile:
            envfile.write('APP_HOSTNAME=25app.test\nAPP_TOKEN='+token+'\n');envfile.flush()
            def start(render_host=False):
                host_flags=['--env','APP_HOSTNAME=','--env','RENDER_EXTERNAL_HOSTNAME=25app.test'] if render_host else []
                container=docker('run','-d','--env-file',envfile.name,*host_flags,'-p','127.0.0.1::8000','-v',volume+':/data',image)
                containers.append(container);port=docker('port',container,'8000/tcp').split(':')[-1];base='http://127.0.0.1:'+port
                for _ in range(100):
                    try:config=request(base,'/api/config');break
                    except (URLError,ConnectionError):time.sleep(.1)
                else:raise AssertionError('Container did not start')
                assert config['langgraph_available'] and not config['model_configured']
                return container,base
            container,base=start()
            assert docker('exec',container,'id','-u')=='10001'
            report['nonroot_user_verified']=True
            try:request(base,'/api/me',authenticated=False)
            except HTTPError as error:assert error.code==401
            else:raise AssertionError('Unauthenticated access accepted')
            assert request(base,'/api/me')['user']=='default';report['authentication_verified']=True
            imported=request(base,'/api/agents/himayah/documents',{'title':'Controlled persistence check','text':'Controlled input','source':'fixture','as_of':''})
            for app in ('himayah','iqamah','istithmar','munagasah','sahil'):
                spec=json.loads((ROOT/'agents'/app/'agent.json').read_text())
                run=request(base,'/api/agents/'+app+'/runs',{'goal':'Controlled container diagnostic','input':spec['example'],'mode':'local','example':True})
                for _ in range(100):
                    if run['status'] not in ('queued','running'):break
                    time.sleep(.05);run=request(base,'/api/runs/'+run['id'])
                assert run['status']=='completed',app+' local run failed'
                report['apps'].append({'id':app,'local_run_completed':True})
            docker('stop',container);docker('rm',container);containers.remove(container)
            _,base=start(render_host=True)
            report['render_hostname_verified']=True
            assert any(row['id']==imported['id'] for row in request(base,'/api/agents/himayah/documents')['documents'])
            report['volume_survives_container_replacement']=True
        target=ROOT/'project/evidence/backend-container-check.json'
        target.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
    finally:
        for container in containers:docker('rm','-f',container)
        docker('volume','rm',volume)
if __name__=='__main__':main()
