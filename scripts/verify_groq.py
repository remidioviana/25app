"""Redacted Groq readiness/catalogue/tool-loop checks. No credential CLI argument.

Default is offline. --live permits authenticated model-list reading;
--probe-models additionally permits at most two short inference calls per role.
"""
import argparse
from datetime import datetime,timezone
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit
import uuid

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import model_provider as provider


def now():return datetime.now(timezone.utc).isoformat()


def tool_probe(role,model,limit,record):
    nonce=uuid.uuid4().hex[:12];ack=f'probe-ok:{nonce}:{role}'
    tool={'type':'function','name':'connection_probe','description':'A nonconsequential connection test. No personal data or external operation.',
          'parameters':{'type':'object','properties':{'nonce':{'type':'string','enum':[nonce]},'role':{'type':'string','enum':[role]}},
                        'required':['nonce','role'],'additionalProperties':False}}
    messages=[{'role':'system','content':'Connection verification only. Call connection_probe exactly once with the supplied nonce and role. After the tool result, reply with its acknowledgement text exactly. Do not invent tool results.'},
              {'role':'user','content':json.dumps({'nonce':nonce,'role':role})}]
    record['logical_completion_requests']=1
    first=provider.respond(messages,[tool],model_override=model,role=role,max_output_tokens=limit,allow_fallback=False,request_timeout=30)
    record['accepted_completions']=1;record['reported_total_tokens']=first['usage']['total_tokens']
    calls=[x for x in first['output'] if x.get('type')=='function_call']
    if len(calls)!=1 or calls[0]['name']!='connection_probe':raise ValueError('The selected model did not produce the required single tool call.')
    if json.loads(calls[0]['arguments'])!={'nonce':nonce,'role':role}:raise ValueError('The model tool arguments did not match the connection probe.')
    record['tool_call_verified']=True;record['logical_completion_requests']=2
    second=provider.respond(messages+first['output']+[{'type':'function_call_output','call_id':calls[0]['call_id'],'output':json.dumps({'acknowledgement':ack})}],
                            [tool],model_override=model,role=role,max_output_tokens=limit,allow_fallback=False,request_timeout=30)
    record['accepted_completions']=2;record['reported_total_tokens']+=second['usage']['total_tokens']
    if any(x.get('type')=='function_call' for x in second['output']) or second['output_text'].strip()!=ack:
        raise ValueError('The model did not acknowledge the actual tool result; the tool roundtrip is unverified.')
    observations=[{'role':role,'usage':first['usage']},{'role':role,'usage':second['usage']}]
    reported={x['usage'].get('provider_reported_model') for x in observations}
    identity=None not in reported and len(reported)==1
    record.update(provider_reported_model=next(iter(reported)) if identity else None,
                  tool_roundtrip_verified=True,model_identity_verified=identity,verified_at=now())
    return record


def verify(live=False,probe_models=False,allow_shared_models=False,max_output_tokens=512):
    report={'checked_at':now(),'check_mode':'offline_configuration_report' if not live else 'live_tool_probes' if probe_models else 'live_catalogue_only',
            'configuration':provider.configuration_status(),'catalogue_verified':False,
            'model_inference_verified':False,'three_distinct_models_verified':False,'role_checks':[],
            'primary_application_workflow_verified':False,'secret_handling':'protected server environment only; no key in report'}
    if probe_models and not live:
        report['error']='Model probes require explicit --live and --probe-models flags.';return report,2
    if not live:return report,0
    if not provider.configured():report['error']='Protected server credential is not configured. No network request was made.';return report,2
    if len(provider._get_keys())>3:report['error']='Use no more than three protected credentials for this bounded verifier.';return report,2
    try:
        base=urlsplit(provider._base_url())
        if base.hostname!='api.groq.com' or base.port not in (None,443) or base.path!='/openai/v1':
            raise ValueError('This verifier accepts only the official Groq HTTPS API base. No credential was sent.')
        models=provider.list_models();report.update(catalogue_verified=True,catalogue_checked_at=now(),available_model_count=len(models),documented_preview_candidate_availability={m:m in models for m in sorted(provider.KNOWN_PREVIEW_MODELS)},configured_model_availability={m:m in models for m in report['configuration'].get('roles',{}).values()})
        if not probe_models:return report,0
        mapping=provider.role_models(require_distinct=not allow_shared_models)
        if any(model not in models for model in mapping.values()):raise ValueError('A configured role model is absent from the authenticated catalogue; no inference probe was started.')
        for role,model in mapping.items():
            record={'role':role,'requested_model':model,'started_at':now(),'accepted_completions':0,
                    'logical_completion_requests':0,'tool_call_verified':False,'tool_roundtrip_verified':False,'model_identity_verified':False,'reported_total_tokens':0}
            report['role_checks'].append(record)
            try:tool_probe(role,model,max_output_tokens,record)
            except (ValueError,RuntimeError) as exc:
                record.update(checked_at=now(),error=str(exc))
                raise ValueError('A role probe failed; full model verification is incomplete.') from None
        report['model_inference_verified']=True
        records=[{'role':row['role'],'usage':{'provider_reported_model':row['provider_reported_model']}} for row in report['role_checks']]
        observed=provider.verified_role_models(records,require_distinct=not allow_shared_models)
        report.update(model_inference_verified=True,three_distinct_models_verified=len(set(observed.values()))==3,
                      observed_role_models=observed,verified_at=now(),reported_total_tokens=sum(x['reported_total_tokens'] for x in report['role_checks']))
        return report,0
    except (ValueError,RuntimeError) as exc:
        report['error']=str(exc);return report,2


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live',action='store_true',help='Permit authenticated GET /models; credentials remain server-side.')
    parser.add_argument('--probe-models',action='store_true',help='Permit two short, potentially billable inference calls per role.')
    parser.add_argument('--allow-shared-models',action='store_true',help='Diagnostic mode: test three roles without claiming three distinct models.')
    parser.add_argument('--max-output-tokens',type=int,default=512,choices=range(128,1025),metavar='128..1024')
    parser.add_argument('--output',type=Path,help='Save redacted evidence to this path; no keys or raw model responses.')
    args=parser.parse_args(argv)
    report,code=verify(args.live,args.probe_models,args.allow_shared_models,args.max_output_tokens)
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if args.output:args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(text)
    print(text,end='');return code


if __name__=='__main__':sys.exit(main())
