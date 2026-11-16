"""OpenAI-compatible Groq transport with bounded, thread-safe multi-key failover."""
import json
import os
from http.client import IncompleteRead, RemoteDisconnected
from threading import Lock
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

FAST_MODEL='llama-3.3-70b-versatile'
AUDIT_MODEL='openai/gpt-oss-120b'
ROLE_MODELS={'planner':FAST_MODEL,'specialist':FAST_MODEL,'critic':AUDIT_MODEL}
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
def _base_url():
    base=os.environ.get('OPENAI_BASE_URL','https://api.groq.com/openai/v1').rstrip('/')
    if base in ('https://groq.com','https://www.groq.com','https://api.groq.com'):base='https://api.groq.com/openai/v1'
    parsed=urlparse(base)
    if parsed.scheme!='https' or not parsed.netloc or parsed.username or parsed.password or parsed.query or parsed.fragment:
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
    def __init__(self,statuses):
        self.statuses=statuses
        super().__init__('Provider attempts failed: '+', '.join(str(s) for s in statuses)+'. Check server configuration and provider access.')

def _request(endpoint,payload,keys):
    statuses=[]
    for key in keys:
        request=Request(_base_url()+endpoint,data=json.dumps(payload,allow_nan=False).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json','User-Agent':'MobileAgents/6.0'})
        try:
            with urlopen(request,timeout=60) as response:return json.load(response)
        except HTTPError as exc:
            status=exc.code;exc.close();statuses.append(status)
            if status not in (401,403,429,500,502,503,504):raise ProviderFailure(statuses) from None
        except (URLError,TimeoutError,ConnectionError,IncompleteRead,RemoteDisconnected):statuses.append('connection_error')
        except (json.JSONDecodeError,UnicodeDecodeError):raise ValueError('Provider returned invalid JSON.') from None
    raise ProviderFailure(statuses)

def respond(messages,tools,model_override=None):
    keys=_key_order();requested=model_override or os.environ.get('OPENAI_MODEL') or FAST_MODEL
    if not isinstance(requested,str) or not requested.strip():raise ValueError('Invalid model name.')
    payload={'model':requested,'messages':_to_chat_messages(messages),'max_tokens':2200,'temperature':0}
    if tools:payload.update(tools=_to_chat_tools(tools),tool_choice='auto')
    fallback=False
    try:raw=_request('/chat/completions',payload,keys)
    except ProviderFailure as exc:
        # Only the auditor may downgrade, and only when EVERY distinct key returned 429.
        if requested!=AUDIT_MODEL or exc.statuses!=[429]*len(keys):raise
        payload['model']=FAST_MODEL;raw=_request('/chat/completions',payload,keys);fallback=True
    if not isinstance(raw,dict):raise ValueError('Provider returned an invalid response envelope.')
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
               'requested_model':requested,'model':payload['model'],'fallback':fallback,'fallback_reason':'all_keys_http_429' if fallback else None}}

def embed(texts):
    model=os.environ.get('OPENAI_EMBEDDING_MODEL')
    if not model:raise ValueError('Configure OPENAI_EMBEDDING_MODEL for semantic indexing.')
    if not texts or len(texts)>32 or any(not isinstance(t,str) or not t.strip() or len(t)>4000 for t in texts):raise ValueError('Embeddings accept 1–32 non-empty texts, at most 4,000 characters each.')
    raw=_request('/embeddings',{'model':model,'input':texts},_key_order())
    rows=sorted(raw.get('data',[]),key=lambda x:x['index'])
    if [x['index'] for x in rows]!=list(range(len(texts))):raise ValueError('Incomplete embedding response.')
    return [x['embedding'] for x in rows]
