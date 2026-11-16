"""Operator-provisioned bearer identities. Tokens are stored as SHA-256 hashes."""
import hashlib
import hmac
import json
import os
import re
from pathlib import Path

ID=re.compile(r'[a-z0-9][a-z0-9_-]{0,47}')

def users():
    path=os.environ.get('APP_USERS_FILE')
    if not path:return {}
    data=json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(data,dict) or not data:raise ValueError('User file is empty or invalid')
    for name,record in data.items():
        if not ID.fullmatch(name) or name=='default' or not isinstance(record,dict) or not re.fullmatch(r'[0-9a-f]{64}',record.get('token_sha256','')):
            raise ValueError('Invalid identity configuration')
    if len({r['token_sha256'] for r in data.values()})!=len(data):raise ValueError('Duplicate tokens in configuration')
    return data

def scopes():return list(users()) if os.environ.get('APP_USERS_FILE') else ['default']
def required(legacy_token=''):return bool(os.environ.get('APP_USERS_FILE') or legacy_token)

def authenticate(header,legacy_token=''):
    records=users()
    if records:
        supplied=header.removeprefix('Bearer ') if header.startswith('Bearer ') else ''
        hashed=hashlib.sha256(supplied.encode()).hexdigest();found=None
        for user,record in records.items():
            if hmac.compare_digest(hashed,record['token_sha256']):found=user
        if found is None:raise PermissionError('Invalid access token')
        return found
    if legacy_token and not hmac.compare_digest(header,'Bearer '+legacy_token):raise PermissionError('Access token required')
    return 'default'
