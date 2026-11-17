"""Opt-in live per-lot graph/RAG diagnostic with synthetic inputs and public sources.

No live request without --live. This is not primary-domain or device acceptance.
"""
import argparse
import json
import re
from pathlib import Path
import sys
import tempfile
import time
from contextlib import contextmanager
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import model_provider as provider

FIRST_FIVE={'himayah':('uae-pdpl','personal data'),
            'iqamah':('icp-golden-residency','requirements'),
            'istithmar':('dmcc-charges','charges'),
            'munagasah':('dubai-esupply','supplier'),
            'sahil':('dewa-move-in','activation')}

from source_catalog import ADDITIONAL_SOURCES
APP_SOURCES=dict(FIRST_FIVE)
for entry in json.loads((ROOT/'apps/apps.json').read_text())[5:]:
    agent=entry['id']
    if agent=='gurbah':APP_SOURCES[agent]=('dewa-move-in','activation')
    else:
        source_id,cfg=next((key,cfg) for key,cfg in ADDITIONAL_SOURCES.items() if agent in cfg['agents'])
        APP_SOURCES[agent]=(source_id,' '.join(cfg['anchors']))


def quota_failure(error):
    return bool(re.search(r'Provider attempts failed: [^.]*\b429\b',error or ''))


def assess(result,original_input,expected_analysis):
    import storage as db
    usage=result.get('usage',[])
    identities=provider.verified_role_models(usage,require_distinct=False)
    evidence={x['citation'] for x in result.get('evidence',[])}
    claims=result.get('draft',{}).get('claims',[])
    cited={c for claim in claims if claim.get('basis')=='evidence' for c in claim.get('citations',[])}
    checks={'synthetic_input_preserved':result.get('input_hash')==db.digest(original_input),
            'domain_tool_recomputed':result.get('analysis_hash')==db.digest(expected_analysis) and result.get('analysis')==expected_analysis,
            'evidence_retrieved':bool(evidence),
            'retrieved_evidence_cited':bool(cited) and cited<=evidence,
            'three_roles_responded':set(x.get('role') for x in usage)=={'planner','specialist','critic'},
            'no_external_write':result.get('external_actions_performed') is False}
    return {'checks':checks,'graph_rag_diagnostic_verified':all(checks.values()),
            'observed_role_models':identities,'three_distinct_models_verified':len(set(identities.values()))==3,
            'retrieved_passages':len(evidence),'cited_passages':len(cited),'role_calls':len(usage),
            'reported_total_tokens':sum(x.get('usage',{}).get('total_tokens',0) for x in usage),
            'final_response_outcome':(result.get('final_response') or {}).get('outcome'),
            'final_role_reported_model':usage[-1].get('usage',{}).get('provider_reported_model') if usage else None,
            'model_review_decision':result.get('decision'),'prior_valid_draft_retained':result.get('prior_valid_draft_retained',False),
            'unresolved_draft_validation':result.get('unresolved_draft_validation',[]),'artifact_sha256':db.digest(result),
            'factual_correctness_verified':False,'primary_domain_workflow_verified':False}


@contextmanager
def paced_roles(seconds):
    """Single-process diagnostic pacing; never changes production runtime defaults."""
    if type(seconds) is not int or not 0<=seconds<=60:raise ValueError('Role request interval must be an integer from 0 to 60 seconds.')
    original=provider.respond
    last_finished=None
    def call(*args,**kwargs):
        nonlocal last_finished
        if last_finished is not None:
            wait=seconds-(time.monotonic()-last_finished)
            if wait>0:time.sleep(wait)
        try:return original(*args,**kwargs)
        finally:last_finished=time.monotonic()
    provider.respond=call
    try:yield
    finally:provider.respond=original


def pause_between_apps(last_finished,seconds):
    if last_finished is None:return
    wait=seconds-(time.monotonic()-last_finished)
    if wait>0:time.sleep(wait)


def save_checkpoint(report,path):
    if path is None:return
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    temporary=path.with_name(path.name+'.tmp')
    temporary.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    temporary.replace(path)


