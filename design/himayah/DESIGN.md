# APP 01 — Himayah AI

Status: design foundation and 32-view browser prototype delivered; native and live-service acceptance pending. This is a first app-specific unit under the master prompt's staged-delivery provision. It is not the full portfolio.

## 1. Product context and provenance

**Recovered identity.** Official name: Himayah AI. Existing title: “The UAE Compliance Shield.” Category: Business. Existing purpose: review supplier contracts for privacy and contract risks, with evidence attached. Existing external action: send counsel review packet. Source: `apps/apps.json`, `agents/himayah/agent.json`, `domain_tools.py::contract`, and the supplied implementation-status reports.

**Known behavior.** The Python domain tool performs case-insensitive literal phrase screening against supplied rules and returns flags, quotes and offsets. It does not interpret clauses, validate applicable legislation, or establish compliance. The shared runtime has separate model and storage mechanisms; this prototype does not connect them. The existing server health response reports no external connectors.

**Name.** The supplied source does not document the official naming rationale or approved Arabic brand spelling. Protection is an appropriate creative association, not a recovered brand fact.

**Problem hypothesis.** A small-business operator receives a supplier contract, cannot confidently locate relevant privacy provisions, and needs to prepare a focused, traceable question for counsel. Friction includes locating clauses, distinguishing absence of a word from absence of protection, and retaining source references across drafts. These hypotheses require interviews; no usability research is claimed.

**Primary user hypothesis.** A UAE SME operations or procurement manager with limited legal training and moderate mobile literacy, reviewing a vendor agreement under time pressure. Secondary user: the qualified reviewer receiving the evidence packet. The buyer/sponsor, exact company size, age distribution and real procurement process remain unconfirmed.

**Jobs.** Functional: identify checklist exceptions and assemble review evidence. Emotional: understand which issues need attention without a false promise of safety. Practical: revisit a finding, inspect the contract passage, revise the brief, and export a coherent packet.

**Positioning.** An evidence-first preparation workspace for human legal review. The envisioned live agent coordinates intake, retrieval and packet preparation under bounded authority; it never certifies compliance on the basis of a phrase match.

**Market.** UAE is explicit in the existing identity. Federal, DIFC and ADGM are proposed jurisdiction-context choices, not verified support for those regimes. English is the existing source language. Arabic/RTL is a proposed release requirement requiring translation, legal terminology review and actual layout tests. No additional jurisdictions are implied.

**Alternatives.** Manual review in a document editor, an external lawyer, and contract-review software are category alternatives. No current competitor feature, price or performance study was performed; naming a market leader would not establish a researched competitive advantage.

**Success measures.** Record time from launch to an inspectable finding; the fraction of started reviews that reach packet preparation; citation-to-passage integrity; user ability to distinguish screening from legal advice; recovery success after interruption; and source freshness coverage. No numerical product performance is claimed. A release gate should require every exported finding to preserve its input version and evidence references.

**Business and operating constraints.** Free access and no app account are product requirements. Inference, hosting, legal content maintenance and distribution are operating costs, not eliminated by that policy. Funding, usage budget, legal liability allocation, retention periods, team qualifications, competition rules and award criteria are absent. They cannot be reconstructed from the source ZIP.

## 2. Product-specific thesis

Use the structure of a carefully prepared review dossier: contract → explicit brief → visible checks → cited exceptions → human-review packet. Let typography, reading rhythm and evidence alignment carry the design. An exception list is more useful than a decorative compliance gauge or a chat transcript. A legal risk score would imply precision the current engine cannot support.

The signature home offers one action, “Review a contract,” followed by the most recent review. It shows no personal greeting unless a user legitimately supplies a preference. Empty state explains the first useful action instead of displaying zero-valued business metrics.

## 3. Three original creative directions

Scores are designer judgments from 1–5, weighted by the requested criteria; they are not measured usability results.

| Direction | Clarity 25% | Sophistication 20% | Originality 15% | Craft 15% | Accessibility 15% | Feasibility 10% | Weighted /100 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Evidence Ledger | 5 | 4 | 4 | 5 | 5 | 5 | 93 |
| Counsel Editorial | 4 | 5 | 4 | 4 | 4 | 4 | 84 |
| Clause Atlas | 3 | 5 | 5 | 4 | 3 | 3 | 77 |

