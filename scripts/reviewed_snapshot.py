"""Explicit repository-reviewed source snapshots for disposable diagnostics only.

Not a network fallback or a freshness check. Never overwrites an existing app store.
"""
from datetime import datetime,timezone
import hashlib
import json
from pathlib import Path
import storage as db
import source_tools

ROOT=Path(__file__).resolve().parents[1]
SNAPSHOTS={'uae-pdpl':ROOT/'project/evidence/source-snapshots/uae-pdpl.json'}


def ingest(source_id,agent):
    cfg=source_tools.CATALOG.get(source_id)
    if not cfg or agent not in cfg['agents'] or source_id not in SNAPSHOTS:
        raise PermissionError('No reviewed snapshot is authorized for this app/source.')
    if db.documents(agent):raise ValueError('Snapshot diagnostic requires an empty app evidence store; existing evidence is never replaced.')
    path=SNAPSHOTS[source_id]
    if not path.is_file() or path.stat().st_size>1_000_000:raise ValueError('Reviewed snapshot is missing or exceeds the diagnostic limit.')
    try:
        value=json.loads(path.read_text());text=value['text'];original=value['receipt']
        fetched=datetime.fromisoformat(original['fetched_at'])
        valid=(value['snapshot_version']==1 and isinstance(text,str) and 120<=len(text)<=200_000
               and original['source_id']==source_id and original['url']==cfg['url']
               and original['status']=='retrieved' and original['http_status']==200
               and original['characters']==len(text)
               and hashlib.sha256(text.encode()).hexdigest()==original['text_sha256']
               and fetched.tzinfo is not None and fetched<=datetime.now(timezone.utc))
    except (ValueError,KeyError,TypeError,AttributeError):raise ValueError('Reviewed snapshot metadata is invalid.') from None
    if not valid:raise ValueError('Reviewed snapshot identity, text integrity or acquisition time is invalid.')
    # The repository review is the trust boundary; hashes detect changes, not authenticity.
    title=cfg['title']+' [reviewed snapshot; acquired '+original['fetched_at']+']'
    doc=db.ingest(agent,title,text,cfg['url'],'')
    with db.connect() as c:
        c.execute('INSERT INTO public_source_versions VALUES(?,?,?,?,1,?)',
                  (agent,source_id,doc['id'],original['text_sha256'],original['fetched_at']))
    receipt={'source_id':source_id,'url':cfg['url'],'status':'imported_reviewed_snapshot',
             'imported_at':db.now(),'original_fetched_at':original['fetched_at'],
             'text_sha256':original['text_sha256'],'original_raw_sha256':original.get('raw_sha256'),
             'characters':len(text),'document_id':doc['id'],'external_read':False,'external_write':False,
             'fresh_source_fetch_verified':False,'publication_date_verified':False,'legal_applicability_verified':False,
             'warning':'Repository-reviewed historical snapshot, not a fresh HTTP retrieval or legal currency verification.'}
    return {'receipt':receipt,'document_id':doc['id']}
