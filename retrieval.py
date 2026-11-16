"""Explicit semantic indexing, scoped cosine search + BM25 with reciprocal-rank fusion."""
import json
import math
import os
import storage as db
import model_provider


def init():
    with db.connect() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS embeddings(doc TEXT NOT NULL,agent TEXT NOT NULL,chunk INTEGER NOT NULL,
          model TEXT NOT NULL,text_hash TEXT NOT NULL,vector TEXT NOT NULL,PRIMARY KEY(doc,chunk,model))''')
        c.execute('CREATE INDEX IF NOT EXISTS embeddings_scope ON embeddings(agent,model)')

def vector(v):
    if not isinstance(v,list) or not v or len(v)>16384 or any(type(x) not in (int,float) or not math.isfinite(x) for x in v):
        raise ValueError('Invalid vector')
    norm=math.sqrt(sum(x*x for x in v))
    if not math.isfinite(norm) or not norm: raise ValueError('Zero or non-finite vector')
    return [x/norm for x in v]

def index(agent):
    init();model=os.environ.get('OPENAI_EMBEDDING_MODEL')
    if not model: raise ValueError('Embedding model is not configured')
    with db.connect() as c:
        rows=[dict(x) for x in c.execute('''SELECT chunks.doc,chunks.chunk,chunks.text FROM chunks
          LEFT JOIN embeddings e ON e.doc=chunks.doc AND e.chunk=chunks.chunk AND e.model=?
          WHERE chunks.agent=? AND e.doc IS NULL
          AND NOT EXISTS (SELECT 1 FROM public_source_versions v WHERE v.doc=chunks.doc AND v.agent=chunks.agent AND v.is_current=0)
          LIMIT 512''',(model,agent))]
    count=0
    for start in range(0,len(rows),32):
        batch=rows[start:start+32];vectors=model_provider.embed([x['text'] for x in batch])
        if len(vectors)!=len(batch): raise ValueError('Vector count differs from batch size')
        vectors=[vector(v) for v in vectors]
        if len({len(v) for v in vectors})!=1: raise ValueError('Incompatible dimensions')
        with db.connect() as c:
            for row,v in zip(batch,vectors):
                # A concurrent deletion must not resurrect a deleted document.
                if c.execute('SELECT 1 FROM documents WHERE id=? AND agent=?',(row['doc'],agent)).fetchone():
                    c.execute('INSERT OR REPLACE INTO embeddings VALUES(?,?,?,?,?,?)',
                      (row['doc'],agent,row['chunk'],model,db.digest(row['text']),db.encode(v)));count+=1
    return {'indexed_chunks':count,'model':model,'batch_limit':512,'note':'Texts sent to the configured provider following an explicit indexing request.'}

def search(agent,query,semantic=False):
    lexical=db.search(agent,query)
    if not semantic: return {'matches':lexical,'method':'bm25','warnings':[]}
    init();model=os.environ.get('OPENAI_EMBEDDING_MODEL')
    if not model: raise ValueError('Semantic search requires an embedding model')
    with db.connect() as c:
        rows=[dict(x) for x in c.execute('''SELECT e.vector,e.text_hash,e.doc,e.chunk,c.text,d.title,d.source,d.as_of,v.fetched_at AS retrieved_at
          FROM embeddings e JOIN chunks c ON c.doc=e.doc AND c.chunk=e.chunk
          JOIN documents d ON d.id=e.doc LEFT JOIN public_source_versions v ON v.doc=e.doc AND v.agent=e.agent
          WHERE e.agent=? AND c.agent=? AND d.agent=? AND e.model=?
          AND NOT EXISTS (SELECT 1 FROM public_source_versions old WHERE old.doc=e.doc AND old.agent=e.agent AND old.is_current=0)
          LIMIT 10000''',(agent,agent,agent,model))]
    if not rows: return {'matches':lexical,'method':'bm25','warnings':['No vectors for this model; index the app evidence first.']}
    q=vector(model_provider.embed([query[:4000]])[0]);ranked=[];warnings=[]
    for row in rows:
        v=vector(json.loads(row.pop('vector')))
        if len(v)!=len(q): raise ValueError('Index/query dimension mismatch; select the same model and reindex')
        if row.pop('text_hash')!=db.digest(row['text']): continue
        row['citation']=row['doc']+':'+str(row['chunk']);row['similarity']=sum(a*b for a,b in zip(q,v));ranked.append(row)
    ranked.sort(key=lambda x:x['similarity'],reverse=True)
    merged={};scores={}
    for candidates in (lexical,ranked[:12]):
        for rank,item in enumerate(candidates,1):
            key=item['citation'];merged[key]=merged.get(key,{})|item;scores[key]=scores.get(key,0)+1/(60+rank)
    matches=[merged[k]|{'fusion_score':scores[k]} for k in sorted(scores,key=scores.get,reverse=True)[:6]]
    return {'matches':matches,'method':'bm25+cosine+rrf','warnings':warnings}
