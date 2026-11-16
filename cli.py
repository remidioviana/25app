"""Execute any of the 25 agents without the web interface."""
import argparse
import json
from pathlib import Path
import storage as db
from agent_runtime import SPECS,execute

def main():
    parser=argparse.ArgumentParser(description='25 Agent Studio — individual execution')
    parser.add_argument('agent',choices=sorted(SPECS))
    parser.add_argument('--user',default='default',help='Local operator scope; not HTTP authentication')
    parser.add_argument('--input',type=Path,help='JSON file with your inputs; omission uses a fictional example')
    parser.add_argument('--example',action='store_true',help='Mark JSON inputs as demonstration data')
    parser.add_argument('--goal',help='Goal; local mode uses a fixed tool and structured inputs')
    parser.add_argument('--mode',choices=['local','model','team'],default='local')
    parser.add_argument('--output',type=Path,help='Write complete JSON report')
    args=parser.parse_args();spec=SPECS[args.agent]
    data=json.loads(args.input.read_text(encoding='utf-8')) if args.input else spec['example']
    with db.scope(args.user):
        db.init();run,_=db.create(args.agent,args.goal or spec['goal'],data,args.mode,args.input is None or args.example,None)
        execute(run);result=db.get(run);text=json.dumps(result,ensure_ascii=False,indent=2)
        if args.output:args.output.write_text(text+'\n',encoding='utf-8')
        else:print(text)
    if result['status']!='completed':raise SystemExit(1)

if __name__=='__main__':main()
