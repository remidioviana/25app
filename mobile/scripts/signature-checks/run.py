"""Opt-in real HTTP/browser regression checks; never runs provider inference.
Start Expo web in visual audit mode first. Requires Playwright and project Python dependencies.
"""
import os,sys,pathlib,json,tempfile,subprocess,time
ROOT=pathlib.Path(__file__).resolve().parents[3]
if len(sys.argv)>1 and sys.argv[1]=='server':
 sys.path.insert(0,str(ROOT))
 for key in ('OPENAI_API_KEY','OPENAI_EMBEDDING_MODEL','APP_USERS_FILE','APP_CONNECTORS_FILE'):os.environ[key]=''
 os.environ['APP_ALLOWED_WEB_ORIGINS']=os.environ.get('EXPO_AUDIT_ORIGIN','http://127.0.0.1:8091')
 import server,storage
 from http.server import ThreadingHTTPServer
 storage.DB=pathlib.Path(os.environ['SIGNATURE_TEST_DIR'])/('db-'+sys.argv[2]+'.sqlite3');server.TOKEN='controlled-ui-test-only'
 http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
 name='signature-http'+('-2'if sys.argv[2]=='2'else'')+'.json'
 (pathlib.Path(os.environ['SIGNATURE_TEST_DIR'])/name).write_text(json.dumps({'port':http.server_port}))
 http.serve_forever()
else:
 from pypdf import PdfWriter
 from pypdf.generic import DictionaryObject,NameObject,DecodedStreamObject
 children=[]
 with tempfile.TemporaryDirectory(prefix='25app-signature-')as directory:
  env={**os.environ,'SIGNATURE_TEST_DIR':directory}
  writer=PdfWriter();page=writer.add_blank_page(width=612,height=792)
  font=DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})
  page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):writer._add_object(font)})})
  text=json.loads((ROOT/'agents/himayah/agent.json').read_text())['example']['text'];stream=DecodedStreamObject();stream.set_data(('BT /F1 12 Tf 40 740 Td ('+text.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')+') Tj ET').encode())
  page[NameObject('/Contents')]=writer._add_object(stream);writer.write(pathlib.Path(directory)/'signature-controlled-contract.pdf')
  try:
   for number in ('1','2'):
    child=subprocess.Popen([sys.executable,__file__,'server',number],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);children.append(child)
    config=pathlib.Path(directory)/('signature-http'+('-2'if number=='2'else'')+'.json');deadline=time.monotonic()+10
    while not config.exists():
     if child.poll()is not None or time.monotonic()>deadline:raise RuntimeError('Isolated test backend failed to start')
     time.sleep(.05)
   for script in ('pdf.py','nafas.py','motion.py','races.py'):subprocess.run([sys.executable,str(pathlib.Path(__file__).parent/script)],env=env,check=True,timeout=120)
  finally:
   for child in children:
    if child.poll()is None:
     child.terminate()
     try:child.wait(timeout=3)
     except subprocess.TimeoutExpired:child.kill();child.wait(timeout=3)