**Evidence Ledger — selected.** Precise, measured, quiet. Navy typography, neutral paper surfaces and restrained emerald confirmation. System sans serif with tabular evidence counts; serif only for quoted passages. Single-column lists, one dominant action and a linear preparation journey. Components resemble index rows rather than dashboard cards. Motion uses short fades and continuity of position. Intelligence appears as operational steps and evidence references. Large labels and non-color statuses improve accessibility. iOS uses native stacks/sheets; Android uses Material navigation/back behavior. Feasible within the existing shared React Native architecture, subject to SDK verification before implementation.

**Counsel Editorial.** Deliberate and reading-oriented. Warm neutral paper, deep charcoal, restrained copper; an appropriately licensed editorial serif for document headings and native sans for controls. Full-width annotated contract pages with a contextual annotation rail. Reading/annotations are the primary navigation. Passage expansion is the characteristic motion; selected text anchors AI suggestions. Adjustable measure and text size are required. iOS and Android would need different text-selection and contextual-menu implementations. More demanding to engineer due to synchronized annotations and complex text selection on mobile.

**Clause Atlas.** Analytical and exploratory. Indigo-gray palette, system typography, linked-clause map with an equivalent ordered list. Navigation follows relationships among clause, source and issue rather than a fixed dashboard. Node-to-detail transitions visualize dependencies; AI highlights references, never hidden reasoning. The map cannot be the only accessible interface. Native gesture and screen-reader equivalents require substantial work on both platforms. Lower initial feasibility and greater risk of implying that a visually complete graph means legally complete analysis.

## 4. Visual foundations

### Semantic color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| background | #F5F7FA | #0B1220 | Main workspace |
| surface | #FFFFFF | #152133 | Document and focused forms |
| text.primary | #0B192C | #F3F6FC | Content |
| text.secondary | #526174 | #B6C2D2 | Context and dates |
| divider | #D8DEE8 | #35455A | Structural separators; not status |
| action.primary | #0B192C | #DDE9FA | Primary control fill |
| action.onPrimary | #FFFFFF | #0B192C | Primary control label |
| interactive.soft | #EDF1F6 | #223149 | Selection and subdued feedback |
| status.success | #086344 | #87DFC0 | Completed local check, with label |
| status.warning | #875000 | #FFD18A | Needs review, with symbol |
| status.error | #A8262B | #FFADB0 | Failure/invalid input, with message |
| status.information | #526174 | #B6C2D2 | Context; no implied verification |
| agent.processing | #526174 | #B6C2D2 | Running activity, labelled |
| agent.completed | #086344 | #87DFC0 | Confirmed operation only |
| agent.approval | #875000 | #FFD18A | Awaiting explicit approval |
| action.unavailable | #526174 | #B6C2D2 | Explain unavailable capability |

Status colors are tested as text on background/surface, never assumed to be readable as arbitrary combinations. Native high-contrast modes require separate device validation. Existing brand emerald #10B981 is retained in source assets but darkened for readable text in this proposed system.

### Typography and geometry

iOS implementation: native system font, no redistribution of Apple-restricted fonts. Android: native Roboto/system fallback. Browser prototype: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; quotation passages use Georgia/serif. Arabic release needs native Arabic fallback reviewed with real content.

| Role | Size / line height | Weight | Tracking |
|---|---|---|---|
| Display number | 64 / 70 | 500 | −3 px |
| Large title | 32 / 36 | 650; Android 500 | −1.2 px |
| Medium title | 24 / 30 | 600 | −0.5 px |
| Section heading | 19 / 25 | 600 | −0.3 px |
| Row heading / body | 16 / 24 | 600 / 400 | 0 |
| Primary label | 14 / 21 | 600 | 0 |
| Secondary body / caption | 13 / 20 | 400 | 0 |
| Eyebrow | 11 / 17 | 650 | +1.5 px |
| Quote | 19 / 30 | 400 | 0 |
| Monospaced evidence ID | 13 / 20 | 400 | 0 |

