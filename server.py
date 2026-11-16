"""Single-user local HTTP API + mobile PWA. Public deployment needs TLS and identity."""
import hmac
import json
import mimetypes
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote, parse_qs
import storage as db
import advanced
import retrieval
import exports
import identity
import scheduling
import document_import
import connectors
import intake
import source_tools
from agent_runtime import SPECS, recover, submit
from model_provider import configured
from validation import validate

ROOT=Path(__file__).resolve().parent
TOKEN=os.environ.get('APP_TOKEN','')
STATIC={'/':'index.html','/index.html':'index.html','/public/app.js':'public/app.js','/public/styles.css':'public/styles.css','/public/icon.svg':'public/icon.svg','/sw.js':'sw.js'}

class Handler(BaseHTTPRequestHandler):
    server_version='AgentSuite/5.0'
    def log_message(self,fmt,*args): pass
    def reply(self,value,status=200,content_type='application/json; charset=utf-8',download=False):
        raw=value if isinstance(value,bytes) else json.dumps(value,ensure_ascii=False,allow_nan=False).encode()
        self.send_response(status)
        self.send_header('Content-Type',content_type); self.send_header('Content-Length',str(len(raw)))
        self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        if download: self.send_header('Content-Disposition','attachment; filename="'+(download if isinstance(download,str) else 'agent-result.json')+'"')
        self.end_headers(); self.wfile.write(raw)
    def do_GET(self): self.handle_request('GET')
    def do_POST(self): self.handle_request('POST')
    def do_DELETE(self): self.handle_request('DELETE')
    def handle_request(self,method):
        try:
            path=unquote(urlparse(self.path).path)
            user=identity.authenticate(self.headers.get('Authorization',''),TOKEN) if path.startswith('/api/') and path!='/api/config' else 'default'
            with db.scope(user):
                if path.startswith('/api/') and path!='/api/config':db.init()
                self.route(method)
        except PermissionError as e:self.reply({'error':str(e)},401)
        except ValueError as e: self.reply({'error':str(e)},400)
        except Exception: self.reply({'error':'Internal error. Check server configuration and tests.'},500)
    def route(self,method):
        path=unquote(urlparse(self.path).path); host=self.headers.get('Host','')
        allowed={f'localhost:{self.server.server_port}',f'127.0.0.1:{self.server.server_port}'}
        if os.environ.get('APP_HOSTNAME'): allowed.add(os.environ['APP_HOSTNAME'])
        if host not in allowed: return self.reply({'error':'Unauthorized host'},403)
        origin=self.headers.get('Origin')
        if (origin and urlparse(origin).netloc!=host) or self.headers.get('Sec-Fetch-Site')=='cross-site':
            return self.reply({'error':'Unauthorized origin'},403)
        if path=='/api/config' and method=='GET':
            return self.reply({'requires_token':identity.required(TOKEN),'multiuser':bool(os.environ.get('APP_USERS_FILE')),'model_configured':configured(),'version':'5.0','langgraph_available':advanced.available(),'embedding_configured':bool(os.environ.get('OPENAI_EMBEDDING_MODEL') and os.environ.get('OPENAI_API_KEY')),'external_connectors':[]})
        data={}
        if method=='POST':
            if self.headers.get('Content-Type','').split(';')[0]!='application/json': return self.reply({'error':'Send application/json'},415)
            n=int(self.headers.get('Content-Length','0'))
            maximum=2_900_000 if path=='/api/import/preview' else (900000 if path.endswith('/documents') else 400000)
            if not 0<n<=maximum: return self.reply({'error':'Empty body or route size limit exceeded'},413)
            try: data=json.loads(self.rfile.read(n),parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Invalid JSON number')))
            except (json.JSONDecodeError,UnicodeDecodeError): raise ValueError('Invalid JSON')
            if not isinstance(data,dict): raise ValueError('The request body must be a JSON object')
        if path=='/api/me' and method=='GET':return self.reply({'user':db.USER.get(),'multiuser':bool(os.environ.get('APP_USERS_FILE'))})
        if path=='/api/import/preview' and method=='POST':return self.reply(document_import.extract(data.get('filename'),data.get('base64')))
        match=re.fullmatch(r'/api/schedules/([0-9a-f-]+)/disable',path)
        if match and method=='POST':return self.reply({'disabled':scheduling.disable(match[1])})
        match=re.fullmatch(r'/api/agents/([a-z-]+)/connectors/([a-zA-Z0-9_-]+)/pull',path)
        if match and method=='POST':
            if match[1] not in SPECS:return self.reply({'error':'Unknown app'},404)
            return self.reply(connectors.pull(match[2],match[1],SPECS[match[1]]))
        if path=='/api/agents' and method=='GET': return self.reply({'agents':list(SPECS.values())})
        m=re.fullmatch(r'/api/agents/([a-z-]+)/(?P<action>runs|documents|search|index|schedules|connectors|intake|sources)',path)
        if m:
            agent=m[1]; action=m['action']
            if agent not in SPECS: return self.reply({'error':'Unknown app'},404)
            if action=='sources':
                if method=='GET':return self.reply({'sources':source_tools.available(agent),'reads':source_tools.receipts(agent)})
                if method=='POST':
                    validate(data,{'type':'object','properties':{'source_id':{'type':'string','maxLength':64}},'required':['source_id'],'additionalProperties':False})
                    return self.reply(source_tools.refresh(data['source_id'],agent),201)
            if action=='intake' and method=='POST':return self.reply(intake.prepare(agent,SPECS[agent],data.get('request')))
            if action=='connectors' and method=='GET':return self.reply({'connectors':connectors.allowed(agent)})
            if action=='schedules':
                if method=='GET':return self.reply({'schedules':scheduling.list_schedules(agent)})
                if method=='POST':
                    goal=data.get('goal');mode=data.get('mode','local');inputs=data.get('input')
                    if not isinstance(goal,str) or not goal.strip() or len(goal)>2000:raise ValueError('Invalid goal')
                    if mode not in ('local','model','team'):raise ValueError('Invalid mode')
                    if mode in ('model','team') and not configured():raise ValueError('Model is not configured')
                    if mode=='team' and not advanced.available():raise ValueError('LangGraph is not installed')
                    if not isinstance(data.get('example',False),bool):raise ValueError('example must be a boolean')
                    validate(inputs,SPECS[agent]['schema'])
                    if not isinstance(data.get('first_at'),str):raise ValueError('First run time is required')
                    schedule=scheduling.create(agent,goal,inputs,mode,data.get('example',False),data['first_at'],data.get('every_seconds',0),data.get('max_runs',1))
                    return self.reply({'id':schedule,'schedules':scheduling.list_schedules(agent)},201)
            if action=='runs':
                if method=='GET': return self.reply({'runs':db.recent(agent)})
                if method=='POST':
                    goal=data.get('goal'); mode=data.get('mode','local'); inputs=data.get('input')
                    if not isinstance(goal,str) or not goal.strip() or len(goal)>2000: raise ValueError('Goal must contain 1 to 2,000 characters')
                    if mode not in ('local','model','team'): raise ValueError('Invalid mode')
                    if mode in ('model','team') and not configured(): raise ValueError('Configure OPENAI_API_KEY before using AI')
                    if mode=='team' and not advanced.available(): raise ValueError('Install requirements-agentic.txt to use LangGraph')
                    validate(inputs,SPECS[agent]['schema'])
                    key=self.headers.get('Idempotency-Key')
                    if key and len(key)>128: raise ValueError('Idempotency key is too long')
                    if not isinstance(data.get('example',False),bool): raise ValueError('example must be a boolean')
                    run,created=db.create(agent,goal.strip(),inputs,mode,data.get('example',False),key)
                    if created: submit(run)
                    return self.reply(db.get(run),202 if created else 200)
            if action=='documents':
                if method=='GET': return self.reply({'documents':db.documents(agent)})
                if method=='POST':
                    for k in ('title','text','source','as_of'):
                        if not isinstance(data.get(k),str): raise ValueError('Required text field: '+k)
                    if not data['title'].strip() or not data['text'].strip(): raise ValueError('Title and text are required')
                    if len(data['text'])>200000 or len(data['title'])>200 or len(data['source'])>2000: raise ValueError('Document exceeds limits')
                    if data['as_of']:
                        from datetime import date
                        date.fromisoformat(data['as_of'])
                    return self.reply(db.ingest(agent,**{k:data[k] for k in ('title','text','source','as_of')}),201)
            if action=='index' and method=='POST':
                return self.reply(retrieval.index(agent))
            if action=='search' and method=='POST':
                if not isinstance(data.get('query'),str): raise ValueError('query must be text')
                return self.reply(retrieval.search(agent,data['query'][:2000],semantic=data.get('semantic') is True))
        m=re.fullmatch(r'/api/agents/([a-z-]+)/documents/([0-9a-f-]+)',path)
        if m and method=='DELETE': return self.reply({'deleted':db.delete_document(m[1],m[2])})
        m=re.fullmatch(r'/api/runs/([0-9a-f-]+)(?:/(cancel|retry|review|export)(?:/(markdown|csv|ics))?)?',path)
        if m:
            run=db.get(m[1]); action=m[2]
            if not run: return self.reply({'error':'Unknown run'},404)
            if method=='GET' and action is None: return self.reply(run)
            if method=='GET' and action=='export':
                if m[3]:
                    artifact=exports.export(run,m[3],parse_qs(urlparse(self.path).query).get('date',[None])[0])
                    return self.reply(artifact.content,content_type=artifact.mime_type,download=artifact.filename)
                return self.reply(run,download=True)
            if method=='POST' and action=='cancel':
                with db.connect() as c:
                    changed=c.execute("UPDATE runs SET status='cancelled',phase='cancelled',updated=? WHERE id=? AND status IN ('queued','running')",(db.now(),run['id'])).rowcount
                if not changed: return self.reply({'error':'Run already finished'},409)
                db.emit(run['id'],'cancelled',{'message':'Cancellation requested by the user'})
                return self.reply(db.get(run['id']))
            if method=='POST' and action=='retry':
                if run['status'] not in ('failed','cancelled'): return self.reply({'error':'Only failed or cancelled runs can be resumed'},409)
                with db.connect() as c:
                    changed=c.execute("UPDATE runs SET status='queued',phase='queued',error=NULL,updated=? WHERE id=? AND status IN ('failed','cancelled')",(db.now(),run['id'])).rowcount
                if changed: submit(run['id'])
                return self.reply(db.get(run['id']))
            if method=='POST' and action=='review':
                if run['status']!='completed': return self.reply({'error':'Analysis must be completed'},409)
                if data.get('artifact_hash')!=db.digest(run['result']): return self.reply({'error':'The artifact changed; refresh the screen'},409)
                if data.get('decision') not in ('accepted','rejected'): raise ValueError('Invalid decision')
                with db.connect() as c:
                    changed=c.execute("UPDATE runs SET review=? WHERE id=? AND review='pending'",(data['decision'],run['id'])).rowcount
                if not changed: return self.reply({'error':'Artifact already reviewed'},409)
                db.emit(run['id'],'review',{'decision':data['decision'],'artifact_hash':data['artifact_hash'],'external_action':False})
                return self.reply(db.get(run['id']))
        if path=='/manifest.webmanifest' and method=='GET':
            agent=urlparse(self.path).query.removeprefix('agent='); spec=SPECS.get(agent)
            return self.reply({'id':'/apps/'+agent if spec else '/', 'name':spec['name'] if spec else '25 Agent Studio', 'short_name':spec['name'] if spec else 'Agent Studio','start_url':'/apps/'+agent if spec else '/', 'scope':'/', 'display':'standalone','background_color':'#101817','theme_color':'#101817','icons':[{'src':'/public/icon.svg','sizes':'any','type':'image/svg+xml','purpose':'any'}]},content_type='application/manifest+json')
        m=re.fullmatch(r'/apps/([a-z-]+)/?',path)
        if m and m[1] in SPECS: path='/'
        if path in STATIC and method=='GET':
            f=ROOT/STATIC[path]; return self.reply(f.read_bytes(),content_type=mimetypes.guess_type(f.name)[0] or 'application/octet-stream')
        return self.reply({'error':'Route not found'},404)


def main():
    host=os.environ.get('HOST','127.0.0.1'); port=int(os.environ.get('PORT','8000'))
    if host not in ('127.0.0.1','localhost') and (not identity.required(TOKEN) or not os.environ.get('APP_HOSTNAME')):
        raise SystemExit('Network access requires APP_TOKEN or APP_USERS_FILE and APP_HOSTNAME (host:port). Use TLS for real data.')
    for user in identity.scopes():
        with db.scope(user):db.init();recover()
    scheduler=scheduling.Scheduler().start()
    print(f'25 Agent Studio: http://{host}:{port}',flush=True)
    http=ThreadingHTTPServer((host,port),Handler)
    try:http.serve_forever()
    finally:scheduler.close();http.server_close()

if __name__=='__main__': main()
