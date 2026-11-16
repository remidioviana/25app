"""Local operator CLI for bearer identity provisioning and tenant backups."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
import storage as db
from identity import ID


def add_user(path,user):
    if not ID.fullmatch(user) or user=='default':raise ValueError('Invalid or reserved identifier')
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    # Exclusive create lock prevents simultaneous provisioning from losing records.
    lock=path.with_suffix(path.suffix+'.lock')
    fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    try:
        records=json.loads(path.read_text()) if path.exists() else {}
        if user in records:raise ValueError('User already exists; explicitly remove the record to revoke before recreating')
        token=secrets.token_urlsafe(32);records[user]={'token_sha256':hashlib.sha256(token.encode()).hexdigest()}
        tmp=path.with_suffix(path.suffix+'.tmp')
        with os.fdopen(os.open(tmp,os.O_CREAT|os.O_TRUNC|os.O_WRONLY,0o600),'w') as f:json.dump(records,f,indent=2)
        os.replace(tmp,path)
        return token
    finally:os.close(fd);lock.unlink()

def backup(destination):
    destination=Path(destination)
    if destination.exists():raise ValueError('Destination already exists; choose another path')
    destination.mkdir(parents=True)
    for name in [db.database_path().name,'langgraph-checkpoints.sqlite3']:
        source=db.database_path().parent/name
        if not source.exists():continue
        with sqlite3.connect(source) as origin,sqlite3.connect(destination/name) as target:origin.backup(target)
    return destination

def main():
    p=argparse.ArgumentParser();p.add_argument('action',choices=['add-user','backup']);p.add_argument('user');p.add_argument('--users-file',default=str(db.DB.parent/'users.json'));p.add_argument('--destination');a=p.parse_args()
    if a.action=='add-user':
        token=add_user(a.users_file,a.user)
        print('Keep this token; it will not be stored as plaintext: '+token)
        print('Configure APP_USERS_FILE='+str(Path(a.users_file).resolve()))
    else:
        if not a.destination:p.error('--destination is required')
        with db.scope(a.user):print(backup(a.destination))

if __name__=='__main__':main()