Use tabular numerals for counts, dates and aligned data. Large titles wrap; paragraph measure is about 35–55 characters on phones. A 4-point spacing base supports 8/12/16/20/24/32 groupings. Content margin: 24 logical units at a 390-wide viewport, 18 at narrow widths; native platforms must respect actual insets rather than hardcoded browser dimensions. Primary controls: 52 high, radius 13 on iOS and 24 in the Android preview. Main row targets: at least 48 high. The reference banner is outside production chrome.

Use optical alignment of labels and values; avoid enclosing every row in a card. One document/form surface may be bounded. No decorative gradients, blur or glass effects are needed. Dark mode is separately tokenized. Browser frame/shadow is a presentation device, not a native window requirement.

**Iconography.** Original shield mark in the prototype, 1.7 stroke in a 24×28 grid; structural icons should use a single platform-appropriate library at roughly 20–24 logical units. Production iOS may use permitted SF Symbols; Android uses equivalent Material symbols. Back and overflow controls retain accessible labels. No icon alone establishes status or legal authority.

## 5. UX architecture and five complete journeys

Primary navigation: Review / Library / Activity. Privacy and help are reached from the header. There is no cross-product catalog, login, pricing, subscription, app account or mandatory tutorial. Launch is the platform splash into home; optional guidance is contextual rather than three artificial onboarding pages.

| Journey | Entry and route | User decisions | Agent behavior / authority | Edge case and recovery | Successful outcome |
|---|---|---|---|---|---|
| First use | Home → sample/paste → scope → checklist → brief → plan → consent → run | Input, jurisdiction context, rules, local-processing acknowledgement | Locally validates and screens; no external access | Empty contract/rules: inline explanation and return to editor/checklist | First inspectable finding with truthful method |
| Main review | Home → document → run → results → finding → passage → provenance | Which exception to inspect | Returns exact-match positions; separates rule flags from legal significance | Missing phrase: evidence-gap route, no fabricated quote | User can verify a flagged rule against its input |
| Advanced bounded workflow | Brief → source/plan review → orchestrated intake/retrieval/triage → intervention → packet | Source scope, ambiguity resolution, future action authority | Proposed production agent may read only approved inputs and produce drafts; no counsel send without version-bound approval | Stale source, provider failure or cancelled job becomes partial/failed; resume safe read steps | Draft packet with source/version lineage; live orchestration is pending |
| Interpret and act | Results → finding → reviewer question → packet → export preview → completion record | Edit question and inspect exact outgoing contents | Produces a local copyable packet; no external delivery | Missing legal evidence is preserved in packet, never hidden | Human-review handoff with limitations attached |
| Recover and continue | Activity → recovery → edit contract/rules → run | Cancel, revise or clear session | Invalidate stale findings when reviewed inputs change | Invalid input preserves draft; deletion clears local state | New result tied to current input, or an explicit local cancellation |

Production lifecycle: discovery should explain the review boundary; installation leads directly to home; optional guidance supports activation; inspectable findings deliver first value; history and renewed source checks support repeated use; reliable evidence and controls support trust. Habit/retention and acquisition assumptions remain unvalidated. Notifications are contextual future task events, not engagement prompts.

## 6. AI-native and agentic contract

Primary interaction is structured review, not a chat wall. Natural-language objectives are bounded by explicit documents and rules. The activity timeline reports observable operations, not internal chain-of-thought.

| Lifecycle | User-facing message / treatment | Available action / error behavior |
|---|---|---|
| Idle | “Review a contract.” Home + useful empty state | Paste/sample; optional guide |
| Input | Editable contract and rule list | Retain invalid draft; identify missing field |
| Interpretation | Objective, jurisdiction context, input/rule counts | Edit the brief before any processing |
| Planning | Validate → screen → assemble → human review | Revise scope; cancel |
| Execution | Actual local events; no fake percentage | Local run is synchronous; production async worker must report real checkpoints |
| External action | “Sending is not connected.” | Prepare local packet; explain integration requirements |
| Human approval | Exact recipient, document version, attachment summary in production | Approve once, revise or decline; not wired here |
| Completion | “Prepared. Not sent.” | Inspect result and copyable packet |
| Partial completion | Completed checks separated from missing source/provider operations | Resume only failed safe steps; invalidate dependent conclusions |
| Recovery | Actionable input/source/provider boundary | Edit, retry within bounded limits, cancel |
| Revision | Input version changes invalidate dependent results | Rerun to generate a new result |
| Historical review | Run status, evidence and operation receipts | Reopen within retention/permission boundary |

