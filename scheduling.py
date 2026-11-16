"""Finite, persisted app schedules; atomic occurrence/run creation, coalesced misses."""
import json
import time
import uuid
from datetime import datetime,timezone
from threading import Event,Thread
import storage as db
import identity


def init():
    with db.connect() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS schedules(id TEXT PRIMARY KEY,agent TEXT NOT NULL,
          goal TEXT NOT NULL,input TEXT NOT NULL,mode TEXT NOT NULL,example INTEGER NOT NULL,
          next_at REAL NOT NULL,every_seconds INTEGER NOT NULL,remaining INTEGER NOT NULL,
          enabled INTEGER NOT NULL,created TEXT NOT NULL,last_run TEXT)''')

def timestamp(value):
    parsed=datetime.fromisoformat(value)
    if parsed.tzinfo is None:raise ValueError('Provide a timestamp with timezone')
    return parsed.timestamp()

def create(agent,goal,data,mode,example,first_at,every_seconds=0,max_runs=1):
    at=timestamp(first_at)
    if type(every_seconds) is not int or (every_seconds!=0 and not 60<=every_seconds<=31536000):raise ValueError('Interval must be 0 or between 60 and 31536000 seconds')
    if type(max_runs) is not int or not 1<=max_runs<=100:raise ValueError('Choose 1 to 100 runs')
    if every_seconds==0 and max_runs!=1:raise ValueError('One-time run requires max_runs=1')
    init();schedule=str(uuid.uuid4())
    with db.connect() as c:
        if c.execute('SELECT COUNT(*) FROM schedules WHERE enabled=1').fetchone()[0]>=50:raise ValueError('Limit of 50 active schedules per user')
        c.execute('INSERT INTO schedules VALUES(?,?,?,?,?,?,?,?,?,?,?,NULL)',
          (schedule,agent,goal,db.encode(data),mode,int(example),at,every_seconds,max_runs,1,db.now()))
    return schedule

def list_schedules(agent):
    init()
    with db.connect() as c:
        return [dict(r)|{'input':json.loads(r['input']),'next_at_iso':datetime.fromtimestamp(r['next_at'],timezone.utc).isoformat()} for r in c.execute('SELECT * FROM schedules WHERE agent=? ORDER BY created DESC',(agent,))]

def disable(schedule):
    init()
    with db.connect() as c:return c.execute('UPDATE schedules SET enabled=0 WHERE id=?',(schedule,)).rowcount>0

def tick(now=None,submit=None):
    if now is None:now=time.time()
    if submit is None:
        from agent_runtime import submit
    init();created=[]
    with db.connect() as c:
        c.execute('BEGIN IMMEDIATE')
        for row in c.execute('SELECT * FROM schedules WHERE enabled=1 AND next_at<=? ORDER BY next_at LIMIT 50',(now,)).fetchall():
            key=f"schedule:{row['id']}:{row['next_at']}"
            run,_=db.create_in(c,row['agent'],row['goal'],json.loads(row['input']),row['mode'],bool(row['example']),key)
            remaining=row['remaining']-1;interval=row['every_seconds']
            next_at=row['next_at']+((int((now-row['next_at'])//interval)+1)*interval) if interval else row['next_at']
            c.execute('UPDATE schedules SET next_at=?,remaining=?,enabled=?,last_run=? WHERE id=?',
              (next_at,remaining,int(remaining>0 and interval>0),run,row['id']))
            created.append(run)
        pending=[r[0] for r in c.execute("SELECT id FROM runs WHERE status='queued' ORDER BY created LIMIT 100")]
    # If process stops here, the queued rows survive and are dispatched on the next tick/start.
    for run in pending:submit(run)
    return created

class Scheduler:
    def __init__(self):self.stop_event=Event();self.thread=Thread(target=self.loop,daemon=True,name='schedule-worker')
    def start(self):self.thread.start();return self
    def close(self):self.stop_event.set();self.thread.join(timeout=10)
    def loop(self):
        while not self.stop_event.is_set():
            try:
                for user in identity.scopes():
                    try:
                        with db.scope(user):db.init();tick()
                    except Exception as e:print('Scheduler scope error: '+type(e).__name__,flush=True)
            except Exception as e:
                # No payloads or credentials in server logs.
                print('Scheduler error: '+type(e).__name__,flush=True)
            self.stop_event.wait(5)
