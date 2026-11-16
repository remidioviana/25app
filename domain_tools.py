"""Pure, auditable domain tools. No network, fabricated receipts or hidden mutations."""
from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
import math
import hashlib
import re


def money(n):
    return float(Decimal(str(n)).quantize(Decimal('.01'), rounding=ROUND_HALF_UP))


def day(s):
    return date.fromisoformat(s)


def positive(n):
    if isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n) or n < 0:
        raise ValueError('Expected a finite non-negative number')
    return n


def checklist(d):
    as_of = day(d['as_of'])
    records = {x['name']: x for x in d['documents']}
    rows = []
    for requirement in d['requirements']:
        doc = records.get(requirement)
        status = 'missing' if not doc else ('expired' if doc['expires'] and day(doc['expires']) < as_of else 'present_unverified')
        rows.append({'requirement': requirement, 'status': status, 'reference': doc['reference'] if doc else None})
    return {'checks': rows, 'missing': [x['requirement'] for x in rows if x['status'] != 'present_unverified'],
            'as_of': d['as_of'], 'note': 'User-supplied checklist; document presence does not establish legal eligibility.'}


def contract(d):
    text = d['text']
    findings = []
    remaining = 1000
    for rule in d['rules']:
        if not rule['phrase'].strip():
            raise ValueError('A screening phrase must contain non-whitespace text')
        hits = []
        found = False
        truncated = False
        limit = min(100, remaining)
        for match in re.finditer(re.escape(rule['phrase']), text, flags=re.I):
            found = True
            if len(hits) >= limit:
                truncated = True
                break
            quote_start = max(0, match.start()-60)
            quote_end = min(len(text), match.end()+100, quote_start+600)
            hits.append({'start': match.start(), 'end': match.end(),
                         'quote_start': quote_start, 'quote_end': quote_end,
                         'quote': text[quote_start:quote_end],
                         'quote_contains_entire_match': match.end() <= quote_end})
        remaining -= len(hits)
        flagged = not found if rule['required'] else found
        findings.append({'rule': rule['label'], 'flagged': flagged, 'matches': hits,
                         'match_found': found, 'matches_truncated': truncated,
                         'required': rule['required']})
    return {'findings': findings, 'flag_count': sum(x['flagged'] for x in findings),
            'input_text_sha256': hashlib.sha256(text.encode()).hexdigest(),
            'input_character_count': len(text), 'offset_unit': 'unicode_code_points',
            'limits': {'max_matches_per_rule': 100, 'max_matches_total': 1000,
                       'max_quote_characters': 600},
            'note': 'Literal text screening against supplied rules. Quotes and offsets refer only to the supplied text. Missing phrases do not establish missing legal obligations; matches do not establish noncompliance. Not legal advice or semantic interpretation.'}


def setup(d):
    rows = []
    for o in d['options']:
        positive(o['setup_fee']); positive(o['annual_fee']); positive(o['visa_fee']); positive(d['visas']); positive(d['years'])
        rows.append({'name': o['name'], 'eligible_for_activity': d['activity'] in o['activities'],
                     'total': money(Decimal(str(o['setup_fee'])) + Decimal(str(o['annual_fee']))*Decimal(str(d['years'])) + Decimal(str(o['visa_fee']))*Decimal(str(d['visas'])))})
    return {'currency': d['currency'], 'comparison': sorted(rows, key=lambda x: (not x['eligible_for_activity'], x['total'])), 'assumptions': 'Supplied figures; fees and permissions were not checked live.'}


def tender(d):
    requirements = set(d['requirements']); capabilities = set(d['capabilities'])
    return {'coverage_percent': round(100*len(requirements & capabilities)/len(requirements), 1) if requirements else None,
            'missing': sorted(requirements-capabilities), 'matched': sorted(requirements & capabilities),
            'days_to_deadline': (day(d['deadline'])-day(d['as_of'])).days,
            'deadline_passed': day(d['deadline']) < day(d['as_of']), 'bid_submitted': False}


