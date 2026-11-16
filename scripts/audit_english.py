"""UTF-8 and residual-language regression scan; not semantic certification."""
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
pattern=re.compile(r'[ãõçáéíóúêâÃ�]|\b(?:falha|servidor|nenhum|nenhuma|dados|exemplo|usuário|obrigatório|agendamento|formulário|ferramentas|português)\b',re.I)
issues=[];count=0
for folder in ('mobile','public','apps','agents','examples'):
 for p in (root/folder).rglob('*'):
  if any(x in p.parts for x in ('node_modules','.expo','.test-build','dist')) or p.suffix not in ('.ts','.tsx','.js','.cjs','.json','.html','.md'):continue
  if 'tests' in p.parts or p.name in ('AGENTS.md','README.md','package-lock.json'):continue
  text=p.read_text(encoding='utf-8',errors='strict');count+=1
  for i,line in enumerate(text.splitlines(),1):
   if pattern.search(line):issues.append({'file':str(p.relative_to(root)),'line':i})
report={'files_scanned':count,'issues':issues,'scope':'Source strings, specs and examples; excludes dependencies, tests and documentation. Heuristic scan, not a translation-quality guarantee.'}
(root/'docs/LOCALIZATION_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n')
assert not issues,issues
print(f'PASS: {count} UTF-8 source/spec/example files, no residual Portuguese tokens or mojibake detected by regression scan.')