Production task states: proposed → awaiting approval → running → completed / partially completed / failed / cancelled. Approval is not needed for every safe local calculation; it is needed for consequential external actions and separately for disclosing text to an external provider. A text-screening run completing never means a legal review has been completed.

**Authority.** Automatic within selected scope: text extraction, retrieval from approved sources, literal checks, preparation of a draft. Requires intervention: ambiguous entity/jurisdiction, unreadable evidence, conflicting versions. Requires explicit approval: transmitting contract/packet, adding a new external destination, or a consequential operation. Forbidden without actual implementation: official submissions, compliance certification and an unconfirmed delivery-success claim.

**Evidence.** Each finding should bind to document ID/version/hash, passage ID, offsets, source authority/version, method, tool event and reviewer edits. No invented probability/confidence. Separate matched text, user assertions, dated legal evidence and model interpretation. Document instructions are untrusted content, not agent commands.

**Pause/cancel.** Production workers check a cancellation token at safe boundaries, stop queued work, and record already-confirmed effects. Cancelling does not undo an external send; a timed-out send becomes delivery-unknown until reconciled. Use idempotency keys and a receipt lookup before retrying an action.

## 7. Screen ecosystem

The prototype provides the 32 browser views below. “Native adaptation” is specified later; changing a browser control's radius is not proof of a native build. Global recovery: back returns within the journey; input changes invalidate old findings; no-data result views show a start-review action.

| # / screen | Purpose and content hierarchy | Primary interaction / next step | Distinct failure or boundary |
|---|---|---|---|
| 01 Review home | Purpose → review CTA → recent work → legal boundary | Start 03; reopen 15 | No review: actionable empty state |
| 02 How review works | Input → rules → inspect evidence | Start 03; inspect linked steps | Optional; no forced onboarding |
| 03 Choose document | Paste or fictional sample → format limits | Paste/sample → 04 | PDF/image extraction explicitly unavailable here |
| 04 Contract editor | Label → editable text → length/method limit | Save non-empty text → 05 | Empty text: error; preserve draft |
| 05 Review scope | Objective → jurisdiction → rule count | Save → 07; jurisdiction → 06 | Empty objective blocks continuation |
| 06 Jurisdiction | Context boundary → selectable jurisdiction | Save → 05 | Selection does not validate applicable law |
| 07 Checklist | Rule label → flag condition → phrase | Add 08; remove; continue 09 | Zero rules blocks execution |
| 08 Add rule | Label → phrase → absent/present condition | Add → 07 | Empty field rejected without losing other field |
| 09 Source pack | Contract and rules → missing legal corpus | Inspect input/provenance; continue 10 | No authenticated law presented as available |
| 10 Review brief | Objective → jurisdiction → input/rule counts | Plan 11; revise 05 | No legal determination implied |
| 11 Execution plan | Four operational milestones | Consent 12; revise 05 | No invented ETA or pre-completed steps |
| 12 Processing consent | Actual local data boundary → acknowledgement | Acknowledge → 13 | Required acknowledgement missing: inline message |
| 13 Run local review | Validated inputs → execute/cancel | Run → 14; recovery 26 | Revalidate missing text/rules at execution |
| 14 Agent activity | Actual events → pending human review | Results 15 | No run: start-review state |
| 15 Results overview | Exception count → check/match/source counts → findings | Finding 16; packet 21 | Counts reflect checks, not compliance percentage |
| 16 Finding detail | Rule → presence → flag condition | Passage 17 or gap 19; provenance 18 | Phrase absence is not semantic absence |
| 17 Contract passage | Quote → exact offsets → origin | Back 16; full text 04 | No quote invented for missing phrase |
| 18 Rule provenance | Owner → authority → dates → legal effect | Source boundary 09; checklist 07 | Unknown authority/dates explicitly labelled |
| 19 Missing evidence | Gap explanation → inspect → source → reviewer | Question 20; revise 07 | No legal conclusion from absence |
| 20 Draft recommendation | Template label → editable reviewer question | Save → 21 | Explicit template; not AI/legal output |
| 21 Packet builder | Contract → findings → question → limitations | Preview 22 | No findings: start-review state |
| 22 Export preview | Summary → read-only copyable complete packet | Select/copy text; completion 32 | PDF/native share not claimed |
| 23 Saved reviews | Session-only retention boundary → available run | Reopen 15; search 24; start 03 | Reload clears prototype data |
| 24 Search library | Search field → matching rule labels/phrases | Search; checklist 07 | No results: plain empty state; literal method |
| 25 Task history | Status → event rows | Inspect activity 14; recovery 26 | No events: explicit empty history |
| 26 Recovery | Retained-draft boundary → edit/rules/cancel | Edit 04; rules 07; cancel → 25 | External effects are not active here |
| 27 External services | Unavailable send → prepare/approve/verify requirements | Return to packet 21 | No dummy connect/send button |
| 28 Privacy controls | Data location → processing → deletion → accessibility | Delete 29; accessibility 30 | Does not promise anonymity for future backend |
| 29 Delete local data | Exact deletion scope → destructive action/cancel | Clear → 01; keep → 28 | No claim of deleting provider/server copies |
| 30 Accessibility | Motion → readable type → non-color status → testing boundary | Return 01 | Native assistive technology still unverified |
| 31 Help and limitations | Method, law, delivery, infrastructure disclosures | Expand answers; plan 11 | No assurance of free hosting/inference |
| 32 Completion record | Prepared checks/packet → unresolved law/delivery | Inspect evidence; return home | Completion is local preparation only |

