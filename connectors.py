"""Operator-configured HTTPS JSON snapshot connector, strictly read-only.

No user-supplied URL, redirects, arbitrary headers or writes. DNS resolves once and
connects to a validated public IP with the configured hostname retained for TLS/SNI.
"""
import http.client
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import ssl
from urllib.parse import urlsplit
import storage as db
from validation import validate

MAX_BYTES=2_000_000

def configured():
    path=os.environ.get('APP_CONNECTORS_FILE')
    if not path:return {}
    records=json.loads(Path(path).read_text())
    if not isinstance(records,dict):raise ValueError('Invalid connector configuration')
    for name,cfg in records.items():
        if not re.fullmatch(r'[a-zA-Z0-9_-]{1,64}',name) or not isinstance(cfg,dict) or not isinstance(cfg.get('users'),list) or not isinstance(cfg.get('agents'),list):raise ValueError('Invalid connector contract')
    return records

def allowed(agent):
    result=[]
    for name,cfg in configured().items():
        if db.USER.get() in cfg.get('users',[]) and agent in cfg.get('agents',[]):
            result.append({'id':name,'label':cfg.get('label',name),'kind':'https_json_snapshot','read_only':True})
    return result

def public_addresses(host):
    records=socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)
    values=list(dict.fromkeys(r[4][0] for r in records))
    if not values or any(not ipaddress.ip_address(ip).is_global or ipaddress.ip_address(ip).is_multicast or ipaddress.ip_address(ip).is_reserved for ip in values):raise ValueError('Connector destination is not an allowed public address')
    return values

class PinnedHTTPS(http.client.HTTPSConnection):
    def __init__(self,host,ip):super().__init__(host,443,timeout=15,context=ssl.create_default_context());self.ip=ip
    def connect(self):
        raw=socket.create_connection((self.ip,443),timeout=self.timeout)
        try:self.sock=self._context.wrap_socket(raw,server_hostname=self.host)
        except Exception:raw.close();raise

def fetch_json(cfg):
    url=urlsplit(cfg.get('url',''))
    if url.scheme!='https' or not url.hostname or url.port not in (None,443) or url.username or url.password or url.fragment:
        raise ValueError('Connector requires HTTPS without credentials, fragments or an alternate port')
    ip=public_addresses(url.hostname)[0];headers={'Accept':'application/json','User-Agent':'AgentStudio/4.0'}
    env=cfg.get('token_env')
    if env:
        if not re.fullmatch(r'CONNECTOR_[A-Z0-9_]+',env):raise ValueError('Credential variable must start with CONNECTOR_')
        token=os.environ.get(env)
        if not token or '\r' in token or '\n' in token:raise ValueError('Missing or invalid connector credential')
        headers['Authorization']='Bearer '+token
    connection=PinnedHTTPS(url.hostname,ip)
    try:
        connection.request('GET',(url.path or '/')+('?' +url.query if url.query else ''),headers=headers)
        response=connection.getresponse()
        if response.status!=200:raise ValueError('Connector returned HTTP '+str(response.status)+'; redirects are not followed')
        if 'application/json' not in response.getheader('Content-Type','').lower():raise ValueError('Connector did not return JSON')
        raw=response.read(MAX_BYTES+1)
        if len(raw)>MAX_BYTES:raise ValueError('Connector response exceeds 2 MB')
        return json.loads(raw,parse_constant=lambda _:(_ for _ in ()).throw(ValueError('Non-finite JSON')))
    except (OSError,http.client.HTTPException):raise ValueError('HTTPS connector read failed') from None
    finally:connection.close()

def pointer(value,path):
    if not path:return value
    if not isinstance(path,str) or not path.startswith('/'):raise ValueError('json_pointer must be empty or start with /')
    for part in path[1:].split('/'):
        key=part.replace('~1','/').replace('~0','~')
        if isinstance(value,list) and not re.fullmatch(r'0|[1-9][0-9]*',key):raise ValueError('JSON pointer array indexes must be non-negative integers without leading zeros')
        try:value=value[int(key)] if isinstance(value,list) else value[key]
        except (KeyError,IndexError,ValueError,TypeError):raise ValueError('Response does not contain the configured JSON path') from None
    return value

def pull(name,agent,spec):
    cfg=configured().get(name)
    if not cfg or db.USER.get() not in cfg.get('users',[]) or agent not in cfg.get('agents',[]):raise PermissionError('Connector is not authorized for this user and agent')
    data=pointer(fetch_json(cfg),cfg.get('json_pointer',''));validate(data,spec['schema'])
    receipt={'id':name,'kind':'https_json_snapshot','fetched_at':db.now(),'input_hash':db.digest(data),
             'host':urlsplit(cfg['url']).hostname,'read_only':True,'external_write':False}
    with db.connect() as c:
        c.execute('CREATE TABLE IF NOT EXISTS connector_receipts(id INTEGER PRIMARY KEY AUTOINCREMENT,agent TEXT NOT NULL,at TEXT NOT NULL,receipt TEXT NOT NULL)')
        c.execute('INSERT INTO connector_receipts(agent,at,receipt) VALUES(?,?,?)',(agent,db.now(),db.encode(receipt)))
    return {'input':data,'receipt':receipt}
