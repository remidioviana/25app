"""Real local/browser/native-engine behavior; no official-service or device claim."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

FILE = Path(__file__).with_name('index.html').resolve()


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors, external = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: external.append(r.url) if r.url.startswith(('http:', 'https:')) else None)
        page.goto(FILE.as_uri())

        def button(name):
            page.get_by_role('button', name=name, exact=True).click()

        def view(n):
            page.locator('#screen').select_option(str(n))

        def check():
            view(14)
            page.get_by_role('checkbox').check()
            button('Continue to local checks')
            button('Run document checks')
            button('Inspect the dossier summary')

        def packet():
            view(26)
            return json.loads(page.locator('#packet').input_value())

        button('Prepare my dossier')
        button('Save route context')
        button('Build my checklist')
        assert 'Add at least one' in page.locator('#content').inner_text(), 'Initial dossier must not invent requirements'
        view(1)
        button('Explore the fictional sample')
        button('Save route context')
        button('Build my checklist')
        button('Continue to documents')
        button('Set the review date')
        button('Use this date')
        button('Review dossier brief')
        button('See the preparation plan')
        button('Confirm the data boundary')
        button('Continue to local checks')
        assert page.get_by_role('alert').count() == 1
        page.get_by_role('checkbox').check()
        button('Continue to local checks')
        button('Run document checks')
        button('Inspect the dossier summary')
        counts=packet()['assessment']['counts']
        assert counts == {'missing': 1, 'expired': 0, 'present_unverified': 1}, counts
        assert packet()['submission']=='not performed'
        assert packet()['eligibility']=='not determined'

        # Incomplete and invalid dates preserve the entire document draft.
        view(6)
        button('Add document record')
        page.locator('#doc-name').fill('income_evidence')
        page.locator('#doc-expiry').fill('2026-02-30')
        page.locator('#doc-reference').fill('<script>marker</script> statement.pdf, p.2')
        button('Save document record')
        assert page.get_by_role('alert').count() == 1
        assert page.locator('#doc-name').input_value()=='income_evidence'
        assert page.locator('#doc-reference').input_value()=='<script>marker</script> statement.pdf, p.2'
        page.locator('#doc-expiry').fill('2026-11-13')
        button('Save document record')
        assert '<script>marker</script>' in page.locator('#content').inner_text()
        view(18)
        assert page.get_by_role('heading',name='Start with your evidence.').count()==1
        check()
        assert packet()['assessment']['counts']=={'missing':0,'expired':1,'present_unverified':1}
        view(20)
        button('Inspect income_evidence')
        button('Edit this record')
        page.locator('#doc-expiry').fill('')
        button('Save changes')
        check()
        assert packet()['assessment']['counts']=={'missing':0,'expired':0,'present_unverified':2}
        assert packet()['assessment']['checks'][1]['expires'] is None

        # Duplicate record names cannot silently overwrite a different record.
        view(6)
        button('Add document record')
        page.locator('#doc-name').fill('passport')
        button('Save document record')
        assert 'already exists' in page.get_by_role('alert').inner_text()
        assert len(packet()['input']['documents'])==2

        layout_checks=0
        for platform,theme in [('ios','light'),('android','dark')]:
            page.locator('#platform').select_option(platform)
            page.locator('#theme').select_option(theme)
            for width in (320,390,430,736):
                page.set_viewport_size({'width':width,'height':844})
                for n in range(1,35):
                    view(n)
                    assert page.locator('#content h1').count()==1,(platform,width,n)
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(platform,width,n)
                    assert page.evaluate('document.getElementById("app").scrollWidth<=document.getElementById("app").clientWidth'),(platform,width,n,'clipped app content')
                    layout_checks+=1

        # Text enlargement must reflow, not hide overflow behind the phone frame.
        page.set_viewport_size({'width':320,'height':844})
        page.evaluate('document.documentElement.style.fontSize="200%"')
        enlarged=0
        for n in range(1,35):
            view(n)
            assert page.evaluate('document.getElementById("app").scrollWidth<=document.getElementById("app").clientWidth'),(n,'200% text overflow')
            enlarged+=1
        page.emulate_media(reduced_motion='reduce')
        view(18)
        assert page.locator('#content').evaluate('el=>getComputedStyle(el).animationName')=='none'
        page.evaluate('document.documentElement.style.fontSize="100%"')
        view(5)
        page.locator('#requirement-name').fill('<img src=x onerror=alert(1)>')
        button('Add to checklist')
        assert page.locator('#content img').count()==0

        view(31)
        button('Delete local dossier')
        view(6)
        assert 'No document records' in page.locator('#content').inner_text()
        view(4)
        assert 'Add at least one' in page.locator('#content').inner_text()
        view(16)
        button('Run document checks')
        assert 'at least one' in page.get_by_role('alert').inner_text()
        assert not errors,errors
        assert not external,external
        browser.close()
        print(json.dumps({'status':'passed','layout_checks':layout_checks,'enlarged_text_views':enlarged,
                          'workflow':'empty start and fictional sample to packet',
                          'behavior':['consent message','invalid date recovery','expired/missing separation',
                                      'unknown expiry','duplicate prevention','stale-result invalidation',
                                      'escaped markup','reduced motion','local deletion','zero external requests'],
                          'native_device_verified':False},indent=2))


if __name__=='__main__':
    run()