Native launch uses the existing per-app splash and transitions to 01; it is not counted as another full-feature screen. Production permissions use native document pickers without requesting broad library access. Notifications are requested only if the user opts into a real long-running task update. Advanced intervention, externally approved send, partial completion and provider-failure screens require the production worker/connector; their lifecycle is specified here, not falsely represented as functioning live integrations in the prototype.

## 8. Design system and interaction states

| Component | Required states and behavior |
|---|---|
| Primary action | Default: navy fill; pressed: slight opacity feedback; focus: visible ring; loading: text names operation; disabled: reason nearby; success/error shown in outcome, never only color |
| Secondary/text action | Border or underlined label; pressed/focus states; minimum touch area; distinguish navigation from destructive operations |
| Text field / editor | Persistent label; editable draft; invalid field + message; read-only export selectable; no placeholder-only meaning |
| Checklist row | Label/condition/phrase; remove action names target; empty rules state; large text wraps |
| Evidence row | Source + passage/offsets; unavailable source labelled; selection opens detail rather than expanding an opaque score |
| Status label | Icon/word/color; proposed, approval, running, partial, failed, cancelled distinct; no fictitious progress |
| Activity timeline | Actual milestone events; pending milestones have distinct symbol and text; no timer-based fabricated operations |
| Approval panel | Exact payload/recipient/version + approve/decline; invalidated by payload change; external implementation pending |
| Sheet/dialog | Native dismiss/back; focus containment/restoration; destructive action separated from cancel; browser delete screen is not native modal proof |
| Search | Native input, local literal method, submitted query, results, empty and validation states |
| Source/attachment | Source identity, type, version, readiness, retry/remove; native extraction errors separate from semantic unknowns |
| Results | Explain denominator; no legal “safe” badge from absence of flags; no color-only charts |

Charts are deliberately limited to factual counts here. A donut gauge of “compliance” would misrepresent current evidence. A future task-history trend requires actual comparable dated reviews and an accessible table; it is not fabricated to satisfy a visual brief.

## 9. Motion and haptics

