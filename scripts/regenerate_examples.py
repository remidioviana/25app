"""Execute all fictional examples in an isolated temporary database."""
import os,tempfile,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
with tempfile.TemporaryDirectory(prefix='agent-examples-') as temp:
 os.environ['AGENT_DATA_DIR']=temp
 import storage as db,agent_runtime as runtime,exports
 db.init()
 for agent,spec in sorted(runtime.SPECS.items()):
  run,_=db.create(agent,spec['goal'],spec['example'],'local',True,None);runtime.execute(run);result=db.get(run)
  assert result['status']=='completed',(agent,result['error'])
  (ROOT/'examples'/f'{agent}.input.json').write_text(json.dumps(spec['example'],ensure_ascii=False,indent=2)+'\n')
  (ROOT/'examples'/f'{agent}.result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
  (ROOT/'examples/reports').mkdir(exist_ok=True)
  (ROOT/'examples/reports'/f'{agent}.md').write_bytes(exports.markdown(result).content)
  print('PASS '+agent)
