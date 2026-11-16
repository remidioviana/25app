# APP 03 — Istithmar AI / Decision Room

Design foundation, 36 browser views and a native-overview increment. Full native flows, actual fee/permission/tax sources, live agent and licensing integration remain pending.

## Product context and thesis

Recovered from `apps/apps.json`, `agents/istithmar/agent.json`, `domain_tools.py::setup` and brand metadata: official name Istithmar AI; Business category; title “The Free Zone & Tax Navigator”; purpose comparing business-setup options with assumptions visible. The source has two fictional options, not a verified free-zone directory. Target persona in source is business founders; exact segments, market size, naming rationale and approved Arabic spelling are unavailable.

Proposed primary user: a founder evaluating UAE setup choices with limited knowledge of fee structures. Secondary user: an adviser inspecting assumptions. Functional job: compare the same horizon/activity/visa count. Emotional job: understand the decision without false certainty. Practical job: identify omitted costs and prepare a reviewable question/packet. Interviews, pricing research and competitor comparisons have not been performed. Manual spreadsheets, advisers and authority portals are category alternatives, not researched performance benchmarks.

UAE/GCC context is supplied; actual support for a jurisdiction, permit or tax regime is not verified. English exists; Arabic/RTL and terminology review are pending. Free access, no account, no ads/paywall remain requirements. Provider/source maintenance, funding, real users and operating costs remain unresolved.

Design thesis: a decision room built around cost assumptions, ordered options, breakdowns and sensitivity—not Himayah's legal exceptions or Iqamah's dossier index. The home gives one action and an explicitly fictional example. No actual option or result appears in the empty starting state. Success measures proposed: time to first recomputable comparison, correct interpretation of activity-list membership, recovery from an invalid premise and traceable omitted-cost questions. No measured gains are claimed.

## Three creative directions

Scores 1–5 are subjective selection judgments with weights clarity 25%, sophistication 20%, originality 15%, craft 15%, accessibility 15%, feasibility 10%.

| Direction | Clarity | Sophistication | Originality | Craft | Accessibility | Feasibility | /100 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Decision Room — selected | 5 | 4 | 4 | 5 | 5 | 5 | 93 |
| Founder Editorial | 4 | 5 | 4 | 4 | 4 | 4 | 84 |
| Scenario Atlas | 3 | 5 | 5 | 4 | 3 | 3 | 77 |

Decision Room: precise, pragmatic; teal/ink, tabular native sans, structured rows, open cost composition and scenario input. Motion follows a premise change, not decoration. AI appears as an evidence-bound plan and questions. Strong text/table equivalents make comparison accessible. Platform-native stacks/sheets and existing primitives are feasible.

Founder Editorial: warm charcoal/cream, licensed editorial serif with native controls; one-option-at-a-time reading and narrative trade-offs. Animated page continuity; source annotations alongside recommendations. Good for advisory storytelling, but hides numeric comparison unless an equivalent table is added. Native selection and larger reading views require extra work on both platforms.

Scenario Atlas: interactive scenario graph, mineral blue/teal, native labels, draggable horizon and visa assumptions. AI proposes alternatives with user-controlled acceptance. Lists/tables and non-gesture controls are essential. High originality but greater performance, accessibility and engineering risk. None is a substitute for verified licensing data.

## Visual foundations and components

| Semantic token | Light | Dark |
|---|---|---|
| Background / surface | #F2F7F6 / #FFFFFF | #101E23 / #192C33 |
| Primary / secondary text | #172E34 / #435C63 | #EAF5F3 / #B5CDD0 |
| Primary action / on-action | #09675E / #FFFFFF | #8DDECD / #102D29 |
| Selection / divider | #E0EFEB / #B9D1CE | #233F3E / #385258 |
| Warning/approval | #855000 | #FFD091 |
| Error | #A42C33 | #FFB4B9 |
| Setup / recurring / visas series | #09675E / #365E86 / #8A5B20 | #8DDECD / #91B6E3 / #E0BA7E |

Information/processing/unavailable states use readable secondary/accent with written labels. Completion means a local calculation finished, not a license approved. Chart colors retain stable category meaning and have a numeric table; color does not carry status alone. Original skyline mark, consistent 1.6 stroke; native navigation icons should use permitted platform equivalents. No official insignia, unnecessary gradient, blur or glass.

