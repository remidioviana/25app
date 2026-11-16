"""Typed local export adapters. No remote system mutation or fabricated receipts."""
import csv
from dataclasses import dataclass
from datetime import date
import hashlib
import io
import json

@dataclass(frozen=True)
class Artifact:
    filename:str
    mime_type:str
    content:bytes
    @property
    def sha256(self):return hashlib.sha256(self.content).hexdigest()

def scalar(value):
    return json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else str(value if value is not None else '')

def safe_cell(value):
    s=scalar(value)
    return "'"+s if s.lstrip().startswith(('=','+','-','@','\t','\r')) else s

def json_section(title, value):
    """Keep embedded backticks in supplied/model text inside the JSON block."""
    text=json.dumps(value,ensure_ascii=False,indent=2)
    fence='```'
    while fence in text:fence+='`'
    return ['## '+title,'',fence+'json',text,fence,'']

def markdown(run):
    result=run['result'];lines=[f"# {run['agent']} — report",'',f"Run: `{run['id']}`",'',
      f"Demo data: {'yes' if run['example'] else 'no'}",'', '## Goal','',run['goal'],'']
    lines+=json_section('Verifiable analysis',result['analysis'])
    if result.get('narrative'):lines+=['## AI synthesis','',result['narrative'],'']
    for title,key in [('Plan','plan'),('Structured claims and next steps','draft'),('Model review','critique')]:
        if result.get(key):lines+=json_section(title,result[key])
    if result.get('usage'):
        # Export an allowlist, never arbitrary provider metadata or credentials.
        roles=[]
        for item in result['usage']:
            if not isinstance(item,dict):continue
            usage=item.get('usage')
            if not isinstance(usage,dict):usage={}
            roles.append({'role':item.get('role'),'usage':{key:usage[key] for key in
              ('model','requested_model','provider_reported_model','request_model_after_fallback','model_identity_evidence','fallback','fallback_reason','total_tokens') if key in usage}})
        lines+=json_section('Recorded model routing',roles)
    if result.get('retrieval_warnings'):lines+=json_section('Retrieval warnings',result['retrieval_warnings'])
    if result.get('source_reads'):
        fields=('source_id','url','authority','fetched_at','http_status','content_type','raw_sha256','text_sha256',
                'publication_date_verified','legal_applicability_verified','status','document_id','warnings')
        lines+=json_section('Public-source read receipts',[
            {key:item[key] for key in fields if key in item}
            for item in result['source_reads'] if isinstance(item,dict)])
    lines+=json_section('Review status',{'model_decision':result.get('decision','not_recorded'),
      'human_review':run.get('review','not_recorded')})
    lines+=['Model review is not factual certification. Citation IDs link recorded evidence; they do not establish support or freshness.','', '## Evidence','']
    for e in result.get('evidence',[]):lines += [f"### {e['title']}",f"Reference: {e['citation']} | Source: {e['source']} | Supplied publication date: {e['as_of'] or 'not recorded'} | Retrieved: {e.get('retrieved_at') or 'not recorded'}",'',e['text'],'']
    lines+=['## Limits','',*['- '+x for x in result.get('limits',[])],'']
    if result.get('external_actions_performed') is False:
        lines+=['External public sources were read; no external write was performed.' if result.get('external_reads_performed') else 'No external action was performed.','']
    else:lines+=['External-action status: '+('reported as performed; verify execution receipts' if result.get('external_actions_performed') is True else 'not recorded')+'.','']
    lines+=[f"Analysis hash: `{result['analysis_hash']}`"]
    return Artifact(f"{run['agent']}-{run['id']}.md",'text/markdown; charset=utf-8','\n'.join(lines).encode())

def tabular(run):
    out=io.StringIO(newline='');w=csv.writer(out);w.writerow(['section','item','field','value'])
    for key,value in run['result']['analysis'].items():
        if isinstance(value,list):
            for i,row in enumerate(value):
                for field,v in (row.items() if isinstance(row,dict) else [('value',row)]):w.writerow([safe_cell(key),i,safe_cell(field),safe_cell(v)])
        else:w.writerow([safe_cell(key),'','value',safe_cell(value)])
    return Artifact(f"{run['agent']}-{run['id']}.csv",'text/csv; charset=utf-8',out.getvalue().encode('utf-8-sig'))

def ics_text(s):return str(s).replace('\\','\\\\').replace('\r','').replace('\n','\\n').replace(';','\\;').replace(',','\\,')
def fold(line):
    parts=[];current='';size=0
    for char in line:
        n=len(char.encode())
        if size+n>75:parts.append(current);current=' ';size=1
        current+=char;size+=n
    parts.append(current);return '\r\n'.join(parts)

def calendar(run,day):
    if run['agent'] not in ('rafiq','sawm'):raise ValueError('Calendar export is available only for Rafiq and Sawm')
    parsed=date.fromisoformat(day);stamp=parsed.strftime('%Y%m%d')
    lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Agent Studio//Local Export//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH']
    for i,block in enumerate(run['result']['analysis']['planned_blocks']):
        lines+=['BEGIN:VEVENT',f"UID:{run['id']}-{i}@agent-studio.local",'DTSTAMP:'+run['created'][:19].replace('-','').replace(':','')+'Z',
          f"DTSTART:{stamp}T{block['start'].replace(':','')}00",f"DTEND:{stamp}T{block['end'].replace(':','')}00",'SUMMARY:'+ics_text(block['title']),
          'DESCRIPTION:'+ics_text('Local plan with floating times; confirm the timezone when importing.'),'END:VEVENT']
    lines+=['END:VCALENDAR']
    return Artifact(f"{run['agent']}-{run['id']}.ics",'text/calendar; charset=utf-8',('\r\n'.join(fold(l) for l in lines)+'\r\n').encode())

def export(run,format,day=None):
    if not run or run['status']!='completed' or not run['result']:raise ValueError('Run has no completed result')
    if format=='markdown':return markdown(run)
    if format=='csv':return tabular(run)
    if format=='ics':
        if not day:raise ValueError('Provide date=YYYY-MM-DD to export the calendar')
        return calendar(run,day)
    raise ValueError('Unknown export format')