| Trigger | Purpose / timing / curve | Interruption / reduced motion / haptic |
|---|---|---|
| Navigation | Native transition, about 220–300 ms per platform | Follow native interactive back; reduced motion uses fade; no decorative haptic |
| Browser view change | 160 ms ease-out, opacity .6→1 and Y 3→0 | New render supersedes; reduced motion disables; no haptic |
| Evidence expand | Proposed 180 ms ease-out, preserve source anchor | Interruptible; instant disclosure if reduced motion; none |
| Check completes | Label/status update immediately after actual tool event | Never delayed to dramatize AI; optional light native confirmation only on whole-task completion |
| Approval sheet | Native sheet entrance and focus transfer | Dismiss before submission; reduce per system; no repeated pulse |
| Invalid field | Immediate inline text; no shake | No movement; native error haptic at most once per submission |

Do not animate between unverified numbers. Main content remains accessible without motion, transparency or haptics.

## 10. iOS and Android handoff

Retain existing Expo/React Native and shared domain/runtime logic; no architecture replacement is justified for visual styling. The repository declares Expo 58, React Native 0.88.1 and React 19.3.0. Verify compatible versioned Expo documentation and actual package availability before changing Expo APIs; this delivery introduces no Expo API changes.

| Aspect | iOS | Android |
|---|---|---|
| Navigation | Native navigation stack, title/back label, interactive back | Native back stack, system/predictive back, Material navigation bar |
| Insets | Respect notch/home-indicator/keyboard through actual safe-area measurements | Respect system bars, edge-to-edge insets and IME |
| Actions | Platform sheets and confirmation dialogs | Material bottom sheets/dialogs and back-dismiss semantics |
| Input | Native document picker/share sheet; no broad file permission by default | System document picker/share intent; scoped URI access |
| Type | Native system font and Dynamic Type | Native font and user font/display scaling |
| Touch/accessibility | At least 44 pt; VoiceOver order/traits | At least 48 dp; TalkBack and switch-access semantics |
| Motion | Native interactive transition and Reduce Motion | Native transition and system animation preferences |
| Task resumption | Background execution subject to OS limits | Background work subject to OS/foreground restrictions |

Browser platform selection demonstrates visual intent only: back glyph, type weight and control shape change. It does not implement predictive back, VoiceOver, native haptics, background execution, secure storage or native sheets.

## 11. Accessibility and localization

Target WCAG 2.2 AA where applicable. Preserve visible focus, logical DOM/native accessibility order, labelled buttons/fields, non-color statuses and explicit errors. Check text on its actual surface in both themes. Do not use soft dividers as meaningful focus boundaries. Touch controls are 48+ px high in the browser; inline checkbox labels add an enlarged activation area. Do not truncate rule labels or evidence references.

The browser smoke check covers widths 320/390/430/736. Production acceptance must include smallest supported iOS/Android devices, 200% text, the largest supported Dynamic Type, TalkBack/VoiceOver, keyboard and switch access. The browser layout is not a claim of completing that audit.

Localization handoff: externalize all strings; review English and Arabic with domain specialists; mirror direction-aware navigation and spacing, not document text or all symbols blindly. Keep evidence offsets attached to original text, not translated display strings. Isolate bidirectional identifiers/URLs; choose Arabic font and line heights on actual devices. Use locale-aware dates and numerals. Jurisdiction-specific terminology needs legal review. English copy exists in this delivery; Arabic translation and RTL prototype are pending.

## 12. Data and engineering contract

### Accountless architecture

Immediate local access must not depend on entering a server URL/token. For production server-assisted tasks, transparently issue a scoped anonymous installation/session capability over TLS, keep it in native secure storage, bind object access to it, and enforce budgets, rate/abuse limits and expiry. This is pseudonymous session handling, not a claim of anonymity. The current operator token setup is a development connection model, not a finished consumer onboarding experience.

Do not embed model API credentials in the app or rely on a borrowed ChatGPT account. The supplied backend currently defaults to a Groq-compatible endpoint while using `OPENAI_API_KEY` as its configuration name. That variable name does not prove that an OpenAI subscription or API account is indispensable. Provider choice, actual model availability and costs require live verification. GitHub is the requested source host, not a requirement for inference itself.

