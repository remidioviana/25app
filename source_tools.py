"""Allowlisted public-source reads for real evidence; no user URLs or external writes.

Uses normal verified HTTPS with platform proxy settings, denies redirects and
validates public DNS locally. Unlike connectors.PinnedHTTPS, a proxy resolves its
own upstream destination; the configured egress proxy is part of the trust boundary.
"""
import base64
import hashlib
from html.parser import HTMLParser
import http.client
import json
import re
import ssl
import socket
from urllib.error import HTTPError,URLError
from urllib.parse import urlsplit
from urllib.request import HTTPSHandler,HTTPRedirectHandler,ProxyHandler,Request,build_opener,getproxies
import connectors
import document_import
import storage as db

MAX_BYTES=2_000_000
CATALOG={
  'uae-pdpl':{'title':'UAE Federal Decree by Law No.45 of 2021 — Personal Data Protection','url':'https://www.uaelegislation.gov.ae/en/legislations/1972/download','kind':'pdf','agents':['himayah'],'authority':'UAE Legislation'},
  'icp-golden-residency':{'title':'ICP — Golden Residency service information','url':'https://icp.gov.ae/en/services/uae-golden-residency/','kind':'html','agents':['iqamah','gurbah'],'authority':'Federal Authority for Identity, Citizenship, Customs and Port Security'},
  'dmcc-charges':{'title':'DMCC — Schedule of charges','url':'https://dmcc.ae/members/support/schedule-charges','kind':'html','agents':['istithmar'],'authority':'Dubai Multi Commodities Centre'},
  'dubai-esupply':{'title':'Dubai eSupply — Procurement portal information','url':'https://esupply.dubai.gov.ae/web/','kind':'html','agents':['munagasah'],'authority':'Dubai eSupply procurement portal'},
  'dewa-move-in':{'title':'DEWA — Activation of electricity/water, Move-in','url':'https://dewa.gov.ae/en/about-us/service-guide/consumer-services/move-in','kind':'html','agents':['sahil','gurbah'],'authority':'Dubai Electricity and Water Authority'},
}

from source_catalog import ADDITIONAL_SOURCES
CATALOG.update(ADDITIONAL_SOURCES)


def available(agent):
    return [{'id':name,'title':cfg['title'],'url':cfg['url'],'authority':cfg['authority'],
             'kind':cfg['kind'],'source_scope':cfg.get('scope','Official source context; applicability and currentness are not automatically verified.'),'read_only':True,'status':'available_to_attempt; not a successful-read assertion'}
            for name,cfg in CATALOG.items() if agent in cfg['agents']]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        raise ValueError('Source redirected; reviewed canonical URL required before retrieval')


def fetch(cfg):
    url=urlsplit(cfg['url'])
    if url.scheme!='https' or not url.hostname or url.port not in (None,443) or url.username or url.password or url.fragment:
        raise ValueError('Source URL must be fixed HTTPS without credentials, fragment or alternate port')
    if not any(cfg['url']==record['url'] for record in CATALOG.values()):raise ValueError('Source is not in the approved fixed catalogue')
    try:
        dns_validation='public addresses validated by local resolver'
        try:connectors.public_addresses(url.hostname)
        except socket.gaierror:
            if not getproxies().get('https'):raise ValueError('Source DNS resolution failed; no HTTPS egress proxy is configured') from None
            dns_validation='local resolver unavailable; fixed public hostname resolved through trusted HTTPS egress proxy'
        opener=build_opener(ProxyHandler(),HTTPSHandler(context=ssl.create_default_context()),NoRedirect())
        with opener.open(Request(cfg['url'],headers={'Accept':'application/pdf' if cfg['kind']=='pdf' else 'text/html','User-Agent':'AgentStudio/7.0 public evidence reader'}),timeout=20) as response:
            if response.status!=200:raise ValueError('Source returned HTTP '+str(response.status))
            mime=response.headers.get_content_type()
            expected={'application/pdf'} if cfg['kind']=='pdf' else {'text/html','application/xhtml+xml'}
            if mime not in expected:raise ValueError('Source response has an unexpected content type')
            raw=response.read(MAX_BYTES+1)
            if not raw or len(raw)>MAX_BYTES:raise ValueError('Source response is empty or exceeds 2 MB')
            return raw,{'http_status':response.status,'content_type':mime,
                        'last_modified_header':response.headers.get('Last-Modified'),
                        'charset':response.headers.get_content_charset() or 'utf-8','dns_validation':dns_validation}
    except HTTPError as e:raise ValueError('Source returned HTTP '+str(e.code)+'; no authentication or redirect bypass attempted') from None
    except (URLError,OSError,http.client.HTTPException):raise ValueError('Source HTTPS transport failed; no content was verified') from None