def verify(live=False,app=None,reviewed_snapshot=False,min_role_interval_seconds=15,excluded_apps=None,lot=1,min_app_interval_seconds=30,checkpoint_path=None):
    excluded=set(excluded_apps or [])
    selected=set(list(APP_SOURCES)[(lot-1)*5:lot*5]) if app is None else {app} if isinstance(app,str) else set(app)
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'live_requested':live,
            'input_kind':'repository synthetic examples, not authentic user documents',
            'retrieval_mode':'BM25 over fixed official sources; no embedding calls',
            'reviewed_himayah_snapshot_requested':reviewed_snapshot,
            'minimum_app_interval_seconds':min_app_interval_seconds,'minimum_role_interval_seconds':min_role_interval_seconds,'excluded_apps':sorted(excluded),'selected_apps':sorted(selected),
            'primary_domain_workflows_verified':False,'device_verified':False,'in_progress':True,'requested_lot':lot,'apps':[]}
    if lot not in range(1,6) or not selected or len(selected)>5 or not selected<=set(APP_SOURCES):report['error']='Select one portfolio lot or up to five known apps.';return report,2
    if not excluded<=set(APP_SOURCES):report['error']='Unknown excluded app.';return report,2
    if type(min_app_interval_seconds) is not int or not 0<=min_app_interval_seconds<=60:
        report['error']='App interval must be an integer from 0 to 60 seconds.';return report,2
    if not live:return report,0
    if not provider.configured():report['error']='Protected provider credential is missing; no network request was made.';return report,2
    if len(provider._get_keys())>3:report['error']='Use no more than three protected credentials for this bounded diagnostic.';return report,2
    from urllib.parse import urlsplit
    try:
        base=urlsplit(provider._base_url());provider.role_models()
    except ValueError as exc:report['error']=str(exc);return report,2
    if base.hostname!='api.groq.com' or base.port not in (None,443) or base.path!='/openai/v1':
        report['error']='Only the official Groq HTTPS API base is accepted; no credential was sent.';return report,2
    import advanced
    import agent_runtime as engine
    import source_tools
    import storage as db
    from domain_tools import TOOLS
    if not advanced.available():report['error']='Install requirements-agentic.txt before live verification.';return report,2
    old_db=db.DB
    try:
        with tempfile.TemporaryDirectory(prefix='25app-team-') as directory,paced_roles(min_role_interval_seconds):
            db.DB=Path(directory)/'diagnostic.sqlite3';db.init()
            quota_stopped=False;last_app_finished=None
            for agent,(source_id,query) in APP_SOURCES.items():
                if agent in excluded or agent not in selected:continue
                row={'app':agent,'source_id':source_id,'graph_rag_diagnostic_verified':False}
                report['apps'].append(row)
                if quota_stopped:
                    row['skipped_after_quota']=True;row['error']='Not attempted after a provider quota failure; wait before another run.';continue
                pause_between_apps(last_app_finished,min_app_interval_seconds)
                try:
                    if reviewed_snapshot and agent=='himayah':
                        from scripts.reviewed_snapshot import ingest
                        source=ingest(source_id,agent)
                    else:source=source_tools.refresh(source_id,agent)
                    row['source_receipt']=source['receipt']
                    goal=('Integration diagnostic using SYNTHETIC example inputs, not an authentic customer case. '
                          'Execute domain analysis and distinguish it from current official source facts. '
                          'The public source has already been ingested. A title marked reviewed snapshot is historical; do not claim it was fetched now or legally current. Search for '+query+'. '
                          'Cite at least one relevant retrieved passage for a narrowly supported source claim. '
                          'Never claim legal applicability, eligibility, live prices or completed external actions. '
                          'Keep your summary and claims short. State limitations and missing information.')
                    data=engine.SPECS[agent]['example']
                    run,_=db.create(agent,goal,data,'team',True,None)
                    engine.execute(run);record=db.get(run);row['run_status']=record['status']
                    role_events=[e for e in record['events'] if e['phase'] in ('planner','specialist','critic')]
                    row['validation_rejections']=sum(e['phase']=='draft_rejected' for e in record['events'])
                    row['completed_roles']=[e['phase'] for e in role_events]
                    row['completed_role_details']=[{'role':e['phase'],'provider_reported_model':e['detail'].get('usage',{}).get('provider_reported_model'),
                        'response_contract':e['detail'].get('usage',{}).get('response_contract'),
                        'structured_generation_retries':e['detail'].get('usage',{}).get('structured_generation_retries',0),
                        'structured_generation_retry_reason':e['detail'].get('usage',{}).get('structured_generation_retry_reason'),'reported_total_tokens':e['detail'].get('usage',{}).get('total_tokens',0)} for e in role_events]
                    row['reported_total_tokens']=sum(e['detail'].get('usage',{}).get('total_tokens',0) for e in role_events)
                    row['usage_scope']='accepted role results only; failed requests may consume additional quota'
                    if record['status']!='completed':
                        row['error']=record['error'];quota_stopped=quota_failure(record['error'])
                        continue
                    row.update(assess(record['result'],data,TOOLS[agent](data)))
                except (ValueError,RuntimeError,PermissionError) as exc:
                    row['error']=str(exc)
                finally:
                    last_app_finished=time.monotonic()
                    report['quota_exhausted']=quota_stopped
                    if checkpoint_path is not None:
                        save_checkpoint(report,checkpoint_path)
                        print('APP_PROGRESS '+json.dumps(row,ensure_ascii=False),flush=True)
    finally:db.DB=old_db
    report['quota_exhausted']=quota_stopped
    report['in_progress']=False
    report['verified_at']=datetime.now(timezone.utc).isoformat()
    report['reported_total_tokens']=sum(x.get('reported_total_tokens',0) for x in report['apps'])
    return report,0 if report['apps'] and all(x['graph_rag_diagnostic_verified'] for x in report['apps']) else 2


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live',action='store_true',help='Permit public source reads and potentially billable graph inference (bounded role calls per app with separate JSON-generation recovery).')
    parser.add_argument('--app',action='append',choices=list(APP_SOURCES),help='Select up to five apps; otherwise use --lot.')
    parser.add_argument('--reviewed-himayah-snapshot',action='store_true',help='Explicitly use repository-reviewed historical PDPL snapshot; no fresh-fetch claim or silent fallback.')
    parser.add_argument('--min-role-interval-seconds',type=int,default=15,choices=range(0,61),metavar='0..60',help='Diagnostic-only pacing between completed role requests; production defaults are unchanged.')
    parser.add_argument('--exclude-app',action='append',choices=list(APP_SOURCES),default=[],help='Skip an app already verified separately; repeat for multiple exclusions.')
    parser.add_argument('--min-app-interval-seconds',type=int,choices=range(0,61),default=30)
    parser.add_argument('--lot',type=int,choices=range(1,6),default=1)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    report,code=verify(args.live,args.app,args.reviewed_himayah_snapshot,args.min_role_interval_seconds,args.exclude_app,args.lot,args.min_app_interval_seconds,args.output)
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if args.output:save_checkpoint(report,args.output)
    print(text,end='');return code


if __name__=='__main__':sys.exit(main())
