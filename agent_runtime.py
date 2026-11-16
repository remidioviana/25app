"""Bounded plan/retrieve/act/verify/report graph with durable event checkpoints.

Local mode executes real pure domain tools; model mode lets the LLM choose retrieval,
memory and domain analysis tools. External writes are deliberately not registered.
"""
import json
import uuid
from threading import Lock
from contextvars import copy_context
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import storage as db
import model_provider
import advanced
import source_tools
from domain_tools import TOOLS
from validation import validate

ROOT=Path(__file__).resolve().parent
SPECS={p.parent.name:json.loads(p.read_text()) for p in sorted((ROOT/'agents').glob('*/agent.json'))}
POOL=ThreadPoolExecutor(max_workers=2,thread_name_prefix='agent')
RUN_LOCKS={}
LOCKS_GUARD=Lock()

class Cancelled(Exception): pass

def check(run,lease):
    record=db.get(run)
    if not record or record['status']!='running' or record['lease']!=lease: raise Cancelled()


PENDING=set()

def submit(run):
    key=(str(db.database_path()),run)
    with LOCKS_GUARD:
        if key in PENDING:return None
        PENDING.add(key)
    context=copy_context()
    def job():
        try:return context.run(execute,run)
        finally:
            with LOCKS_GUARD:PENDING.discard(key)
    try:return POOL.submit(job)
    except Exception:
        with LOCKS_GUARD:PENDING.discard(key)
        raise

def recover():
    with db.connect() as c:
        c.execute("UPDATE runs SET status='queued',phase='recovered' WHERE status='running'")
        pending=[r[0] for r in c.execute("SELECT id FROM runs WHERE status='queued'")]
    for run in pending: submit(run)


def execute(run):
    with LOCKS_GUARD: lock=RUN_LOCKS.setdefault((str(db.database_path()),run),Lock())
    with lock: return _execute(run)

