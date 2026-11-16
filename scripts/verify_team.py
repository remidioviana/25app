"""Opt-in live first-lot graph/RAG diagnostic with synthetic inputs and public sources.

No live request without --live. This is not primary-domain or device acceptance.
"""
import argparse
import json
from pathlib import Path
import sys
import tempfile
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import model_provider as provider

FIRST_FIVE={'himayah':('uae-pdpl','personal data'),
            'iqamah':('icp-golden-residency','requirements'),
            'istithmar':('dmcc-charges','charges'),
            'munagasah':('dubai-esupply','supplier'),
            'sahil':('dewa-move-in','activation')}


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
            'model_review_decision':result.get('decision'),'artifact_sha256':db.digest(result),
            'factual_correctness_verified':False,'primary_domain_workflow_verified':False}


def verify(live=False,app=None,reviewed_snapshot=False):
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'live_requested':live,
            'input_kind':'repository synthetic examples, not authentic user documents',
            'retrieval_mode':'BM25 over fixed official sources; no embedding calls',
            'reviewed_himayah_snapshot_requested':reviewed_snapshot,
            'primary_domain_workflows_verified':False,'device_verified':False,'apps':[]}
    if not live:return report,0
    if not provider.configured():report['error']='Protected provider credential is missing; no network request was made.';return report,2
    from urllib.parse import urlsplit
    base=urlsplit(provider._base_url())
    if base.hostname!='api.groq.com' or base.port not in (None,443) or base.path!='/openai/v1':
        report['error']='Only the official Groq HTTPS API base is accepted; no credential was sent.';return report,2
    provider.role_models()
    import advanced
    import agent_runtime as engine
    import source_tools
    import storage as db
    from domain_tools import TOOLS
    if not advanced.available():report['error']='Install requirements-agentic.txt before live verification.';return report,2
    old_db=db.DB
    try:
        with tempfile.TemporaryDirectory(prefix='25app-team-') as directory:
            db.DB=Path(directory)/'diagnostic.sqlite3';db.init()
            quota_stopped=False
            for agent,(source_id,query) in FIRST_FIVE.items():
                if app and app!=agent:continue
                row={'app':agent,'source_id':source_id,'graph_rag_diagnostic_verified':False}
                report['apps'].append(row)
                if quota_stopped:
                    row['error']='Not attempted after a provider quota failure; wait before another run.';continue
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
                    row['completed_roles']=[e['phase'] for e in role_events]
                    row['completed_role_details']=[{'role':e['phase'],'provider_reported_model':e['detail'].get('usage',{}).get('provider_reported_model'),
                        'response_contract':e['detail'].get('usage',{}).get('response_contract'),'reported_total_tokens':e['detail'].get('usage',{}).get('total_tokens',0)} for e in role_events]
                    row['reported_total_tokens']=sum(e['detail'].get('usage',{}).get('total_tokens',0) for e in role_events)
                    row['usage_scope']='accepted role results only; failed requests may consume additional quota'
                    if record['status']!='completed':
                        row['error']=record['error'];quota_stopped='Provider attempts failed: 429' in (record['error'] or '')
                        continue
                    row.update(assess(record['result'],data,TOOLS[agent](data)))
                except (ValueError,RuntimeError,PermissionError) as exc:
                    row['error']=str(exc)
    finally:db.DB=old_db
    report['verified_at']=datetime.now(timezone.utc).isoformat()
    report['reported_total_tokens']=sum(x.get('reported_total_tokens',0) for x in report['apps'])
    return report,0 if report['apps'] and all(x['graph_rag_diagnostic_verified'] for x in report['apps']) else 2


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live',action='store_true',help='Permit public source reads and potentially billable graph inference (up to seven role calls per app).')
    parser.add_argument('--app',choices=list(FIRST_FIVE),help='Limit to a single first-lot app; default is all five.')
    parser.add_argument('--reviewed-himayah-snapshot',action='store_true',help='Explicitly use repository-reviewed historical PDPL snapshot; no fresh-fetch claim or silent fallback.')
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    report,code=verify(args.live,args.app,args.reviewed_himayah_snapshot)
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if args.output:args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(text)
    print(text,end='');return code


if __name__=='__main__':sys.exit(main())
