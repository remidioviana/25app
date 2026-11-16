"""Separate domain workflows, shared browser mechanics. No native/live-service proof."""
import argparse
import json
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from domain_tools import tender,checklist


def run(app_id):
    with sync_playwright() as p:
        b=p.chromium.launch();page=b.new_page(viewport={'width':390,'height':844})
        errors=[];requests=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
        page.goto((ROOT/f'design/{app_id}/index.html').as_uri())
        def button(name):page.get_by_role('button',name=name,exact=True).click()
        def view(n):page.locator('#screen').select_option(str(n))
        def packet():view(26);return json.loads(page.locator('#packet').input_value())
        if app_id=='munagasah':
            button('Load the fictional tender');button('Save tender label');button('Edit requirement register');button('Save requirements');button('Edit supplied capabilities');button('Save capabilities');button('Save reference dates');button('Save amendment notes');button('Confirm bid brief');button('See the plan');button('Confirm data boundary');button('Continue to local check');assert page.get_by_role('alert').count()==1
            page.get_by_role('checkbox').check();button('Continue to local check');button('Run tender checks');button('Open the matrix')
            result=packet();assert result['local_fit']['matched']==['delivery_plan','references'];assert result['local_fit']['missing']==['ISO9001'];assert result['local_fit']['days_to_deadline']==17;assert result['bid_submitted'] is False
            expected=tender(result['input']);assert {k:result['local_fit'][k] for k in expected}==expected
            # Half-even coverage rounding agrees with Python on a tie.
            case={'requirements':[str(i) for i in range(16)],'capabilities':['0'],'deadline':'2026-11-14','as_of':'2026-11-14'}
            actual=page.evaluate('x=>MunagasahPrototype.assess(x)',case);assert actual['coverage_percent']==tender(case)['coverage_percent']==6.2
            view(7);page.locator('#deadline').fill('2026-02-30');button('Save reference dates');assert page.get_by_role('alert').count()==1;assert page.locator('#deadline').input_value()=='2026-02-30';page.locator('#deadline').fill('2026-12-01');button('Save reference dates')
            view(15);assert page.get_by_role('heading',name='Start with the actual tender.').count()==1
            view(13);button('Run tender checks');view(29);page.locator('#query').fill('no_such_requirement');button('Search requirements');assert 'No matching requirement' in page.locator('#content').inner_text()
            view(4);page.locator('#requirements').fill('ISO9001\ndelivery_plan\nreferences\n<script>not executed</script>');button('Save requirements');view(13);button('Run tender checks')
            assert '<script>not executed</script>' in packet()['input']['requirements'];assert page.locator('#content script').count()==0
        else:
            button('Try the fictional example');button('Save service context');button('Review required steps');button('Edit requirements');button('Save requirements');button('Choose reference date');button('Save review date');button('Confirm service brief');button('See preparation plan');button('Confirm data boundary');button('Continue to local check');assert page.get_by_role('alert').count()==1
            page.get_by_role('checkbox').check();button('Continue to local check');button('Run service checks');button('Start the guided journey')
            result=packet();assert result['local_checks']['counts']=={'missing':2,'expired':1,'present_unverified':0};assert result['government_form_submitted'] is False
            expected=checklist(result['input']);assert [{k:c[k] for k in ('requirement','status','reference')} for c in result['local_checks']['checks']]==expected['checks']
            view(17);button('Open step 1');assert 'step 1 of 3' in page.locator('#content').inner_text().lower();button('Next requirement');assert 'step 2 of 3' in page.locator('#content').inner_text().lower()
            view(6);button('Add a document record');page.locator('#record-name').fill('address');page.locator('#record-expiry').fill('2026-02-30');page.locator('#record-reference').fill('<script>literal</script>');button('Save record');assert page.get_by_role('alert').count()==1;assert page.locator('#record-reference').input_value()=='<script>literal</script>'
            page.locator('#record-expiry').fill('');button('Save record');view(17);assert page.get_by_role('heading',name='Start with the service requirements.').count()==1
            view(15);button('Run service checks');assert packet()['local_checks']['counts']=={'missing':1,'expired':1,'present_unverified':1}
            view(6);button('Add a document record');page.locator('#record-name').fill('address');button('Save record');assert 'already exists' in page.get_by_role('alert').inner_text()
        count=0
        for platform,theme in [('ios','light'),('android','dark')]:
            page.locator('#platform').select_option(platform);page.locator('#theme').select_option(theme)
            for width in (320,390,430,736):
                page.set_viewport_size({'width':width,'height':844})
                for n in range(1,35):
                    view(n);assert page.locator('#content h1').count()==1,(app_id,n)
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(app_id,n,width)
                    assert page.evaluate('app.scrollWidth<=app.clientWidth'),(app_id,n,width,'hidden clipping');count+=1
        page.set_viewport_size({'width':320,'height':844});page.evaluate('document.documentElement.style.fontSize="200%"')
        for n in range(1,35):view(n);assert page.evaluate('app.scrollWidth<=app.clientWidth'),(app_id,n,'200% text')
        page.emulate_media(reduced_motion='reduce');view(1);assert page.locator('#content').evaluate('e=>getComputedStyle(e).animationName')=='none'
        page.evaluate('document.documentElement.style.fontSize="100%"');view(31);button('Delete local tender' if app_id=='munagasah' else 'Delete local journey');view(13 if app_id=='munagasah' else 15);button('Run tender checks' if app_id=='munagasah' else 'Run service checks');assert page.get_by_role('alert').count()==1
        assert not errors,errors;assert not requests,requests;b.close()
        print(json.dumps({'app':app_id,'passed':True,'layout_checks':count,'enlarged_text_views':34,'python_parity':'supported sample plus tender rounding tie when applicable','invalid_input_recovery':True,'stale_result_invalidation':True,'no_external_requests':True,'native_device_verified':False},indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('app',choices=['munagasah','sahil']);run(parser.parse_args().app)