def _execute(run):
    lease=str(uuid.uuid4())
    with db.connect() as c:
        if c.execute("UPDATE runs SET status='running',updated=?,lease=? WHERE id=? AND status='queued'",(db.now(),lease,run)).rowcount!=1: return
    task=db.get(run); agent=task['agent']; spec=SPECS[agent]
    try:
        check(run,lease); validate(task['input'],spec['schema'])
        if task['mode']=='team':
            result=advanced.run(task,spec,lambda:check(run,lease))
            check(run,lease)
            with db.connect() as c:
                changed=c.execute("UPDATE runs SET status='completed',phase='completed',result=?,updated=? WHERE id=? AND status='running' AND lease=?",(db.encode(result),db.now(),run,lease)).rowcount
            if changed: db.emit(run,'completed',{'artifact_hash':db.digest(result),'decision':result['decision']})
            return
        db.emit(run,'planning',{'steps':['validate','retrieve','analyze','verify','report'],'mode':task['mode'],'example':bool(task['example'])})
        evidence=db.search(agent,task['goal']); output=None; narrative=None; usage=[]; called=[];source_reads=[]
        db.emit(run,'retrieving',{'citations':[x['citation'] for x in evidence],'matches':len(evidence)})
        def call(name,args):
            nonlocal output,evidence
            check(run,lease)
            if name==spec['tool']:
                if args: raise ValueError('Domain tools cannot replace the original inputs')
                output=TOOLS[agent](task['input']); value=output
            elif name=='search_knowledge':
                validate(args,{'type':'object','properties':{'query':{'type':'string','maxLength':1000}},'required':['query'],'additionalProperties':False})
                value=db.search(agent,args['query'])
                evidence=list({x['citation']:x for x in evidence+value}.values())
            elif name=='read_memory':
                if args: raise ValueError('read_memory takes no arguments')
                value=db.memory(agent)
            elif name=='list_sources':
                if args:raise ValueError('list_sources takes no arguments')
                value=source_tools.available(agent)
            elif name=='refresh_source':
                validate(args,{'type':'object','properties':{'source_id':{'type':'string','maxLength':64}},'required':['source_id'],'additionalProperties':False})
                value=source_tools.refresh(args['source_id'],agent)
                source_reads.append(value['receipt'])
                evidence=list({x['citation']:x for x in db.current_evidence(agent,evidence)+db.search(agent,task['goal'])}.values())
            else: raise ValueError('Unauthorized tool')
            called.append(name)
            db.emit(run,'acting',{'tool':name,'output_hash':db.digest(value),'output':value})
            return value
        if task['mode']=='local':
            output=call(spec['tool'],{})
        else:
            empty={'type':'object','properties':{},'required':[],'additionalProperties':False}
            tools=[{'type':'function','name':spec['tool'],'description':'Analyzes the mission immutable original inputs. Required before the final response.','parameters':empty,'strict':True},
                   {'type':'function','name':'read_memory','description':'Reads up to three user-accepted, non-demo results from this app. Historical context, not current facts.','parameters':empty,'strict':True},
                   {'type':'function','name':'search_knowledge','description':'Searches the app supplied documents, not the internet.','parameters':{'type':'object','properties':{'query':{'type':'string'}},'required':['query'],'additionalProperties':False},'strict':True}]
            if source_tools.available(agent):
                tools.extend([
                  {'type':'function','name':'list_sources','description':'Lists fixed public sources permitted for this app. Availability is not successful retrieval.','parameters':empty,'strict':True},
                  {'type':'function','name':'refresh_source','description':'Reads one permitted fixed public source into this app evidence store. No user URLs or external writes. Inspect actual receipt and source passages; retrieval does not establish legal applicability.','parameters':{'type':'object','properties':{'source_id':{'type':'string'}},'required':['source_id'],'additionalProperties':False},'strict':True}])
            messages=[{'role':'system','content':spec['instructions']}, {'role':'user','content':db.encode({'goal':task['goal'],'data':task['input'],'retrieved_evidence':evidence,'available_public_sources':source_tools.available(agent)})}]
            for turn in range(8):
                check(run,lease); response=model_provider.respond(messages,tools,model_override=model_provider.role_models()['specialist'],role='specialist'); check(run,lease)
                usage.append(response.get('usage',{})); messages.extend(response.get('output',[]))
                db.emit(run,'model',{'turn':turn+1,'usage':response.get('usage',{})})
                calls=[x for x in response.get('output',[]) if x.get('type')=='function_call']
                if not calls:
                    if output is None:
                        messages.append({'role':'user','content':'Execute the domain tool before finishing.'}); continue
                    narrative='\n'.join(p.get('text','') for x in response.get('output',[]) if x.get('type')=='message' for p in x.get('content',[]) if p.get('type')=='output_text')
                    if narrative: break
                    raise ValueError('Model returned no final text')
                for c in calls:
                    if len(called)>=12: raise ValueError('Twelve-tool-call limit reached')
                    try: value=call(c['name'],json.loads(c['arguments']))
                    except (ValueError,KeyError,TypeError,PermissionError) as e:
                        value={'error':str(e)}; called.append('invalid_call'); db.emit(run,'tool_error',value)
                    messages.append({'type':'function_call_output','call_id':c['call_id'],'output':db.encode(value)})
            else: raise ValueError('Eight-round limit reached; execution stopped')
        check(run,lease)
        # Recompute the pure tool: independently compare the persisted artifact to its inputs.
        verification=TOOLS[agent](task['input'])
        if len(db.current_evidence(agent,evidence))!=len(evidence):raise ValueError('A public source version changed during this task; review current evidence and rerun')
        if output is None or db.digest(output)!=db.digest(verification): raise ValueError('Result verification failed')
        db.emit(run,'verifying',{'input_hash':db.digest(task['input']),'output_hash':db.digest(output),'recomputed':True})
        result={'agent':agent,'goal':task['goal'],'mode':task['mode'],'example':bool(task['example']),
                'analysis':output,'narrative':narrative,'evidence':evidence,'usage':usage,
                'input_hash':db.digest(task['input']),'analysis_hash':db.digest(output),
                'external_actions_performed':False,'external_reads_performed':bool(source_reads),'source_reads':source_reads,
                'limits':['Source retrieval timestamps do not establish legal applicability or publication currency.', 'AI narrative, when present, is separate from verifiable calculations.']}
        with db.connect() as c:
            changed=c.execute("UPDATE runs SET status='completed',phase='completed',result=?,updated=? WHERE id=? AND status='running' AND lease=?",(db.encode(result),db.now(),run,lease)).rowcount
        if changed: db.emit(run,'completed',{'artifact_hash':db.digest(result),'message':'Local artifact ready for review'})
    except Cancelled: pass
    except Exception as e:
        message=str(e) if isinstance(e,(ValueError,RuntimeError)) else 'Internal validation or execution failure: '+type(e).__name__
        with db.connect() as c:
            c.execute("UPDATE runs SET status='failed',phase='failed',error=?,updated=? WHERE id=? AND status='running' AND lease=?",(message,db.now(),run,lease))
        db.emit(run,'failed',{'message':message})
