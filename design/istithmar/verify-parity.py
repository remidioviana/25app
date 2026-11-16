from pathlib import Path
import json
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT))
from domain_tools import setup
cases=[]
for years in (0,0.1,1,3):
    for visas in (0,1,2):
        cases.append({'activity':'software','currency':'AED','years':years,'visas':visas,'options':[{'name':'A','setup_fee':0.005,'annual_fee':6000.05,'visa_fee':2000.005,'activities':['software']},{'name':'B','setup_fee':4000,'annual_fee':5000,'visa_fee':1800,'activities':['software']}]})
js="const fs=require('node:fs');require('./design/istithmar/engine.js');process.stdout.write(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(x=>IstithmarEngine.compareSetup(x))));"
out=subprocess.run(['node','-e',js],input=json.dumps(cases),text=True,cwd=ROOT,capture_output=True,check=True)
for case,result in zip(cases,json.loads(out.stdout),strict=True):
    expected=setup(case)['comparison']
    assert [(r['name'],r['total'],r['activity_match']) for r in result['comparison']]==[(r['name'],format(r['total'],'.2f'),r['eligible_for_activity']) for r in expected]
print(f'PASS: {len(cases)} supported decimal/horizon cases agree with Python totals and activity-list membership.')
