"""OpenAI-compatible Groq transport with bounded, thread-safe multi-key failover."""
import json
import os
import re
from http.client import IncompleteRead, RemoteDisconnected
from threading import Lock
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler, HTTPSHandler, ProxyHandler
from urllib.error import HTTPError, URLError

FAST_MODEL='openai/gpt-oss-20b'
AUDIT_MODEL='openai/gpt-oss-120b'
# Backward-compatible defaults, not a declaration of live model availability.
ROLE_MODELS={'planner':FAST_MODEL,'specialist':FAST_MODEL,'critic':AUDIT_MODEL}
ROLE_ENV={'planner':'AGENT_PLANNER_MODEL','specialist':'AGENT_SPECIALIST_MODEL','critic':'AGENT_AUDITOR_MODEL'}
KNOWN_PREVIEW_MODELS={'qwen/qwen3.8-27b'}
_LOCK=Lock()
_KEY_INDEX=0
_KEY_CONFIG=()

def _get_keys():return list(dict.fromkeys(k.strip() for k in os.environ.get('OPENAI_API_KEY','').split(',') if k.strip()))
def _key_order():
    global _KEY_INDEX,_KEY_CONFIG
    keys=_get_keys()
    if not keys:raise ValueError('Configure OPENAI_API_KEY on the server.')
    with _LOCK:
        if tuple(keys)!=_KEY_CONFIG:_KEY_CONFIG=tuple(keys);_KEY_INDEX=0
        start=_KEY_INDEX%len(keys);_KEY_INDEX+=1
    return keys[start:]+keys[:start]
def _next_key():return _key_order()[0]
def configured():return bool(_get_keys())

def _flag(name):
    value=os.environ.get(name,'0').strip().lower()
    if value not in ('0','1','false','true'):raise ValueError(name+' must be 0 or 1.')
    return value in ('1','true')

def _model_name(value):
    if (not isinstance(value,str) or not value.strip() or len(value)>160
        or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._:/-]*',value.strip())
        or value.strip().lower().startswith(('gsk_','sk-','ghp_','ghu_','github_pat_'))):
        raise ValueError('Invalid model identifier; model settings must never contain credentials.')
    return value.strip()

def role_models(require_distinct=None):
    models={role:_model_name(os.environ.get(env,ROLE_MODELS[role])) for role,env in ROLE_ENV.items()}
    strict=_flag('AGENT_REQUIRE_DISTINCT_MODELS') if require_distinct is None else require_distinct
    if strict and len(set(models.values()))!=3:raise ValueError('Three distinct model IDs are required; configure each role separately.')
    if set(models.values())&KNOWN_PREVIEW_MODELS and not _flag('AGENT_ALLOW_PREVIEW_MODELS'):
        raise ValueError('A configured model is Preview; set AGENT_ALLOW_PREVIEW_MODELS=1 only after accepting that evaluation constraint.')
    return models

def configuration_status():
    """Safe metadata only. Key presence and configured IDs never prove inference."""
    present=configured()
    try:
        models=role_models();_base_url()
        return {'status':'configured_unverified' if present else 'missing_credentials','configured':present,
                'configuration_valid':True,'roles':models,'distinct_models':len(set(models.values())),
                'require_distinct':_flag('AGENT_REQUIRE_DISTINCT_MODELS'),'inference_verified':False,
                'preview_roles':[r for r,m in models.items() if m in KNOWN_PREVIEW_MODELS]}
    except ValueError as exc:
        return {'status':'invalid_configuration','configured':present,'configuration_valid':False,
                'roles':{},'distinct_models':0,'inference_verified':False,'error':str(exc)}

def verified_role_models(records,require_distinct=True):
    """Validate provider-reported identity, never infer execution from configured IDs."""
    observed={role:set() for role in ROLE_ENV}
    for record in records:
        role=record.get('role');usage=record.get('usage',{})
        if role in observed:
            if not isinstance(usage,dict) or not usage.get('provider_reported_model'):
                raise ValueError('A role has no provider-reported model identity; distinct execution is unverified.')
            observed[role].add(_model_name(usage['provider_reported_model']))
    if any(len(models)!=1 for models in observed.values()):raise ValueError('Each role must have one consistent provider-reported model identity.')
    result={role:next(iter(models)) for role,models in observed.items()}
    if require_distinct and len(set(result.values()))!=3:raise ValueError('Provider responses did not establish three distinct models.')
    return result

class _NoProviderRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):return None

def urlopen(request,timeout):
    """Honor managed egress/TLS, but never forward provider credentials via redirects."""
    return build_opener(ProxyHandler(),HTTPSHandler(),_NoProviderRedirect()).open(request,timeout=timeout)