def workforce(d):
    if not 0 <= d['target_percent'] <= 100: raise ValueError('Target must be between 0 and 100')
    active = [x for x in d['employees'] if x['active']]
    nationals = sum(x['national'] for x in active)
    required = math.ceil(len(active)*d['target_percent']/100)
    return {'active': len(active), 'national_count': nationals, 'current_percent': round(100*nationals/len(active), 2) if active else None,
            'target_count_at_current_headcount': required, 'gap_at_current_headcount': max(0, required-nationals),
            'note': 'User-specified target, not a regulatory determination; assumes a constant workforce size.'}


def case(d):
    rows = sorted(d['events'], key=lambda x: day(x['date']))
    claims = [{'label': x['label'], 'amount': money(positive(x['amount'])), 'evidence': x['evidence']} for x in d['claims']]
    return {'timeline': rows, 'claims': claims, 'claimed_total': money(sum(Decimal(str(x['amount'])) for x in claims)), 'currency': d['currency'], 'note': 'Sum of claimed amounts; does not establish entitlement to compensation.'}


def proposal(d):
    matches = [x for x in d['products'] if set(x['tags']) & set(d['needs'])]
    return {'account': d['account'], 'matches': matches, 'uncovered_needs': sorted(set(d['needs'])-{t for x in matches for t in x['tags']}),
            'draft': '\n'.join([f"Proposta para {d['account']}"] + [f"• {x['name']}: {x['approved_fact']}" for x in matches]), 'sent': False}


def campaign(d):
    approved = {x.casefold() for x in d['approved_claims']}
    return {'claim_review': [{'claim': x, 'approved_exact_match': x.casefold() in approved} for x in d['claims']],
            'prohibited_term_hits': [x for x in d['prohibited_terms'] if x.casefold() in d['copy'].casefold()],
            'character_count': len(d['copy']), 'over_channel_limit': len(d['copy']) > positive(d['max_characters']), 'published': False}


def order(d):
    positive(d['amount']); positive(d['refund_limit']); positive(d['return_window_days'])
    age = (day(d['as_of'])-day(d['purchase_date'])).days
    eligible = 0 <= age <= d['return_window_days'] and d['reason'] in d['eligible_reasons']
    return {'age_days': age, 'policy_eligible': eligible, 'within_delegation_limit': d['amount'] <= d['refund_limit'],
            'recommended_action': 'prepare_refund' if eligible else 'manual_review', 'amount': money(d['amount']), 'refund_issued': False}


def shipment(d):
    missing = [x for x in d['required_fields'] if not d['shipment'].get(x)]
    positive(d['goods_value']); positive(d['freight']); positive(d['duty_rate_percent'])
    base = Decimal(str(d['goods_value']))+Decimal(str(d['freight']))
    return {'missing_fields': missing, 'customs_value_assumption': money(base), 'estimated_duty': money(base*Decimal(str(d['duty_rate_percent']))/100), 'currency': d['currency'],
            'note': 'Supplied duty rate. Does not classify HS codes, certify compliance or submit declarations.'}


def skills(d):
    evidence = {x['criterion']: x['reference'] for x in d['evidence']}
    return {'rubric': [{'criterion': x, 'reference': evidence.get(x), 'status': 'evidence_present_for_review' if evidence.get(x) else 'not_evidenced'} for x in d['criteria']],
            'note': 'Does not rank candidates or infer skills from missing evidence.'}


def dependencies(d):
    tasks = {x['id']: x for x in d['tasks']}
    if len(tasks) != len(d['tasks']): raise ValueError('IDs duplicados')
    result, visiting, visited = [], set(), set()
    def visit(i):
        if i not in tasks: raise ValueError('Unknown dependency: '+i)
        if i in visiting: raise ValueError('Dependency cycle')
        if i in visited: return
        visiting.add(i)
        for parent in tasks[i]['depends_on']: visit(parent)
        visiting.remove(i); visited.add(i); result.append(tasks[i])
    for i in tasks: visit(i)
    today = day(d['as_of'])
    return {'ordered_tasks': [x | {'ready': not x['done'] and all(tasks[p]['done'] for p in x['depends_on']),
              'overdue': not x['done'] and day(x['due']) < today} for x in result], 'remaining': sum(not x['done'] for x in result)}


