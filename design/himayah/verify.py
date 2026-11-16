"""Browser integration checks for the design prototype, not native app tests."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

FILE = Path(__file__).with_name('index.html').resolve()


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors = []
        outbound = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: outbound.append(r.url) if r.url.startswith(('https:', 'http:')) else None)
        page.goto(FILE.as_uri())

        def button(name):
            page.get_by_role('button', name=name, exact=True).click()

        def screen(n):
            page.locator('#hm-screen').select_option(str(n))

        def sample():
            screen(3)
            button('Use fictional sample')

        def execute():
            screen(12)
            page.get_by_role('checkbox').check()
            button('Run local screening')
            button('Execute now')
            button('Open results')

        button('Review a contract')
        button('Use fictional sample')
        button('Save text and continue')
        button('Save scope')
        button('Continue with these rules')
        button('Review brief')
        button('See the plan')
        button('Continue')
        button('Run local screening')
        assert page.get_by_role('alert').count() == 1, 'Consent message missing'
        page.get_by_role('checkbox').check()
        button('Run local screening')
        button('Execute now')
        button('Open results')
        assert page.locator('.count').inner_text() == '2'
        assert '1' in page.locator('.metricline').inner_text()
        button('Inspect Data sharing')
        button('Inspect contract passage')
        assert 'characters 17–27' in page.locator('#hm-content').inner_text()
        assert 'The supplier may share data.' in page.locator('.quote').inner_text()
        screen(22)
        packet = json.loads(page.locator('#hm-export').input_value())
        assert packet['external_delivery'] == 'not performed'
        assert packet['findings'][0]['flagged'] is True
        assert packet['findings'][1]['matches'][0]['start'] == 17
        assert packet['legal_sources_verified'] == 0

        states = 0
        for platform, theme in [('ios', 'light'), ('android', 'dark')]:
            page.locator('#hm-platform').select_option(platform)
            page.emulate_media(color_scheme=theme, reduced_motion='reduce')
            for width in (320, 390, 430, 736):
                page.set_viewport_size({'width': width, 'height': 844})
                for n in range(1, 33):
                    screen(n)
                    assert page.locator('#hm-content h1').count() == 1, (platform, width, n)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (platform, width, n)
                    states += 1

        # Invalid draft remains editable and old findings must be invalidated.
        screen(4)
        page.locator('#hm-text').fill('   ')
        button('Save text and continue')
        assert page.locator('#hm-text').input_value() == '   '
        assert page.get_by_role('alert').count() == 1
        screen(15)
        assert page.get_by_role('heading', name='Start with a contract.').count() == 1

        # Literal metacharacters, astral Unicode offsets and safe text rendering.
        sample()
        page.locator('#hm-text').fill('😀 <script> (a+b) share data')
        button('Save text and continue')
        screen(8)
        page.locator('#hm-label').fill('Literal expression')
        button('Add to checklist')
        assert page.locator('#hm-label').input_value() == 'Literal expression'
        page.locator('#hm-phrase').fill('(a+b)')
        button('Add to checklist')
        execute()
        screen(22)
        packet = json.loads(page.locator('#hm-export').input_value())
        assert packet['findings'][2]['matches'][0]['start'] == 11
        assert packet['findings'][2]['matches'][0]['end'] == 16
        assert len(packet['findings'][2]['matches']) == 1

        # Editing the jurisdiction displays the saved selection and invalidates results.
        screen(6)
        page.locator('#hm-jurisdiction').select_option('DIFC · user-selected')
        button('Use selected context')
        screen(6)
        assert page.locator('#hm-jurisdiction').input_value() == 'DIFC · user-selected'
        screen(15)
        assert page.get_by_role('heading', name='Start with a contract.').count() == 1

        screen(29)
        button('Delete local review')
        screen(4)
        assert page.locator('#hm-text').input_value() == ''
        screen(23)
        assert 'No saved review' in page.locator('#hm-content').inner_text()
        assert not errors, errors
        assert not outbound, outbound
        browser.close()
        print(json.dumps({'status': 'passed', 'view_layout_checks': states,
                          'workflow': 'intake to packet', 'extra_checks': [
                              'consent message', 'literal evidence offsets', 'packet contents',
                              'invalid draft preservation', 'stale finding invalidation',
                              'literal regex metacharacters', 'Unicode code-point offsets',
                              'escaped markup', 'jurisdiction persistence', 'local deletion',
                              'zero external requests', 'zero page errors'],
                          'native_device_verified': False}, indent=2))


if __name__ == '__main__':
    run()