System-ui/-apple-system/native sans; Android native sans, no Apple-font redistribution. Titles 35/39 weight 600 tracking −1.1; Android 500/−.6; narrow 31/34. Section 18/25 weight 600; body/input 16/24; secondary 13/21; labels 14/21; eyebrow 11/17 weight 650; price 30/36 with tabular figures. Relative text units and wrapping support enlarged text. Maximum frame 412; main margins 24, narrow 18; 4-point spacing base; main actions 54 high, other controls 48; corners 7 iOS intent / 24 Android intent. Native safe-area/keyboard dimensions remain platform-driven.

Core components: assumption form (default/edit/invalid/preserved draft), option row (listed/not listed/expanded breakdown), ranking (empty/current/invalidated), chart (actual data/table/zero-or-out-of-range fallback), scenario (separate from base), approval/receipt boundary, copyable packet and deletion confirmation. Press/focus/disabled/busy states must be meaningful; there is no fake send button or simulated provider wait. Primary feedback is a changed number with explicit assumptions, not an invented confidence score.

## Five end-to-end journeys

| Journey | Route and decisions | Execution/authority | Failure and success |
|---|---|---|---|
| First use | Home→activity→horizon→options→currency→sources→brief→plan→boundary→run | User supplies each premise; local engine computes | Empty/invalid input stays editable; success is recomputable ranking |
| Primary comparison | Run→ranking→selected option→breakdown→chart | Exact decimal arithmetic; activity match is supplied-list membership | Missing permissions remain unverified; user can inspect every component |
| Advanced bounded agent | Brief→approved-source retrieval→quote normalization→comparison→gap question | Future agent may retrieve approved records and draft alternatives within limits | Missing quote/date asks for information, not invented fees; live service pending |
| Interpret/action | Ranking→sensitivity/pair→reviewer questions→packet→export→handoff | User compares and approves any future external action separately | Packet is prepared, never falsely filed; source gaps remain attached |
| Recovery | Invalid form/edit premise→recover→correct→rerun or delete | Saving inputs invalidates dependent results | Draft preserved, duplicates rejected, current packet tied to current data |

Navigation: Decision / Options / Scenarios; sources/history/privacy are secondary. Optional sample replaces forced onboarding. First value is transparent arithmetic. Repeat value should come from reviewed quotes/scenarios, not fabricated retention claims.

## AI/agent interaction contract

Idle offers purpose; input collects bounded premises; interpretation displays brief; plan names validate/calculate/order/retain limits; execution shows actual local events; external action explains unavailable licensing; human approval in production binds payload/destination/version; completion states prepared/not filed; partial completion separates verified sources from unresolved quotes; recovery names the failed input/source; revision invalidates dependencies; history retains the current session only. No raw hidden reasoning is exposed.

Local calculations may run within selected scope. New external disclosure, application, binding price or payment needs appropriate authorization. Future sources need authority, jurisdiction, publication/retrieval date and fee validity; a price without those stays an assumption. Approval must be invalidated after payload changes; timeout after send is reconciled through a real connector/receipt. No official write is connected here.

## 36 meaningful browser screens