def schedule(d):
    def minute(t):
        parsed = datetime.strptime(t, '%H:%M'); return parsed.hour*60+parsed.minute
    def clock(m): return f'{m//60:02d}:{m%60:02d}'
    start, end = minute(d['start']), minute(d['end'])
    if start >= end: raise ValueError('End must be later than start on the same day')
    buffer = int(positive(d['buffer_minutes']))
    busy = sorted([(minute(x['start']), minute(x['end']), x['title']) for x in d['busy']])
    if any(a>=b for a,b,_ in busy): raise ValueError('Invalid occupied time block')
    conflicts = [{'a': a[2], 'b': b[2]} for i,a in enumerate(busy) for b in busy[i+1:] if b[0] < a[1]+buffer]
    occupied = [(max(start,a-buffer),min(end,b+buffer)) for a,b,_ in busy if b+buffer>start and a-buffer<end]
    free, cursor = [], start
    for a,b in occupied:
        if a>cursor: free.append([cursor,a])
        cursor=max(cursor,b)
    if cursor<end: free.append([cursor,end])
    assigned, unscheduled = [], []
    for x in d['tasks']:
        duration = int(positive(x['minutes']))
        if duration <= 0: raise ValueError('Duration must be positive')
        for slot in free:
            if slot[1]-slot[0]>=duration:
                assigned.append({'title': x['title'], 'start': clock(slot[0]), 'end': clock(slot[0]+duration)})
                slot[0] += duration+buffer; break
        else: unscheduled.append(x['title'])
    return {'planned_blocks': assigned, 'unscheduled': unscheduled, 'existing_conflicts': conflicts, 'calendar_changed': False}


def ledger(d):
    totals = defaultdict(Decimal); seen = set(); duplicates = []; uncertain=[]
    for x in d['transactions']:
        if x['id'] in seen: duplicates.append(x['id']); continue
        seen.add(x['id'])
        if not math.isfinite(x['amount']): raise ValueError('Invalid value')
        totals[x['category']] += Decimal(str(x['amount']))
        if not x['verified']: uncertain.append(x['id'])
    return {'currency': d['currency'], 'total': money(sum(totals.values())), 'by_category': [
        {'category': k, 'spent': money(v), 'budget': d['budgets'].get(k), 'remaining': money(Decimal(str(d['budgets'][k]))-v) if k in d['budgets'] else None}
        for k,v in sorted(totals.items())], 'duplicate_ids_excluded': duplicates, 'unverified_records': uncertain}


def dining(d):
    rows=[]
    for x in d['restaurants']:
        reasons=[]
        if x['price'] > d['budget']: reasons.append('over_budget')
        if not set(d['required_tags']) <= set(x['tags']): reasons.append('requirements_unconfirmed')
        if x['available_seats'] < d['party_size']: reasons.append('insufficient_reported_seats')
        rows.append(x | {'eligible_on_supplied_data': not reasons, 'reasons': reasons})
    return {'shortlist': sorted(rows,key=lambda x:(not x['eligible_on_supplied_data'],x['price'])), 'booked':False, 'note':'Confirm availability and dietary restrictions directly with the venue.'}


def utility(d):
    for k in ('previous_usage','current_usage','previous_days','current_days'): positive(d[k])
    if not d['previous_days'] or not d['current_days']: raise ValueError('Period must contain a positive number of days')
    before=d['previous_usage']/d['previous_days']; after=d['current_usage']/d['current_days']
    return {'unit':d['unit'], 'previous_per_day':round(before,4), 'current_per_day':round(after,4),
            'normalized_change_percent':round((after-before)/before*100,2) if before else None,
            'note':'Daily comparison; not adjusted for weather, occupancy or tariffs; no emissions estimate.'}


