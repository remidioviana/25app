"""Compare valid, unambiguous native/browser inputs with the existing Python tool."""
from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from domain_tools import checklist  # noqa: E402

cases=[]
for as_of in ('2026-11-14','2028-02-29','2000-03-01'):
    for expires in ('','2026-11-13','2026-11-14','2028-03-01'):
        cases.append({'as_of':as_of,'requirements':['passport','income_evidence'],
                      'documents':[{'name':'passport','expires':expires,'reference':'passport.pdf, p.1'}]})
script="const fs=require('node:fs');globalThis.IqamahDossierEngine=undefined;require('./design/iqamah/engine.js');process.stdout.write(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(x=>IqamahDossierEngine.assessDossier(x))));"
proc=subprocess.run(['node','-e',script],input=json.dumps(cases),text=True,cwd=ROOT,capture_output=True,check=True)
for case,actual in zip(cases,json.loads(proc.stdout),strict=True):
    expected=checklist(case)
    assert [{k:row[k] for k in ('requirement','status','reference')} for row in actual['checks']]==expected['checks']
print(f'PASS: {len(cases)} supported-input cases match Python checklist statuses and references. No live service called.')
