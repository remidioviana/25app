# 25APP — Product experience acceptance plan

## Scope and implementation status

The existing mobile project is an Expo Router / React Native application with 25
standalone build variants, 25 editorial home compositions, application-specific
case forms, evidence views, workbenches and shared agent runtime. Shared
infrastructure is valuable; shared screen structure must not replace
product-specific interaction design.

Implemented in this revision:

- All 25 launcher configurations use the approved Premium 3D Ivory collection,
  including the explicitly selected Adab option 1, the closed Iqamah door,
  and the revised Tawassul artwork. The rejected flat Mobile-First assets are
  not used by these launcher configurations.
- The native launch screen uses the same approved artwork and ivory surface.
- The actual application's `BrandSignature` is typographic only: a large
  native title and restrained accent, including the internal home screen.
  The approved 3D artwork remains exclusive to launcher, native splash and
  commercial presentation material. It must not consume workspace height.
- Commercial deliverables: 25 landscape PDF pitch decks of 15 pages each
  and 25 cinematic 30-second demonstration videos. The approved mark belongs
  on presentation covers and footers; native splash targets approximately one
  second when startup permits, without adding an artificial startup delay.
- Existing distinct home compositions and functional case workflows remain intact.
- The existing alternate assets are preserved, not destroyed.

The image files and registry passed the local dependency-free asset verification.
Native build, lint, type checking, runtime tests and all device acceptance gates
remain open: the required Expo SDK 58 dependency cache is incomplete here.
Adab uses the standard launcher on Android until an approved transparent adaptive
foreground is available. No signed binary, physical iPhone, external reviews,
accessibility conformance or agent integration success is claimed.

## Product-specific design acceptance

These are review and implementation targets, not claims of completed usability
research. Each starts from the architecture already expressed in the repository.

| App | Human need and primary experience | Distinct interaction and acceptance proof |
|---|---|---|
| Himayah | Privacy reviewer; clause manuscript | Select a cited passage, inspect an obligation and navigate to its source; verify keyboard and VoiceOver reading order. |
| Iqamah | Visa applicant; dossier passport | Choose a route, add supporting documents, inspect missing items; distinguish readiness from eligibility or official approval. |
| Istithmar | Founder; jurisdiction comparison | Change one activity assumption and compare like-for-like results with traceable inputs; avoid unexplained totals. |
| Munagasah | Bid manager; requirement matrix | Connect evidence to a requirement, inspect unresolved rows and approve a draft; proof of review before submission. |
| Sahil | Resident; service path | Ask a service question, select prerequisites and open the official channel; test a missing prerequisite and offline recovery. |
| Tawteen | Workforce manager; policy roster | Inspect aggregate workforce calculations, their supplied basis and source context; review with real anonymized inputs, no inferred individual status. |
| Adl | Tenant or landlord; evidence chronology | Add a dated event and inspect supporting references; preserve neutral descriptions and distinguish estimates from verified findings. |
| Tawassul | Sales lead; account correspondence | Match account needs to approved facts and review an outreach draft; explicit approval before external communication. |
| Adab | Marketing editor; annotated copy | Edit original copy, inspect adaptations, compare alternatives and reject unsupported claims; test English and Arabic bidirectional selection. |
| Khidmah | Care operator; resolution desk | Review the customer's situation, policy basis and approval requirements before an external resolution; show a failed integration openly. |
| Jomrok | Trade operator; shipment manifest | Identify missing fields, inspect declared assumptions and verify sources; never equate a draft with official clearance. |
| Khibrat | Recruiter; evidence rubric | Inspect job-relevant evidence and missing criteria; test for fair, human-reviewed decisions, including ambiguous records. |
| Majlis | New executive; arrival book | Check onboarding actions and protocol context; respect personal preferences without stereotyping cultural norms. |
| Rafiq | Busy resident; day timeline | Reorder commitments and see a real scheduling consequence; show clashes and preserve user control. |
| Sawm | Fasting professional; intention and rest | Change chosen time constraints and regenerate an editable routine; avoid religious or medical directives. |
| Mizan | Values-led household; transparent ledger | Inspect source data and calculations, edit assumptions and distinguish guidance from authoritative financial advice. |
| Thawg | Dining guest; needs and shortlist | Filter by stated dietary needs, inspect dated evidence and uncertainty; never treat unverified claims as certification. |
| Manzil | Family; household book | Add a receipt, resolve duplicate entries and inspect category totals; verify persistent data and recovery. |
| Gurbah | Relocating resident; dependency journey | Mark a prerequisite complete and reveal subsequent tasks; show unresolved dependencies and official service links. |
| Amanah Eco | Household; resource observatory | Enter dated readings and compare periods with equivalent units; clearly distinguish entered data from connected utility data. |
| Nafas | Wellbeing user; breathing and gentle routine | Start, pause or cancel a session, including Reduce Motion; avoid diagnosing and preserve privacy. |
| Tadweer | Community recycler; material identification | Select material and condition, review handling guidance and verified routing; surface uncertainty in hazardous cases. |
| Turath | Learner; source folio | Navigate a topic, inspect citations and save learning progress; review Arabic text, cultural accuracy and attribution. |
| Himam | Person with accessibility requirements; route alternatives | Enter access needs first, compare verified barriers and flag uncertainty; test with real assistive technology users. |
| Hisad | Food rescue coordinator; handling checkpoint | Review handling, recipient capacity and draft dispatch; require appropriate verification and human approval. |

## Release gates for every variant

1. Build and run each distinct variant in a supported native iOS environment.
2. Validate initial state, empty state, meaningful task, loading, progress,
   approval, cancellation, result, errors, retry and persistence using real
   reachable services or honest explicitly labelled unavailable states.
3. Replace fixed-only appearance behavior with independently reviewed adaptive
   light and dark palettes; check actual rendered contrast and text sizes.
4. Complete English/Arabic localization of all task and error copy and test
   RTL/bidirectional content (existing Arabic fonts alone are insufficient).
5. Review focus order, dynamic type, touch targets, gestures and reduced motion
   with the operating system's accessibility settings and real users.
6. Evaluate full task navigation and product individuality independently;
   preserve meaningful native conventions and avoid decorative imitation.
7. Capture high-fidelity previews from the actual native builds; synchronize
   presentations and videos to verified functionality only.

Reference documentation: Apple Human Interface Guidelines
(https://developer.apple.com/design/human-interface-guidelines/),
Expo SDK 58 (https://docs.expo.dev/versions/v58.0.0/),
Expo Router (https://docs.expo.dev/versions/v58.0.0/sdk/router/),
and React Native accessibility and responsive layout documentation.