def wellbeing(d):
    start=day(d['start_date'])
    if not 1<=d['days']<=14: raise ValueError('Escolha de 1 a 14 dias')
    return {'routine':[{'date':str(start+timedelta(days=i)), 'activities':d['preferred_activities'], 'reflection':'How are you feeling and what do you need today?'} for i in range(d['days'])],
            'note':'User-selected self-care routine. No diagnosis or treatment.', 'shared':False}


def recycle(d):
    rows=[x for x in d['routes'] if d['material'] in x['accepted_materials'] and (not d['hazardous'] or x['accepts_hazardous'])]
    return {'routes':sorted(rows,key=lambda x:x['distance_km']), 'needs_local_confirmation':True,
            'next_step':'Confirm acceptance with a specialist operator' if d['hazardous'] else 'Confirm acceptance and time with the operator', 'collection_booked':False}


def heritage(d):
    sources=[x for x in d['sources'] if set(t.casefold() for t in x['topics']) & set(t.casefold() for t in d['topics'])]
    return {'lessons':[{'title':x['title'], 'reading':x['excerpt'], 'citation':x['reference'], 'reflection':f"What does the source {x['title']} state, and what does it leave unclear?"} for x in sources],
            'missing_topics':[t for t in d['topics'] if not any(t.casefold() in [v.casefold() for v in s['topics']] for s in sources)]}


def accessibility(d):
    routes=[]
    for r in d['routes']:
        unknown=[]; blocked=[]
        for s in r['segments']:
            for need in d['needs']:
                value=s['access'].get(need)
                if value is False: blocked.append(s['name']+': '+need)
                elif value is not True: unknown.append(s['name']+': '+need)
        routes.append({'name':r['name'],'minutes':r['minutes'],'blocked':blocked,'unknown':unknown,'confirmed_by_supplied_data':not blocked and not unknown})
    return {'routes':sorted(routes,key=lambda x:(bool(x['blocked']),bool(x['unknown']),x['minutes'])), 'note':'Reported conditions; no live elevator or traffic telemetry.'}


def rescue(d):
    lot=d['lot']; positive(lot['quantity'])
    current=datetime.fromisoformat(d['as_of']); expires=datetime.fromisoformat(lot['expires'])
    if current.tzinfo is None or expires.tzinfo is None: raise ValueError('Timestamps require UTC or an offset')
    global_reasons=[]
    if expires<=current: global_reasons.append('expired')
    if not lot['allergens_known']: global_reasons.append('allergens_unknown')
    if not lot['handling_verified']: global_reasons.append('handling_unverified')
    rows=[]
    for r in d['recipients']:
        reasons=list(global_reasons)
        if r['capacity']<lot['quantity']: reasons.append('insufficient_capacity')
        if set(lot['allergens']) & set(r['excluded_allergens']): reasons.append('allergen_conflict')
        if current+timedelta(minutes=positive(r['travel_minutes'])) >= expires: reasons.append('arrival_after_expiry')
        rows.append({'recipient':r['name'],'eligible_for_review':not reasons,'reasons':reasons,'travel_minutes':r['travel_minutes']})
    return {'matches':sorted(rows,key=lambda x:(not x['eligible_for_review'],x['travel_minutes'])), 'handoff_confirmed':False, 'note':'Screening of supplied records; not a food-safety certification.'}


TOOLS={'himayah':contract,'iqamah':checklist,'istithmar':setup,'munagasah':tender,'sahil':checklist,
       'tawteen':workforce,'adl':case,'tawassul':proposal,'adab':campaign,'khidmah':order,'jomrok':shipment,
       'khibrat':skills,'majlis':dependencies,'rafiq':schedule,'sawm':schedule,'mizan':ledger,'thawg':dining,
       'manzil':ledger,'gurbah':dependencies,'amanah-eco':utility,'nafas':wellbeing,'tadweer':recycle,
       'turath':heritage,'himam':accessibility,'hisad':rescue}