| # | Screen purpose/content | Action / distinct boundary |
|---|---|---|
| 01 | Decision home, purpose, empty/sample/current comparison | Start; sample explicitly fictional |
| 02 | Exact business activity | Save; empty value rejected |
| 03 | Years and visa assumptions | Save; fractional year is linear assumption, visas whole |
| 04 | Supplied option index | Add/inspect; no claimed 40-zone directory |
| 05 | New fee/activity record | Save; invalid/duplicate record retained for correction |
| 06 | Selected option and provenance | Edit/breakdown; source not authenticated |
| 07 | Edit/remove supplied option | Save invalidates prior comparison |
| 08 | Activity-list membership method | Exact match is not legal permission |
| 09 | Currency assumption | Uppercase three-letter code; no conversion |
| 10 | Quote/source notes | User notes do not verify a fee |
| 11 | Omitted-cost scope | Questions about unsupplied categories; no invented charges |
| 12 | Decision brief | Horizon/activity/options/currency; revise before run |
| 13 | Local-data boundary | Acknowledge actual calculation scope |
| 14 | Calculation plan | Visible formula, ranking and rounding method |
| 15 | Execute current local input | Revalidate; cancel/revise |
| 16 | Actual execution events | No invented provider/government activity |
| 17 | Ranked costs | Listed activities first, rounded cost second; not recommendation |
| 18 | Selected component arithmetic | Unrounded components, final half-up sum |
| 19 | Actual stacked cost composition and numeric table | Zero/out-of-range chart omitted with exact values retained |
| 20 | Activity-list matches | Supplied membership, not permit decision |
| 21 | Non-matching options | Missing/incomplete list not official denial |
| 22 | Independent sensitivity scenario | Recompute horizon/visas without replacing base packet |
| 23 | Two-option comparison | Two different names required; same premises |
| 24 | Explicit tax inputs | No preselected threshold/rate; blanks not zero |
| 25 | User-defined tax result | Formula and premises; not filing advice |
| 26 | Reviewer questions | User-authored, no legal recommendation claim |
| 27 | Decision packet structure | Current inputs, source notes and limitations |
| 28 | Complete copyable JSON export | Prepared/not filed; no PDF/send claim |
| 29 | Licensing handoff requirements | Scoped authority, exact content and actual receipt needed |
| 30 | Current in-memory history | No cloud persistence promise |
| 31 | Literal option-name search | Useful no-result state; no live directory |
| 32 | Privacy footprint | No external requests, account or analytics |
| 33 | Confirm local deletion | Clear inputs/scenarios/results; retain option available |
| 34 | Method/fee/permission/tax limitations | Expand answers; no unsupported success claim |
| 35 | Accessibility behavior and limits | Text/table equivalents, reduced motion, native testing pending |
| 36 | Correct assumption/cancel | Rerun current version; no external operation to undo |

The product has no login, pricing or advertising screens. Inspection controls are outside product chrome. Full native navigation for these views remains pending.

## Platforms, motion, accessibility and localization

iOS: actual native stack/back gesture, safe areas, system sheets, permitted fonts, document/share controls and 44pt+ targets. Android: system/predictive back, Material sheets, native fonts, system/IME insets and 48dp+ targets. Browser control shapes illustrate intent only. The source native overview uses existing navigation, an expandable cost index and editable tax assumptions; it is not 36 native screens.

Motion: browser 160ms ease-out/3px fade, interruptible by new render, disabled for Reduced Motion. Native transitions should follow platform patterns; optional single completion haptic only after confirmed work. No counting animation or artificial AI timer. New premise/result is communicated in text. Visible focus, written status, semantic chart/table, labels and sensible order target WCAG 2.2 AA. Native screen readers, large Dynamic Type, devices and measured frame rate remain pending.

English is implemented. Arabic/RTL requires reviewed terminology, native Arabic font/line heights, directional layouts and bidirectional isolation of numbers/IDs. Preserve canonical activity IDs independent of translated labels. Format dates/numbers by locale after the original source value is preserved; currency-specific precision is not verified by this two-decimal planning model.

## Engineering, data and quality review

`mobile/src/setupComparison.ts` is the source of native/browser arithmetic; `build-engine.cjs --check` catches stale generated output. Exact scaled-integer decimal operations use the supplied Number representation, sum before final half-up rounding, and sort integer minor units; already-lost JSON numeric precision cannot be recovered. Python parity tests apply to supported inputs; the new UI rejects ambiguous duplicates/fractional visa counts/currency strings the legacy schema may allow.

One-time fee + annual × years + per-visa × visas is the explicit model. It omits unsupplied costs. Fractional years imply linear multiplication, not a real prorated quote. Equal costs retain source order. The former fixed tax threshold/rate was replaced with blank editable assumptions and a single-bracket illustration. No current tax eligibility/exemption is inferred. Preserve no-account local access; production source/provider consent, accountless capability sessions, retention, durable work and connector receipts follow the structural plan and remain unimplemented.

Proposed production records: option/source/version, cost unit/validity, canonical activity, scenario revision, calculated components, reviewer questions, action approval and actual receipt. Input changes invalidate dependent artifacts/approval. Bound retries/cost; reconcile unknown delivery. Keep data per user/app and do not store secrets in clients. No new runtime dependency or Expo API was introduced.

QA uses the master weights (20 visual, 20 UX, 15 AI-native, 10 composition, 10 differentiation, 10 native, 10 accessibility, 5 feasibility) without inventing a validated 95+ score. Remaining weaknesses: full native flow absent, no current official sources, no agent/provider call, no licensing connector, no Arabic/RTL or physical-device acceptance. The unit is a design/implementation foundation, not production completion. See `VERIFICATION.md` for executed checks.
