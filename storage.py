"""Durable local single-user storage. Every query is scoped by agent or run ID."""
import hashlib
import json
import os
import re
import sqlite3
import uuid
from contextvars import ContextVar
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DB=Path(os.environ.get('AGENT_DATA_DIR',str(ROOT/'data')))/'agents-v2.sqlite3'

USER=ContextVar('agent_user',default='default')

@contextmanager
def scope(user):
    if not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,47}',user):raise ValueError('Invalid scope')
    token=USER.set(user)
    try:yield
    finally:USER.reset(token)

def database_path():
    return DB if USER.get()=='default' else DB.parent/'tenants'/USER.get()/DB.name

def now(): return datetime.now(timezone.utc).isoformat()
def encode(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,allow_nan=False)
def digest(x): return hashlib.sha256(encode(x).encode()).hexdigest()
def connect():
    path=database_path();path.parent.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(path,timeout=20); c.row_factory=sqlite3.Row
    c.execute('PRAGMA journal_mode=WAL'); c.execute('PRAGMA foreign_keys=ON'); return c

def init():
    with connect() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,agent TEXT NOT NULL,goal TEXT NOT NULL,
          input TEXT NOT NULL,mode TEXT NOT NULL,example INTEGER NOT NULL,status TEXT NOT NULL,
          phase TEXT NOT NULL,created TEXT NOT NULL,updated TEXT NOT NULL,result TEXT,error TEXT,
          idempotency_key TEXT UNIQUE,request_hash TEXT NOT NULL,review TEXT NOT NULL DEFAULT 'pending',lease TEXT);
        CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,run TEXT NOT NULL REFERENCES runs(id),
          at TEXT NOT NULL,phase TEXT NOT NULL,detail TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,agent TEXT NOT NULL,title TEXT NOT NULL,
          source TEXT NOT NULL,as_of TEXT NOT NULL,created TEXT NOT NULL);
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(doc UNINDEXED,agent UNINDEXED,chunk UNINDEXED,text,tokenize='unicode61 remove_diacritics 2');
        ''')

def emit(run,phase,detail):
    with connect() as c:
        c.execute('INSERT INTO events(run,at,phase,detail) VALUES(?,?,?,?)',(run,now(),phase,encode(detail)))
        c.execute("UPDATE runs SET phase=?,updated=? WHERE id=? AND status='running'",(phase,now(),run))

def create_in(c,agent,goal,data,mode,example,key):
    request_hash=digest([agent,goal,data,mode,example]);run=str(uuid.uuid4())
    old=c.execute('SELECT id,request_hash FROM runs WHERE idempotency_key=?',(key,)).fetchone() if key else None
    if old:
        if old['request_hash']!=request_hash:raise ValueError('Idempotency key reused with different content')
        return old['id'],False
    c.execute('INSERT INTO runs(id,agent,goal,input,mode,example,status,phase,created,updated,idempotency_key,request_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        (run,agent,goal,encode(data),mode,int(example),'queued','queued',now(),now(),key,request_hash))
    return run,True

def create(agent,goal,data,mode,example,key):
    with connect() as c:
        c.execute('BEGIN IMMEDIATE')
        return create_in(c,agent,goal,data,mode,example,key)

def get(run):
    with connect() as c:
        row=c.execute('SELECT * FROM runs WHERE id=?',(run,)).fetchone()
        if not row: return None
        item=dict(row); item['input']=json.loads(item['input']); item['result']=json.loads(item['result']) if item['result'] else None
        item['events']=[dict(x)|{'detail':json.loads(x['detail'])} for x in c.execute('SELECT * FROM events WHERE run=? ORDER BY id',(run,))]
        item.pop('idempotency_key',None)
        if item['result']: item['artifact_hash']=digest(item['result'])
        return item

def recent(agent):
    with connect() as c: return [dict(x) for x in c.execute('SELECT id,goal,status,created,mode,example,review FROM runs WHERE agent=? ORDER BY created DESC LIMIT 50',(agent,))]

def memory(agent):
    with connect() as c:
        return [dict(x)|{'result':json.loads(x['result'])} for x in c.execute("SELECT id,goal,result FROM runs WHERE agent=? AND status='completed' AND review='accepted' AND example=0 ORDER BY created DESC LIMIT 3",(agent,))]

def ingest(agent,title,text,source,as_of):
    doc=str(uuid.uuid4()); chunks=[]
    # Fixed windows with overlap; stable citation IDs. No parsing executable formats.
    for start in range(0,len(text),1000): chunks.append(text[start:start+1200])
    with connect() as c:
        c.execute('INSERT INTO documents VALUES(?,?,?,?,?,?)',(doc,agent,title,source,as_of,now()))
        c.executemany('INSERT INTO chunks(doc,agent,chunk,text) VALUES(?,?,?,?)',[(doc,agent,i,t) for i,t in enumerate(chunks)])
    return {'id':doc,'chunks':len(chunks),'title':title}

def documents(agent):
    with connect() as c: return [dict(x) for x in c.execute('SELECT * FROM documents WHERE agent=? ORDER BY created DESC',(agent,))]

def delete_document(agent,doc):
    with connect() as c:
        if c.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='embeddings'").fetchone():
            c.execute('DELETE FROM embeddings WHERE agent=? AND doc=?',(agent,doc))
        c.execute('DELETE FROM chunks WHERE agent=? AND doc=?',(agent,doc))
        return c.execute('DELETE FROM documents WHERE agent=? AND id=?',(agent,doc)).rowcount>0

def search(agent,query):
    tokens=re.findall(r'\w+',query,flags=re.UNICODE)[:32]
    if not tokens: return []
    expression=' OR '.join('"'+t.replace('"','""')+'"' for t in tokens)
    with connect() as c:
        rows=c.execute('''SELECT chunks.doc,chunks.chunk,chunks.text,documents.title,documents.source,documents.as_of,bm25(chunks) AS rank
        FROM chunks JOIN documents ON documents.id=chunks.doc WHERE chunks MATCH ? AND chunks.agent=? ORDER BY rank LIMIT 6''',(expression,agent))
        return [dict(x)|{'citation':x['doc']+':'+str(x['chunk'])} for x in rows]
