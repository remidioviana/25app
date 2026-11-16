from pathlib import Path
import json
from playwright.sync_api import sync_playwright

FILE=Path(__file__).with_name('index.html').resolve()


def run():
    with sync_playwright() as p:
        b=p.chromium.launch();page=b.new_page(viewport={'width':390,'height':844})
        errors=[];outbound=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:outbound.append(r.url) if r.url.startswith(('http:','https:')) else None)
        page.goto(FILE.as_uri())
        def button(name):page.get_by_role('button',name=name,exact=True).click()
        def view(n):page.locator('#screen').select_option(str(n))
        def calculate():
            view(13);page.get_by_role('checkbox').check();button('Continue to calculation');button('Run cost comparison');button('Inspect the ranking')
        def packet():view(28);return json.loads(page.locator('#packet').input_value())
        button('Build my comparison');button('Save activity');assert page.get_by_role('alert').count()==1
        view(1);button('Explore the fictional example');button('Save activity');button('Save planning assumptions');button('Confirm currency');button('Use this currency');button('Save source notes');button('Review decision brief');button('See the calculation plan');button('Confirm data boundary');button('Continue to calculation');assert page.get_by_role('alert').count()==1
        page.get_by_role('checkbox').check();button('Continue to calculation');button('Run cost comparison');button('Inspect the ranking')
        result=packet();assert result['comparison']['comparison'][0]['total']=='22600.00';assert result['license_application']=='not filed';assert result['official_fee_sources_verified']==0
        view(19);assert page.get_by_role('table').count()==1;assert page.locator('.bar').count()==2
        view(22);page.locator('#scenario-years').fill('1');page.locator('#scenario-visas').fill('0');button('Calculate this scenario');assert '7,000.00' in page.locator('#content').inner_text();assert packet()['input']['years']==3
        view(24);button('Calculate the illustration');assert page.get_by_role('alert').count()==1
        page.locator('#tax-income').fill('1000');page.locator('#tax-threshold').fill('100');page.locator('#tax-rate').fill('10');button('Calculate the illustration');assert '90.00' in page.locator('.price').inner_text()
        view(24);page.locator('#tax-rate').fill('0');button('Calculate the illustration');assert '0.00' in page.locator('.price').inner_text()
        view(4);button('Add a supplied option');page.locator('#option-name').fill('<script>literal</script>');page.locator('#setup-fee').fill('0');page.locator('#annual-fee').fill('-1');page.locator('#visa-fee').fill('0');button('Save option');assert page.get_by_role('alert').count()==1;assert page.locator('#option-name').input_value()=='<script>literal</script>'
        page.locator('#annual-fee').fill('0');page.locator('#option-activities').fill('software');button('Save option');assert '<script>literal</script>' in page.locator('#content').inner_text();assert page.locator('#content script').count()==0
        view(17);assert page.get_by_role('heading',name='Make the assumptions explicit.').count()==1
        calculate();assert len(packet()['comparison']['comparison'])==3
        view(23);page.locator('#pair-a').select_option('Option A — example');page.locator('#pair-b').select_option('Option B — example');button('Compare selected options');assert page.get_by_role('table').count()==1
        checks=0
        for platform,theme in [('ios','light'),('android','dark')]:
            page.locator('#platform').select_option(platform);page.locator('#theme').select_option(theme)
            for width in (320,390,430,736):
                page.set_viewport_size({'width':width,'height':844})
                for n in range(1,37):
                    view(n);assert page.locator('#content h1').count()==1,(n,'title')
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(n,width,'page overflow')
                    assert page.evaluate('app.scrollWidth<=app.clientWidth'),(n,width,'app clipping');checks+=1
        page.set_viewport_size({'width':320,'height':844});page.evaluate('document.documentElement.style.fontSize="200%"')
        for n in range(1,37):view(n);assert page.evaluate('app.scrollWidth<=app.clientWidth'),(n,'200% text clipping')
        page.emulate_media(reduced_motion='reduce');view(17);assert page.locator('#content').evaluate('e=>getComputedStyle(e).animationName')=='none'
        page.evaluate('document.documentElement.style.fontSize="100%"');view(33);button('Delete local comparison');view(4);assert 'No options supplied' in page.locator('#content').inner_text();view(15);button('Run cost comparison');assert page.get_by_role('alert').count()==1
        assert not errors,errors;assert not outbound,outbound;b.close()
        print(json.dumps({'passed':True,'layout_checks':checks,'enlarged_text_views':36,'workflow':'sample to exact comparison and packet','behavior':['sensitivity independent of base','explicit tax assumptions and zero rate','invalid input preserves draft','safe markup','stale-result invalidation','pair comparison','chart numeric alternative','deletion','no outbound HTTP(S)'],'native_device_verified':False},indent=2))


if __name__=='__main__':run()