def _base_url():
    base=os.environ.get('OPENAI_BASE_URL','https://api.groq.com/openai/v1').rstrip('/')
    if base in ('https://groq.com','https://www.groq.com','https://api.groq.com'):base='https://api.groq.com/openai/v1'
    try:
        parsed=urlparse(base);host=parsed.hostname;port=parsed.port
    except ValueError:raise ValueError('OPENAI_BASE_URL is not a valid HTTPS API origin/base path.') from None
    if (parsed.scheme!='https' or not host or not re.fullmatch(r'[A-Za-z0-9.:-]+',host)
        or parsed.username or parsed.password or parsed.query or parsed.fragment
        or port is not None and not 1<=port<=65535 or any(ord(c)<33 for c in base)):
        raise ValueError('OPENAI_BASE_URL must be an HTTPS API base URL without credentials or query parameters.')
    return base

def _to_chat_messages(messages):
    result=[]
    for message in messages:
        kind=message.get('type')
        if kind=='function_call':
            call={'id':message['call_id'],'type':'function','function':{'name':message['name'],'arguments':message['arguments']}}
            if result and result[-1].get('_pending_tools'):result[-1]['tool_calls'].append(call)
            else:result.append({'role':'assistant','content':None,'tool_calls':[call],'_pending_tools':True})
        elif kind=='function_call_output':result.append({'role':'tool','tool_call_id':message['call_id'],'content':str(message['output'])})
        else:
            content=message.get('content','')
            if isinstance(content,list):content='\n'.join(p.get('text','') for p in content if isinstance(p,dict))
            value={'role':message.get('role','user'),'content':content}
            if 'tool_calls' in message:value['tool_calls']=message['tool_calls']
            if 'tool_call_id' in message:value['tool_call_id']=message['tool_call_id']
            result.append(value)
    for item in result:item.pop('_pending_tools',None)
    return result

def _to_chat_tools(tools):
    return [t if 'function' in t else {'type':'function','function':{'name':t['name'],'description':t.get('description',''),'parameters':t['parameters']}} for t in (tools or [])]

class ProviderFailure(RuntimeError):
    def __init__(self,statuses,codes=None,retry_after=None):
        self.statuses=statuses;self.codes=codes or [];self.retry_after=retry_after
        detail=(' Safe provider codes: '+', '.join(self.codes)+'.') if self.codes else ''
        wait=(' Retry after '+str(retry_after)+' seconds.') if retry_after is not None else ''
        super().__init__('Provider attempts failed: '+', '.join(str(s) for s in statuses)+'.'+detail+wait+' Check server configuration and provider access.')

def _request(endpoint,payload,keys,method='POST',timeout=60):
    statuses=[];codes=[];retry_after=None
    for key in keys:
        request=Request(_base_url()+endpoint,data=None if method=='GET' else json.dumps(payload,allow_nan=False).encode(),method=method,headers={'Authorization':'Bearer '+key,'Content-Type':'application/json','User-Agent':'MobileAgents/7.0'})
        try:
            with urlopen(request,timeout=timeout) as response:return json.load(response)
        except HTTPError as exc:
            status=exc.code
            # Copy only fixed classifications, never raw messages or failed_generation.
            try:
                error=json.loads(exc.read(8192)).get('error',{})
                allowed={'tool_use_failed','invalid_request_error','model_not_found','context_length_exceeded','rate_limit_exceeded','insufficient_quota'}
                code=error.get('code') or error.get('type')
                if code in allowed and code not in codes:codes.append(code)
            except (ValueError,AttributeError,TypeError,UnicodeDecodeError):pass
            value=(exc.headers or {}).get('Retry-After','')
            if isinstance(value,str) and value.isdigit() and 0<=int(value)<=86400:retry_after=int(value)
            exc.close();statuses.append(status)
            if status not in (401,403,429,500,502,503,504):raise ProviderFailure(statuses,codes,retry_after) from None
        except (URLError,TimeoutError,ConnectionError,IncompleteRead,RemoteDisconnected):statuses.append('connection_error')
        except (json.JSONDecodeError,UnicodeDecodeError):raise ValueError('Provider returned invalid JSON.') from None
    raise ProviderFailure(statuses,codes,retry_after)

def list_models():
    raw=_request('/models',None,_key_order(),method='GET',timeout=20)
    if not isinstance(raw,dict) or not isinstance(raw.get('data'),list):raise ValueError('Provider returned an invalid model catalogue.')
    models=[]
    for record in raw['data']:
        if not isinstance(record,dict) or not isinstance(record.get('id'),str):raise ValueError('Provider returned invalid model metadata.')
        model=_model_name(record['id'])
        # Availability and access are tested separately. Do not copy arbitrary metadata.
        if record.get('active') is not False and model not in models:models.append(model)
    return models

