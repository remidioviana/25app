"""Read official sources and exercise lots 2–5 with explicitly controlled model roles.

No Groq calls or credentials. Public HTTP requires --live-sources.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
import json
import os
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
import advanced
import agent_runtime as engine
import source_tools
import storage as db


def controlled_role(name,schema,context,instructions):
    usage={'total_tokens':0,'model_identity_evidence':'controlled_fixture','inference_performed':False}
    if schema is advanced.FINAL_RESPONSE:
        return {'outcome':'inconclusive','draft':{'summary':'Controlled final resolution; no provider inference or authentic-case acceptance.','claims':[],'next_steps':[]},
                'questions':[],'limitations':['This controlled diagnostic does not certify a customer outcome.']},usage
    if name=='planner':return {'objective':'Controlled source trace','queries':[context['goal']],'steps':['Retrieve','Calculate','Review'],'missing_information':[],'source_ids':[]},usage
    if name=='specialist':
        item=context['evidence'][0]
        return {'summary':'Controlled draft from recorded source.','claims':[{'text':'Recorded excerpt: '+item['text'][:250],'basis':'evidence','citations':[item['citation']]}],'next_steps':[]},usage
    return {'verdict':'revise','issues':['Exercise bounded final-resolution path.'],'follow_up_queries':[]},usage


def verify(batch,apps=None):
    products=json.loads((ROOT/'project/portfolio.json').read_text())['products']
    selected=products[5:] if batch=='remaining' else products[(int(batch)-1)*5:int(batch)*5]
    if apps:
        if not set(apps)<={x['id'] for x in selected}:raise ValueError('Selected apps must belong to the requested lot.')
        selected=[x for x in selected if x['id'] in apps]
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'batch':batch,'input_kind':'repository synthetic examples',
            'source_transport':'live fixed official HTTPS URLs','model_roles':'controlled test callbacks; no provider inference',
            'provider_inference_performed':False,'primary_workflows_verified':False,'device_verified':False,'apps':[]}
    old=db.DB
    try:
      with tempfile.TemporaryDirectory(prefix='25app-remaining-') as directory:
        db.DB=Path(directory)/'diagnostic.sqlite3'
        def run(product):
          agent=product['id'];row={'app':agent,'order':product['order'],'public_source_read_verified':False,'controlled_graph_verified':False}
          choices=source_tools.available(agent)
          if not choices:row['error']='No reviewed official source configured';return row
          chosen=next((x for x in choices if agent=='gurbah' and x['id']=='dewa-move-in'),choices[0]);row['source_id']=chosen['id']
          with db.scope(agent):
            db.init()
            try:
              source=source_tools.refresh(chosen['id'],agent);row['source_receipt']=source['receipt'];row['public_source_read_verified']=True
              cfg=source_tools.CATALOG[chosen['id']];query=' '.join(cfg.get('anchors',['activation']))
              evidence=db.search(agent,query);row['retrieved_passages']=len(evidence)
              if not evidence:raise ValueError('Fetched source produced no retrievable passages')
              run_id,_=db.create(agent,product['primary_task']+' Source trace query: '+query,engine.SPECS[agent]['example'],'team',True,None)
              engine.execute(run_id);saved=db.get(run_id)
              if saved['status']!='completed':raise ValueError(saved['error'] or 'Controlled graph failed')
              result=saved['result'];row['controlled_engine_decision']=result['decision']
              row['controlled_role_calls']=len(result['usage']);row['artifact_sha256']=db.digest(result)
              row['controlled_graph_verified']=result['decision']=='inconclusive' and result.get('final_response',{}).get('outcome')=='inconclusive'
              import exports
              artifact=exports.export(saved,'markdown');row['markdown_sha256']=artifact.sha256
              row['manual_review_requested']=result['decision']=='requires_human_review'
            except (ValueError,RuntimeError,PermissionError) as error:
              row['error']=str(error)
              row['source_attempts']=source_tools.receipts(agent)
          return row
        with patch.dict(os.environ,{'AGENT_SEMANTIC_SEARCH':'0','AGENT_REQUIRE_DISTINCT_MODELS':'0'}),patch.object(advanced,'role',side_effect=controlled_role),ThreadPoolExecutor(max_workers=4) as pool:
          report['apps']=list(pool.map(run,selected))
    finally:db.DB=old
    report['public_source_reads_passed']=sum(x['public_source_read_verified'] for x in report['apps'])
    report['controlled_graphs_passed']=sum(x['controlled_graph_verified'] for x in report['apps'])
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--batch',choices=['2','3','4','5','remaining'],default='remaining');parser.add_argument('--app',action='append',choices=list(engine.SPECS));parser.add_argument('--live-sources',action='store_true');parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    if not args.live_sources:parser.error('Public HTTP is opt-in; add --live-sources (no model inference).')
    report=verify(args.batch,args.app);args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ('batch','public_source_reads_passed','controlled_graphs_passed')}))
    for row in report['apps']:print(row['app'],row.get('error','passed controlled graph'))
    raise SystemExit(0 if all(x['controlled_graph_verified'] for x in report['apps']) else 2)