class VisibleText(HTMLParser):
    def __init__(self,main_only=False):
        super().__init__(convert_charrefs=True);self.parts=[];self.suppressed=0;self.main_depth=0;self.main_only=main_only
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style','noscript','template','head'):self.suppressed+=1
        if tag=='main':self.main_depth+=1
        if tag in ('p','div','li','h1','h2','h3','h4','tr','br','section'):self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ('script','style','noscript','template','head'):self.suppressed=max(0,self.suppressed-1)
        if tag=='main':self.main_depth=max(0,self.main_depth-1)
        if tag in ('p','div','li','h1','h2','h3','h4','tr','section'):self.parts.append('\n')
    def handle_data(self,data):
        if not self.suppressed and (not self.main_only or self.main_depth):self.parts.append(data)


def extract(raw,cfg,metadata):
    if cfg['kind']=='pdf':
        result=document_import.extract('official-source.pdf',base64.b64encode(raw).decode())
        return result['text'],result['warnings']
    try:html=raw.decode(metadata['charset'])
    except (UnicodeDecodeError,LookupError):raise ValueError('Official source character encoding could not be decoded') from None
    parser=VisibleText(main_only=bool(re.search(r'<main(?:\s|>)',html,re.I)));parser.feed(html)
    lines=[re.sub(r'\s+',' ',line).strip() for line in ''.join(parser.parts).splitlines()]
    text='\n'.join(line for line in lines if line)
    if not text or len(text)>200_000:raise ValueError('Source has no usable text or exceeds 200,000 extracted characters')
    if len(text)<120:raise ValueError('Source has insufficient readable text; a script/login/challenge page is not verified evidence')
    if any(x in text[:400].lower() for x in ('access denied','checking your browser','verify you are human')):raise ValueError('Source returned an access challenge, not verified content')
    return text,['HTML text extraction omits scripts/layout and may include navigation; figures, tables and applicability still require source review.']


def _table(c):
    c.execute('CREATE TABLE IF NOT EXISTS public_source_reads(id INTEGER PRIMARY KEY AUTOINCREMENT,agent TEXT NOT NULL,source_id TEXT NOT NULL,at TEXT NOT NULL,receipt TEXT NOT NULL)')


def receipts(agent,limit=20):
    with db.connect() as c:
        _table(c)
        return [json.loads(r[0]) for r in c.execute('SELECT receipt FROM public_source_reads WHERE agent=? ORDER BY id DESC LIMIT ?',(agent,min(100,max(1,limit))))]