def respond(messages,tools,model_override=None,role=None,max_output_tokens=2200,allow_fallback=True,request_timeout=60,required_tool=None):
    keys=_key_order();requested=model_override or os.environ.get('OPENAI_MODEL') or FAST_MODEL
    requested=_model_name(requested)
    if role is not None and role not in ROLE_ENV:raise ValueError('Unknown AI role.')
    if type(max_output_tokens) is not int or not 32<=max_output_tokens<=2200:raise ValueError('Output token limit must be between 32 and 2200.')
    if type(request_timeout) not in (int,float) or not 1<=request_timeout<=60:raise ValueError('Provider request timeout must be between 1 and 60 seconds.')
    payload={'model':requested,'messages':_to_chat_messages(messages),'max_tokens':max_output_tokens,'temperature':0}
    if tools:payload.update(tools=_to_chat_tools(tools),tool_choice='auto')
    if required_tool is not None:
        if (not isinstance(required_tool,str) or not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_-]{0,63}',required_tool)
            or required_tool not in [t['function']['name'] for t in payload.get('tools',[])]):
            raise ValueError('Required tool must name a registered function.')
        payload['tool_choice']={'type':'function','function':{'name':required_tool}}
    fallback=False
    try:raw=_request('/chat/completions',payload,keys,timeout=request_timeout)
    except ProviderFailure as exc:
        # Only the auditor may downgrade, and only when EVERY distinct key returned 429.
        if (not allow_fallback or _flag('AGENT_REQUIRE_DISTINCT_MODELS') or role not in (None,'critic')
            or requested!=AUDIT_MODEL or exc.statuses!=[429]*len(keys)):raise
        payload['model']=FAST_MODEL;raw=_request('/chat/completions',payload,keys,timeout=request_timeout);fallback=True
    if not isinstance(raw,dict):raise ValueError('Provider returned an invalid response envelope.')
    reported=raw.get('model')
    if reported is not None:reported=_model_name(reported)
    choices=raw.get('choices')
    if not isinstance(choices,list) or not choices or not isinstance(choices[0],dict) or not isinstance(choices[0].get('message'),dict):raise ValueError('Provider returned no assistant message.')
    choice=choices[0];message=choice['message'];output=[]
    if choice.get('finish_reason') not in (None,'stop','tool_calls'):
        raise ValueError('Provider response was incomplete or blocked; no result was accepted.')
    if message.get('refusal'):raise ValueError('Provider declined the request; no result was accepted.')
    content=message.get('content')
    if content is not None and not isinstance(content,str):raise ValueError('Provider returned invalid assistant text.')
    if content and content.strip():output.append({'type':'message','role':'assistant','content':[{'type':'output_text','text':content}]})
    calls=message.get('tool_calls')
    if calls is None:calls=[]
    if not isinstance(calls,list):raise ValueError('Provider returned invalid tool calls.')
    seen=set()
    for call in calls:
        if not isinstance(call,dict):raise ValueError('Provider returned an invalid tool call.')
        fn=call.get('function');call_id=call.get('id')
        if (not isinstance(call_id,str) or not call_id.strip() or call_id in seen
            or call.get('type','function')!='function' or not isinstance(fn,dict)
            or not isinstance(fn.get('name'),str) or not fn['name'].strip()
            or not isinstance(fn.get('arguments'),str)):
            raise ValueError('Provider returned an invalid tool call.')
        try:arguments=json.loads(fn['arguments'])
        except (ValueError,RecursionError):raise ValueError('Provider returned invalid tool arguments.') from None
        if not isinstance(arguments,dict):raise ValueError('Provider tool arguments must be a JSON object.')
        seen.add(call_id)
        output.append({'type':'function_call','call_id':call_id,'name':fn['name'],'arguments':fn['arguments']})
    if not output:raise ValueError('Provider returned an empty assistant response.')
    usage=raw.get('usage')
    if usage is None:usage={}
    if not isinstance(usage,dict):raise ValueError('Provider returned invalid usage metadata.')
    for field in ('prompt_tokens','completion_tokens','total_tokens'):
        count=usage.get(field,0)
        if type(count) is not int or count<0:raise ValueError('Provider returned invalid token counts.')
    return {'id':raw.get('id'),'output':output,'output_text':content or '',
      'usage':{'input_tokens':usage.get('prompt_tokens',0),'output_tokens':usage.get('completion_tokens',0),'total_tokens':usage.get('total_tokens',0),
               'requested_model':requested,'model':reported or payload['model'],'request_model_after_fallback':payload['model'],
               'provider_reported_model':reported,'model_identity_evidence':'provider_reported' if reported else 'request_only',
               'fallback':fallback,'fallback_reason':'all_keys_http_429' if fallback else None}}

def embed(texts):
    model=os.environ.get('OPENAI_EMBEDDING_MODEL')
    if not model:raise ValueError('Configure OPENAI_EMBEDDING_MODEL for semantic indexing.')
    if not texts or len(texts)>32 or any(not isinstance(t,str) or not t.strip() or len(t)>4000 for t in texts):raise ValueError('Embeddings accept 1–32 non-empty texts, at most 4,000 characters each.')
    raw=_request('/embeddings',{'model':model,'input':texts},_key_order())
    rows=sorted(raw.get('data',[]),key=lambda x:x['index'])
    if [x['index'] for x in rows]!=list(range(len(texts))):raise ValueError('Incomplete embedding response.')
    return [x['embedding'] for x in rows]
