import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import exports
from domain_tools import TOOLS
from agent_runtime import SPECS
import storage as db

class ExportTests(unittest.TestCase):
    def run_data(self,agent):
        analysis=TOOLS[agent](SPECS[agent]['example'])
        return {'agent':agent,'id':'test-run','example':True,'status':'completed','created':'2026-11-14T12:00:00+00:00','goal':'Analisar',
          'result':{'analysis':analysis,'narrative':None,'evidence':[],'limits':[],'analysis_hash':db.digest(analysis)}}
    def test_all_25_reports_and_csv(self):
        for agent in SPECS:
            for format in ['markdown','csv']:
                with self.subTest(agent=agent,format=format):
                    a=exports.export(self.run_data(agent),format);self.assertGreater(len(a.content),80);self.assertEqual(len(a.sha256),64)
    def test_ics_escaping_and_line_folding(self):
        run=self.run_data('rafiq');run['result']['analysis']['planned_blocks'][0]['title']='ação,teste;\n'+('á'*100)
        a=exports.export(run,'ics','2026-12-01');s=a.content.decode()
        self.assertIn('DTSTART:20261201T080000',s);self.assertIn('ação\\,teste\\;\\n',s)
        self.assertTrue(all(len(line)<=75 for line in a.content.split(b'\r\n')))
    def test_ics_dates_always_use_four_digit_years(self):
        for agent in ('rafiq','sawm'):
            for day in ('0001-01-01','0099-12-31','0999-02-28','2028-02-29'):
                with self.subTest(agent=agent,day=day):
                    text=exports.export(self.run_data(agent),'ics',day).content.decode()
                    stamp=day.replace('-','')
                    self.assertIn('DTSTART:'+stamp+'T',text)
                    self.assertIn('DTEND:'+stamp+'T',text)
    def test_csv_formula_injection(self):
        self.assertEqual(exports.safe_cell('=HYPERLINK("bad")'),'\'=HYPERLINK("bad")')
        self.assertTrue(exports.safe_cell('  +CMD').startswith("'"))
    def test_calendar_requires_date_and_domain(self):
        with self.assertRaises(ValueError):exports.export(self.run_data('rafiq'),'ics')
        with self.assertRaises(ValueError):exports.export(self.run_data('mizan'),'ics','2026-11-14')
    def test_unfinished_export_rejected(self):
        r=self.run_data('mizan');r['status']='running'
        with self.assertRaises(ValueError):exports.export(r,'markdown')

if __name__=='__main__':unittest.main()
