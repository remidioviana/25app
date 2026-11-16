"""Validate portfolio declarations and artifact references; not execution/device proof."""
import ast
import json
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]


def validate_manifest(manifest,root=ROOT):
    errors=[]
    source=json.loads((root/'apps/apps.json').read_text())
    products=manifest.get('products',[]) if isinstance(manifest,dict) else []
    if not isinstance(manifest,dict) or manifest.get('schema_version')!=1:
        return ['Unsupported portfolio schema.']
    if not isinstance(products,list) or len(products)!=len(source) or any(not isinstance(p,dict) for p in products) or [p.get('id') for p in products]!=[a['id'] for a in source]:
        return ['Portfolio must contain all 25 source IDs in their original order.']

    def exists(path):
        if not isinstance(path,str) or not path:return False
        try:
            p=(root/path).resolve()
            return p.is_relative_to(root.resolve()) and p.is_file()
        except (ValueError,OSError):return False

    for index,(product,app) in enumerate(zip(products,source),1):
        label=app['id']
        if product.get('name')!=app['name'] or product.get('order')!=index:errors.append(f'{label}: identity/order differs from source.')
        for field,key in [('primary_task','task'),('source_evidence','evidence'),('approval_boundary','approval')]:
            if product.get(field)!=app[key]:errors.append(f'{label}: recovered {field} differs from source.')
        if not isinstance(product.get('acceptance_checks'),list) or len(product['acceptance_checks'])<2:errors.append(f'{label}: specific acceptance checks missing.')
        if product.get('design_unit') not in ('pending','in_progress','foundation'):errors.append(f'{label}: unknown or overstated design status.')
        if product.get('design_unit')=='foundation':
            for path in product.get('design_evidence',[]):
                if not exists(path):errors.append(f'{label}: missing design artifact {path}.')
            required=[f'design/{label}/DESIGN.md',f'design/{label}/VERIFICATION.md',f'design/{label}/index.html',f'design/{label}/screens.json']
            if not all(exists(path) for path in required):errors.append(f'{label}: design foundation lacks required artifacts.')
            if exists(f'design/{label}/screens.json'):
                screens=json.loads((root/f'design/{label}/screens.json').read_text())
                if len(screens)<30 or product.get('browser_views')!=len(screens):errors.append(f'{label}: inconsistent meaningful-view inventory.')
                source_path=root/('design/himayah/prototype.html' if label=='himayah' else f'design/{label}/app.js')
                if source_path.is_file():
                    match=re.search(r'const (?:titles|screens)=(\[.*?\]);',source_path.read_text(),re.S)
                    if not match or ast.literal_eval(match[1])!=[s['title'] for s in screens]:errors.append(f'{label}: screen inventory differs from prototype.')
        elif product.get('design_unit')=='pending' and product.get('browser_views')!=0:errors.append(f'{label}: pending unit cannot claim delivered views.')
        native=product.get('native_increment','none')
        if product.get('public_source_read_verified'):
            valid=False
            for path in product.get('public_source_read_evidence',[]):
                if exists(path):
                    proof=json.loads((root/path).read_text())
                    valid=valid or any(row.get('app')==label and row.get('receipt',{}).get('status')=='retrieved'
                      and row['receipt'].get('http_status')==200 and row['receipt'].get('fetched_at') for row in proof.get('reads',[]))
            if not valid:errors.append(f'{label}: public-source read has no actual receipt for this app.')
        if native not in ('none','overview'):errors.append(f'{label}: unknown native increment.')
        if native=='overview' and not all(exists(path) for path in product.get('native_evidence',[])):errors.append(f'{label}: missing native source/report evidence.')
        if native=='overview' and len(product.get('native_evidence',[]))<2:errors.append(f'{label}: native increment needs source and report.')
        for flag,proof in [('native_flow_verified','device_evidence'),('agent_verified','live_agent_evidence'),('integration_verified','integration_evidence'),('released','release_evidence')]:
            if not isinstance(product.get(flag),bool):errors.append(f'{label}: {flag} must be explicit boolean.')
            if product.get(flag) and (not product.get(proof) or not all(exists(path) for path in product[proof])):errors.append(f'{label}: {flag} has no supporting evidence files.')
        if product.get('released') and not (product.get('native_flow_verified') and product.get('agent_verified')):errors.append(f'{label}: release requires native-flow and agent acceptance.')
    return errors


def main():
    manifest=json.loads((ROOT/'project/portfolio.json').read_text())
    errors=validate_manifest(manifest)
    if errors:
        print('\n'.join(errors),file=sys.stderr);return 1
    products=manifest['products']
    print(json.dumps({'products':len(products),'design_in_progress':sum(p['design_unit']=='in_progress' for p in products),'design_foundations':sum(p['design_unit']=='foundation' for p in products),
        'browser_views':sum(p['browser_views'] for p in products),'native_overview_increments':sum(p['native_increment']=='overview' for p in products),
        'native_flows_verified':sum(p['native_flow_verified'] for p in products),'agents_verified_live':sum(p['agent_verified'] for p in products),
        'public_source_readers_verified':sum(p.get('public_source_read_verified',False) for p in products),
        'primary_domain_integrations_verified':sum(p['integration_verified'] for p in products),'released':sum(p['released'] for p in products),
        'note':'Artifact consistency only; local prototypes and bundles are not live/device validation.'},indent=2))
    return 0


if __name__=='__main__':sys.exit(main())