def refresh(source_id,agent):
    cfg=CATALOG.get(source_id)
    if not cfg or agent not in cfg['agents']:raise PermissionError('Public source is not authorized for this app')
    started=db.now()
    try:
        raw,metadata=fetch(cfg);text,warnings=extract(raw,cfg,metadata)
        anchors={'uae-pdpl':['personal data'],'icp-golden-residency':['golden residency','requirements'],
                 'dmcc-charges':['schedule','charges'],'dubai-esupply':['esupply','supplier'],
                 'dewa-move-in':['move-in','activation']}
        required=cfg.get('anchors',anchors.get(source_id))
        if not required:raise ValueError('Reviewed source content anchors are missing')
        if any(anchor not in text.lower() for anchor in required):raise ValueError('Retrieved text does not contain the reviewed source-specific content anchors; source is unverified')
    except ValueError as e:
        failure={'source_id':source_id,'url':cfg['url'],'started_at':started,'finished_at':db.now(),
                 'status':'failed','error':str(e),'external_write':False}
        with db.connect() as c:
            _table(c);c.execute('INSERT INTO public_source_reads(agent,source_id,at,receipt) VALUES(?,?,?,?)',(agent,source_id,failure['finished_at'],db.encode(failure)))
        raise
    raw_hash=hashlib.sha256(raw).hexdigest();text_hash=hashlib.sha256(text.encode()).hexdigest()
    receipt={'source_id':source_id,'url':cfg['url'],'authority':cfg['authority'],'title':cfg['title'],
             'source_scope':cfg.get('scope','Official source context; applicability and currentness are not automatically verified.'),
             'started_at':started,'fetched_at':db.now(),'http_status':metadata['http_status'],'content_type':metadata['content_type'],
             'bytes':len(raw),'characters':len(text),'raw_sha256':raw_hash,'text_sha256':text_hash,
             'last_modified_header':metadata.get('last_modified_header'),'publication_date_verified':False,
             'legal_applicability_verified':False,'status':'retrieved','external_read':True,'external_write':False,
             'transport':'verified HTTPS; fixed URL; redirects denied; platform egress proxy honored',
             'dns_validation':metadata.get('dns_validation','controlled test transport; DNS not live-verified'),
             'warnings':warnings+['Fetch time and Last-Modified do not establish legal currency, applicability or live service state.']}
    with db.connect() as c:
        _table(c);c.execute('BEGIN IMMEDIATE')
        old=c.execute('SELECT doc FROM public_source_versions WHERE agent=? AND source_id=? AND text_hash=? AND is_current=1',(agent,source_id,text_hash)).fetchone()
        doc=old[0] if old else None
        if doc and not c.execute('SELECT 1 FROM documents WHERE id=? AND agent=?',(doc,agent)).fetchone():doc=None
        if not doc:
            import uuid
            doc=str(uuid.uuid4())
            c.execute('INSERT INTO documents VALUES(?,?,?,?,?,?)',(doc,agent,cfg['title'],cfg['url'],'',db.now()))
            chunks=[text[start:start+1200] for start in range(0,len(text),1000)]
            c.executemany('INSERT INTO chunks(doc,agent,chunk,text) VALUES(?,?,?,?)',[(doc,agent,i,t) for i,t in enumerate(chunks)])
        # Upgrade legacy reads/manual source snapshots without erasing historical documents.
        c.execute('''INSERT OR IGNORE INTO public_source_versions(agent,source_id,doc,text_hash,is_current,fetched_at)
          SELECT agent,?,id,'legacy snapshot',0,NULL FROM documents WHERE agent=? AND source=? AND id<>?''',
          (source_id,agent,cfg['url'],doc))
        c.execute('UPDATE public_source_versions SET is_current=0 WHERE agent=? AND source_id=?',(agent,source_id))
        c.execute('INSERT OR REPLACE INTO public_source_versions(agent,source_id,doc,text_hash,is_current,fetched_at) VALUES(?,?,?,?,1,?)',(agent,source_id,doc,text_hash,receipt['fetched_at']))
        receipt['document_id']=doc
        c.execute('INSERT INTO public_source_reads(agent,source_id,at,receipt) VALUES(?,?,?,?)',(agent,source_id,receipt['fetched_at'],db.encode(receipt)))
    return {'receipt':receipt,'document_id':doc,'source_content':'Retrieved into this app/session evidence store; use search_knowledge to inspect passages.'}