Minimize uploaded data, obtain explicit external-processing consent, separate local and remote retention, and specify provider deletion limits before release. Local preferences/history may use an on-device database with appropriate protection; platform key storage holds only credentials/capabilities. The browser prototype holds user text/results in memory and persists only a screen selection via the optional conversation host.

### Proposed data records (new requirements, not existing API claims)

- `Review`: id, session owner, objective, jurisdiction context, document version/hash, rule-set version, created time and processing-consent version.
- `Rule`: id/version, owner, exact phrase, flag condition, source identity and validity where supplied.
- `Finding`: review version, rule version, method, presence/flag, original-text ranges, excerpts, source IDs and unresolved issues.
- `TaskEvent`: task/run ID, sequence, stage, state, verified timestamps, tool operation ID and safe failure reason; no raw hidden reasoning.
- `Approval`: exact payload hash, destination, scope, expiry, approved/rejected time; changed payload requires new approval.
- `DeliveryReceipt`: operation/idempotency ID, confirmed service reference or unknown status; never infer success from request dispatch.

Preserve existing domain tool contracts while introducing adapters. Do not silently change `flagged` to mean a legal determination. JavaScript uses UTF-16 indexing by default while Python indexes Unicode code points; the prototype explicitly converts display offsets to code-point indices. Semantic retrieval needs document passage IDs and model-generated statements linked back to immutable evidence. Cross-language case-folding equivalence still needs corpus tests.

### Failure and performance requirements

Bound provider retries; distinguish rate limiting, invalid credentials, transport failure and refusal. Do not endlessly rotate keys or promise no duplicate billing after a lost response. Cancel stale requests and discard results whose review version changed. Long model tasks should be durable server jobs, not assumed to survive app suspension. Incrementally render large evidence lists and avoid transmitting the entire contract on every interaction. Profiling on real low/midrange devices is pending; no 60 fps guarantee is made.

Production legal retrieval requires licensed/current authoritative sources and jurisdiction checks, not a fabricated static corpus. External counsel delivery requires a real connector and receipt reconciliation. Store distribution requires developer enrollment, signing and policy review; no fixed fee estimate is asserted. EAS is one compatible build route, not proof that a signed app already exists.

## 13. High-fidelity prototype and review

`index.html` is a self-contained browser rendering of the 32 views with light/dark product tokens and iOS/Android visual intent. It operates without a service. Its local screening uses the supplied two-rule fictional sample, generates evidence ranges, prepares copyable packet text, and invalidates dependent results after input changes. It does not use timer-generated AI progress.

The screen selector is an inspection aid, not production navigation. The normal journey connects home, intake, scope, rules, sources, brief, plan, consent, run, results, evidence and packet. Error/recovery, search, deletion, privacy and help are connected. A route opened without prerequisite data offers a start action.

Quality review follows the requested weights: visual craftsmanship 20, UX 20, AI-native 15, composition/type 10, differentiation 10, native behavior 10, accessibility 10, engineering feasibility 5. No aggregate 95+ quality claim is made. Browser mechanics and visual inspection can be assessed now; native behavior, research and external evidence cannot receive a validated score yet.

Material weaknesses remaining: browser frame is not native chrome; advanced production agent/intervention states are specified rather than connected; jurisdiction choices do not verify legal applicability; no Arabic/RTL build; no real provider, official-source or counsel-service validation; no device ergonomics or native screen-reader audit. Review these before expanding the visual system into the existing native app.

## 14. Acceptance and next execution boundary

This unit provides the first design foundation, not final release acceptance. Before calling Himayah a functioning agentic mobile product, demonstrate one task from native document intake through source-backed analysis to a human-approved, receipt-confirmed external action, with a recoverable failure case and truthful source provenance. If the product remains a local triage tool, label and evaluate it as such.

Native implementation should first carry home → text intake → scope/rules → real local screening → evidence → packet into the existing app, then test it on actual iOS and Android devices. Only then connect a durable agent worker and approved evidence sources, followed by separately approved counsel delivery. Keep the remaining 24 packages pending in the tracker rather than copying this legal-review architecture into unrelated domains.
