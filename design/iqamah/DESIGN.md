# APP 02 — Iqamah AI

Delivery 02: original product design, 34-view browser prototype and a functional native-overview correction. Full native journeys, official sources, live agent orchestration, submission and device acceptance remain pending. No visa outcome is promised.

## 1. Recovered product context

**Identity.** Official name: Iqamah AI. Existing category: Personal. Source tagline: “A visa dossier, ready for human review.” Existing internal title: “The Golden Visa Procurer.” The source establishes a Golden Visa preparation theme, not a supported legal route, a guaranteed ten-year visa or procurement authority. This delivery preserves the product name while removing the unsupported “10-year visa dossier” label from the native domain overview.

**Sources.** `apps/apps.json`, `agents/iqamah/agent.json`, `brand-assets/brands.json`, `domain_tools.py::checklist`, and the original native domain component. The source's example supplies review date `2026-11-14`, requirements `passport` and `income_evidence`, and one passport record expiring `2028-01-01` with reference `passport.pdf, p.1`. These are fictional inputs, not a current official immigration checklist.

**Name origin.** The approved naming rationale and approved Arabic spelling are not in the source. Residency is an appropriate creative association; it is not a recovered brand-origin fact.

**Problem hypothesis.** An applicant assembling a residency dossier cannot easily distinguish missing records, recorded expiry problems and evidence that exists but has not been authenticated. Existing friction includes route confusion, inconsistent names, missing references and uncertainty about which next action is useful. A neat checklist can create misplaced confidence if it is mistaken for an eligibility assessment.

**Users.** The source brand persona is “Visa applicants.” Proposed primary persona: a UAE residency applicant organizing their own records, with ordinary smartphone literacy and little immigration-law expertise. Secondary users: a family helper and a qualified adviser receiving a review packet. Applicant categories, income bands, languages, age distribution, exact jurisdiction/authority and adviser workflow are unconfirmed. No real interviews have occurred.

**Jobs.** Functional: assemble a traceable dossier and identify metadata gaps. Emotional: replace uncertainty with a clear, bounded next step. Practical: correct a recorded expiry, locate a reference, distinguish present/unverified from missing, and prepare a packet for a human reviewer.

**Positioning and vision.** A private preparation folio for evidence, not an eligibility oracle. A future bounded agent can organize an approved checklist, ask about gaps and coordinate a review handoff. It must not invent official requirements or file an application without a real authorized channel and a confirmed receipt.

**Markets.** UAE/Golden Visa context is recovered. No specific issuing authority, route criteria or official data license is established. English exists in source. Arabic/RTL is a planned market requirement, not a delivered translation. No broader regional support is assumed.

**Alternatives.** A folder/spreadsheet, official application portal, relocation adviser or immigration lawyer. No live competitor pricing, market-share study or comparison benchmark has been performed. Differentiation hypothesis: visible evidence uncertainty and exact record lineage rather than a flattering “ready” percentage.

**Success measures.** Time to first correctly categorized evidence gap; completion of a current packet; duplicate/date correction success; fraction of findings with inspectable references; user understanding that “present” is not “eligible”; and successful resume after revision. Product metrics are proposals, not measured outcomes. Acceptance examples: all statuses are explainable; every date comparison names its reference date; a changed input invalidates the prior result.

**Constraints and missing context.** No mandatory app account, login, ads, subscriptions or payment. Infrastructure still needs a sponsor or viable local execution. No operating budget, official partnership, legal-review contract, retention agreement, competition rubric or native device test is supplied. Do not invent these to complete a strategy template.

## 2. Independent design thesis

Make the experience feel like a carefully indexed personal dossier: warm paper, a restrained gold register, editorial headings, narrow dividers and generous reading space. The first action prepares evidence; it never asks for a passport number or displays an approval probability. A document index, recorded-date context and next-action list organize the product. This differs from Himayah's exception/passage review and does not reuse a legal-risk dashboard.

The home opens with “A clearer path. One document at a time.” and one primary preparation action. A separate fictional sample makes demonstration data explicit. The real first-use state has no invented requirements or documents. Counts appear only after a real local check.

## 3. Three creative directions and selection

| Direction | Clarity 25% | Sophistication 20% | Originality 15% | Craft 15% | Accessibility 15% | Feasibility 10% | /100 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dossier Folio | 5 | 5 | 4 | 5 | 4 | 5 | 94 |
| Journey Ribbon | 5 | 4 | 4 | 4 | 5 | 4 | 88 |
| Evidence Mosaic | 3 | 5 | 5 | 4 | 3 | 3 | 77 |

These are subjective concept-selection scores, not usability findings or final product QA scores.

**Dossier Folio — selected.** Reassuring, precise, private. Warm neutral paper, deep ink, accessible dark gold and a native-sans/serif reading hierarchy. A vertical document index and compact record folio dominate; navigation is Dossier / Documents / Next steps. Components use rectangular paper proportions instead of rounded analytical cards. Brief fades and native sheet continuity communicate state changes. Intelligence is visible as recorded checks and a prepared action list. Scalable text and fully labelled statuses compensate for editorial typography. iOS can use native stacks and document sheets; Android adopts native sans headings and Material controls. Feasible with existing React Native primitives; official retrieval is a separate service dependency.

**Journey Ribbon.** Practical and encouraging. Mineral blue, ivory, dark charcoal; native typography throughout. A large ordered journey leads from requirements to each evidence task, with inline completion history. Motion advances the current step only after an actual operation. Missing evidence drives agent intervention. Strong accessibility from ordered structure; native back follows the task path. Feasible, but may imply a fixed official route before criteria are verified and can add steps for users who already possess documents.

**Evidence Mosaic.** Exploratory and visually rich. Muted amber/charcoal with document-cover imagery, native labels and a spatial group of requirements. Navigation emphasizes document clusters and drag-to-link; motion preserves record position. AI would propose links that users confirm. An equivalent ordered list is mandatory for screen readers. Native drag/drop and a dense mobile layout raise implementation and misclassification risks. Attractive for a future adviser workspace, weaker for first-time applicants.

## 4. Visual system

Existing brand primary `#D4AF37` remains in source assets. It is too light for small text on paper, so this design uses a darker semantic gold for readable labels rather than changing the app's official name or asset identity.

| Token | Light | Dark | Rule |
|---|---|---|---|
| background.paper | #FBF8F0 | #171A20 | Main content |
| surface.document | #FFFDF8 | #21262E | Record folio and fields |
| text.primary | #222B36 | #F3EEE2 | Body, headings |
| text.secondary | #535D69 | #C2C5CC | Explanations, metadata |
| brand.readable | #705716 | #E8CC83 | Section index and selected state |
| divider | #D9D1BD | #484537 | Nonsemantic grouping |
| interactive.soft | #F0E9D9 | #302D24 | Selection and restrained feedback |
| action.primary | #273340 | #E8CC83 | Main action fill |
| action.onPrimary | #FFFDF8 | #20242B | Main label |
| status.missing / approval | #8B4A00 | #FFD08E | Written “Missing” / “Awaiting approval” |
| status.expired / error | #A02D30 | #FFB4AB | Written error, never color alone |
| status.completed | #21614E | #A5DBBE | Confirmed operation only |
| status.unverified / information | #535D69 | #C2C5CC | Presence without authentication |
| agent.processing | #705716 | #E8CC83 | Actual active operation, with text |
| action.unavailable | #535D69 | #C2C5CC | Explain a missing integration |

Dark mode changes paper/surface relationships and uses softer light ink; it is not an inverted photograph. No translucency, decorative gradients, blur, national insignia or official-looking seal is used. The original index-corner mark in the browser is an exploratory symbol, not a government endorsement or replacement app icon.

### Type and layout tokens

Browser/iOS design intent uses Georgia/system serif for editorial headings with system-ui/-apple-system/Segoe UI/native sans for controls. Native iOS implementation should select permitted system/licensed fonts. Android intent uses native sans headings and controls. Do not distribute Apple-only fonts to Android. Arabic typography needs licensed/native Arabic fonts reviewed with real terminology.

| Role | Size / line-height | Weight / tracking |
|---|---|---|
| Editorial title | 37 / 42; narrow 33 / 37 | 400; −1.2 px |
| Android title | 34 / 38 | 500; −0.6 px |
| Record title | 28 / 34 | 400 serif |
| Section heading | 18 / 27 | 600; −0.2 px |
| Row heading | 16 / 22 | 600 |
| Body/input | 16 / 24 | 400 |
| Secondary body | 13 / 20 | 400 |
| Field label | 14 / 21 | 600 |
| Eyebrow | 11 / 17 | 650; +1.6 px |
| Index/status | 12 / 19 | 400 / 600 |
| Count | 32 / 35 | 400 serif; tabular figures |

Browser typography uses relative units so content scales at 200%; the wordmark and navigation glyphs retain bounded logo/icon dimensions. App frame is max 412 CSS pixels; main margin 28, reducing to 20 on narrow screens. Spacing base 4, with 8/12/16/20/24/28/32 groups. Record corners 5, action corners 10 iOS intent / 24 Android intent. Primary action minimum height 54, other controls 48. Native dimensions use pt/dp and actual safe areas. The desktop inspection controls are not part of the product.

Icon language: simple 1.4–1.7 stroke with consistent optical alignment, native platform equivalents for navigation and original identity mark only where appropriate. Distinct status words and source details carry meaning; no icon establishes authenticity. Long labels, references and translated text must wrap.

## 5. Human-centered architecture and journeys

Three product destinations: Dossier (context/brief/check), Documents (records), Next steps (gaps and reviewer preparation). Session history/search/privacy are secondary. There is no forced tour or personal greeting. Installation should lead directly to useful local preparation; confidence comes from inspectable records and honest boundaries, not reminders intended to increase engagement.

| Journey | Entry and route | Decisions / local or agent behavior | Edge case / recovery | Success |
|---|---|---|---|---|
| First use | 01→02→03→04→06→10→12→13→15→14→16→17→18 | User supplies route, requirements, metadata/date; local tool validates and categorizes | Empty checklist/date error keeps draft; sample is separately labelled | Understand one real evidence gap |
| Main preparation | 06→07→08→10→16→18→19/20/21→22 | User links exact names; tool reports dates and references | Duplicate names block overwrite; blank expiry is unknown | Inspect each missing/expired/unverified classification |
| Bounded advanced workflow | Brief→plan→approved source retrieval→gap intervention→packet→human handoff | Future agent may organize and ask about gaps; approved source scope and fresh evidence required | Conflicting criteria/issuer records trigger intervention, not guessed eligibility | Traceable draft packet; live retrieval/orchestration remains pending |
| Interpret and hand off | 18→23→24→25→26→27 | User writes questions and inspects exact outgoing content | Missing official source/unknown expiry remains visible in packet | Copyable dossier prepared; submission explicitly not performed |
| Recover and revise | 34→04/06/10→run→summary; or 30→31 | Correct data or cancel; changed inputs invalidate results | Invalid edit preserved; cancellation does not invent an official rollback | Current result tied to current inputs, or cleared session |

Retention should derive from genuine renewal/review needs after source validation, not a claimed universal visa timeline. Reminder opt-in needs a real task and a verified date. No notifications permission is requested in this prototype.

## 6. AI-native lifecycle and agent authority

The local implementation is a deterministic preparation tool. It is not represented as a working autonomous immigration agent. The agentic production contract is specified separately.

| State | Presentation | Action and failure rule |
|---|---|---|
| Idle | Preparation home; optional fictional sample | Start without identity/registration |
| Input | Requirement list and editable record metadata | Label fields, preserve invalid drafts |
| Interpretation | Route context + date + counts | Edit without inferring a supported visa route |
| Planning | Validate→compare→prepare next steps | No fabricated ETA or official deadline |
| Execution | Actual local events | Synchronous check; no timer-driven progress |
| External action | Official handoff states “not connected” | No dummy send or login button |
| Human approval | Planned exact-payload/authority review | Required before future official transmission or consequential operation |
| Completion | Local packet prepared; eligibility not determined | Inspect exact records and limitations |
| Partial completion | Future source results separated from unresolved criteria | Local prototype does not invent source completion |
| Recovery | Specific duplicate/date/input error | Revise affected data, rerun current version |
| Revision | Saved metadata/checklist/date changes clear result | Never export a stale assessment |
| History | Current in-memory run and actual events | Reload/deletion clears it; no cloud-sync claim |

**Autonomy.** Within approved scope: validate metadata, compare exact names/dates, retrieve approved sources in a future implementation, organize evidence and prepare a draft. Must ask for clarification: unknown route, conflicting source versions, ambiguous document identity or missing facts. Must obtain explicit approval: disclosure to a provider, external sharing, official application submission, binding statements or fees. The app must not infer user permission from a completed checklist.

**Authority/evidence model.** A production legal criterion needs issuer, source URL/ID, route/jurisdiction, publication/retrieval dates, version and applicability boundary. A document needs its original source, version, supplied expiry and separate verification state. Linking a filename does not authenticate the file. Treat imported content as untrusted data, not instructions. Never expose hidden chain-of-thought; show operational events, sources and unresolved questions.

**Cancellation/receipts.** A worker should pause at safe checkpoints and stop queued actions. External requests with uncertain delivery must be reconciled, not blindly retried. Bind approval to payload hash, selected authority and expiration; a changed document invalidates prior approval. “Submitted” requires a verified service receipt. Official portals may not permit automation or third-party access; no connector feasibility is asserted without verification.

## 7. Complete browser screen ecosystem

All 34 views are rendered in `index.html`; normal navigation connects the principal journey. The screen-reference selector is an inspection aid. Result-dependent views have a start/check empty state until an actual local check has completed.

| # / view | Purpose and content architecture | Action / result | Error or uncertainty boundary |
|---|---|---|---|
| 01 Dossier home | Editorial purpose → preparation CTA → sample → current check | Start 02; sample resets fictional data | New dossier has no invented requirements |
| 02 Route context | Route boundary → user description | Save→03 | Empty context rejected; route not verified |
| 03 Route sources | Issuer, date/version, applicability | Build checklist→04 | No official criteria supplied |
| 04 Requirements | Ordered exact-name list with remove | Add→05; continue→06 | Empty list cannot produce a result |
| 05 Add requirement | Labelled requirement field | Add→04 | Empty/duplicate name rejected; draft preserved |
| 06 Document index | Record names, references, recorded expiries | Add→07; inspect→08; date→10 | Metadata only; no file access |
| 07 Add record | Exact name→expiry→reference | Validate/save→08 | Invalid calendar date/duplicate blocks save |
| 08 Record detail | Selected record folio→reference→expiry→verification | Edit→09; provenance→22 | Missing exact-name record has add action |
| 09 Edit record | Prefilled metadata, save/remove | Save→08; remove→06 | Save invalidates result; invalid draft remains |
| 10 Review date | Explicit comparison date and sample boundary | Save→12 | Real YYYY-MM-DD date required |
| 11 Unknown expiry | Method for blank/equal/earlier date | Return→06 | Blank means unknown, not perpetual validity |
| 12 Method | Exact-name, recorded-date, no-score explanation | Brief→13 | No OCR, fuzzy matching or eligibility inference |
| 13 Brief | Route, requirement/record counts and date | Plan→15; edit→02 | User-supplied scope not endorsed |
| 14 Data boundary | Local processing explanation + acknowledgement | Confirm→16 | Missing acknowledgement explains boundary |
| 15 Plan | Validate→compare→prepare milestones | Boundary→14 | No estimated official processing time |
| 16 Run | Input counts/date→explicit execution | Run→17; recover→34 | Revalidate at actual execution |
| 17 Activity | Actual validation/comparison/summary events | Summary→18 | No external-system events invented |
| 18 Summary | Missing / expired / unverified counts + reference date | Drill into 19/20/21; next→23 | No readiness percentage or approval likelihood |
| 19 Missing | Exact requirement names without records | Inspect missing item; add record | No legal assumption that checklist is complete |
| 20 Expired | Recorded dates earlier than review date | Inspect/edit record | Does not infer actual acceptance policy |
| 21 Present/unverified | Supplied records, dates and verification boundary | Inspect→08 | Presence cannot become “approved” |
| 22 Reference | Requirement name, supplied reference, verification status | Record→08; question→24 | Does not open paths, fetch URLs or authenticate |
| 23 Next steps | Deterministic gather/clarify/verify list | Packet→25; notes→24 | Not an official application plan |
| 24 Reviewer notes | Editable user questions and context | Save→25 | Not generated advice; no identity numbers needed |
| 25 Packet builder | Records→checks→notes→submission status | Preview→26 | Only current checked inputs exported |
| 26 Export | Complete selectable JSON packet | Copy text; handoff→27 | No fabricated PDF/share success |
| 27 Official handoff | Confirm authority→outgoing payload→approve/verify | Inspect packet→25 | No active connector, fee or send control |
| 28 History | Current session/run | Activity→17; search→29 | Memory only; no restored cloud records |
| 29 Search | Labelled literal query→metadata results | Inspect matching record | No matches: useful empty message |
| 30 Privacy | Data footprint→retention→delete/history/help | Delete→31; accessibility→33 | No uploaded files or provider processing |
| 31 Delete | Exact data-removal scope + keep/delete | Delete→01; keep→30 | Clears local metadata, not hypothetical server copies |
| 32 Help | Eligibility, sources, authenticity, expiry, native limits | Expand answers; method→12 | No government/visa guarantee |
| 33 Accessibility | Motion, text, labelled states and platform intent | Help→32; home→01 | Native assistive technology not yet accepted |
| 34 Recovery | Correct requirements/records/date or cancel | Relevant editor or local cancellation | No official operation to undo |

Native branded launch remains an OS splash into useful content and is not counted as another meaningful product view. Optional tutorials, consent and permissions are contextual. Native file import, source retrieval, provider failure/intervention and approved official submission need real implementations before live-screen completion can be claimed.

## 8. Components and motion

| Component | Required states |
|---|---|
| Preparation action | Default/pressed/focus; disabled/busy only when a real operation needs it; outcome follows the operation |
| Record form | Persistent labels, editable draft, field-specific error, preserved invalid data; no placeholder-only meaning |
| Document row/folio | Missing/expired/unverified text; expanded source details; absent reference/unknown expiry explicit |
| Count drill-down | Current denominator and review date; category labels; useful zero-category state |
| Requirement list | Add/remove, empty, duplicate rejection, maximum 500, exact-name explanation |
| Reviewer notes | Editable user text; saved only locally; not a legal recommendation |
| Activity list | Actual operation events; unavailable events not rendered as completed |
| Export | Read-only selectable full packet; no button that pretends to send |
| Approval panel (production) | Exact payload/authority, approve/decline, expiry, invalidation after edits and actual receipt |
| Delete | Explicit scope; keep option; local removal confirmation via empty state |

Browser view changes use 180 ms ease-out, opacity .6→1 with a 3-pixel vertical translation; new navigation replaces the animation. Reduced Motion disables it. Status counts update after computation, never through a theatrical counting animation. Native stacks/sheets should use platform transitions, with optional single light haptic only on a meaningful confirmed completion. Errors use text rather than shaking. No animation runs continuously.

## 9. iOS and Android behavior

| Detail | iOS specification | Android specification |
|---|---|---|
| Navigation | Native stack and interactive back; tab labels reflect dossier tasks | Native/system back, predictive-back compatibility and Material navigation |
| Typography | Permitted system/licensed editorial font + system controls | Native sans with comparable spacing, not Apple font copying |
| Context/actions | Native sheets, confirmation dialogs, share sheet | Material sheets/dialogs and native share intent |
| Files (future) | User-selected document picker; no full-photo/library access by default | Scoped document URI access and no broad storage permission |
| Accessibility | Dynamic Type and VoiceOver labels/expanded state | Font/display scaling, TalkBack and switch-access labels |
| Insets/keyboard | Actual safe areas and input avoidance | System-bar/IME insets; no hardcoded browser cutouts |
| Background agent (future) | OS-constrained durable jobs and resumable task state | OS-constrained work, explicit task resumption |

Browser selection changes visual intent only. It is not a native back-gesture, sheet, accessibility or signing test. The native source increment implements only the overview/index with expandable evidence details and validated counts. It uses the existing application navigation and data inputs; the full 34-view flow is not yet in Expo.

## 10. Accessibility, localization and privacy

Target WCAG 2.2 AA where applicable. Text uses semantic product colors with separately tested contrast. Visible focus remains; labels/status words are readable without color; controls are 48+ pixels high in the browser. Body/heading text scales with relative units and wraps. The 200% check inspects the app frame's actual scroll width, so `overflow:hidden` cannot disguise clipped content. Brand/logo dimensions remain bounded like an icon.

Native overview uses explicit button roles, labels naming the requirement/status, an expanded state, selectable evidence references and a spoken alert for invalid metadata. Native VoiceOver/TalkBack, Dynamic Type, switch/keyboard navigation and actual touch ergonomics are still unverified. The existing native shell is not redesigned or claimed to support the full browser dark theme.

Arabic/RTL handoff: externalize copy, obtain approved Arabic name/terminology, review native Arabic type/line heights, isolate filenames/URLs/dates bidirectionally and preserve original record keys independently of localized labels. Exact matching must use canonical internal identifiers once a real route corpus exists; translating a requirement label must not change its record identity. Do not infer proper RTL from mirroring alone. English prototype exists; translation and RTL are pending.

The browser stores only metadata/notes in memory, with no external requests, analytics or provider calls. It never opens files or asks for identity numbers. The real native app still uses its existing development example/connection model. Consumer accountless server sessions, encrypted document storage, retention/deletion contracts, per-task provider consent and optional official-service authorization need a reviewed production design before sensitive documents are uploaded.

## 11. Engineering handoff and technical limits

**Retain architecture.** Existing Expo/React Native with Router remains appropriate. SDK 58 reference, the Expo documentation index and color-theme guidance were consulted before native edits. This increment adds no native module, Expo dependency, authentication flow or route. iOS/Android bundle export is validation of bundling only, not signing or physical execution.

**One shared assessment.** `mobile/src/dossier.ts` validates review/expiry calendar dates, unique non-empty requirement/document names and array/length bounds. `assessDossier` returns `checks`, category `counts`, the supplied date and a clear limitation. Names match exactly, expiry before the reference date is expired, equality remains present/unverified, and blank expiry becomes null/unknown. It never mutates input or calculates eligibility.

`design/iqamah/build-engine.cjs` compiles the same TypeScript helper into the browser's dependency-free `engine.js`; `--check` detects stale generated output. Regenerate after source changes. This prevents the old “some document exists” browser/native logic from diverging. The existing Python tool remains independent; parity checks compare statuses/reference semantics for supported unambiguous inputs. The new UI rejects ambiguous duplicate/empty-name inputs that the legacy backend may still accept; this stricter UI validation is not a claim that the backend's whole schema has changed.

**Data lineage (production proposal).** Dossier ID/session owner, route/source versions, review date and revision; requirement canonical ID + displayed name; document ID/version/reference/expiry/authenticity state; check method/version and exact inputs; reviewer notes; task events; action approval bound to authority/payload hash; confirmed official receipt or explicit unknown delivery state. An unsigned record is never promoted to authenticated evidence.

**Operational limits.** Provider/source retrieval must use licensed, current evidence and scoped authority. Long tasks require durable workers and bounded retries. Official sites may lack supported APIs. No on-device model, OCR, issuer verification, live criteria retrieval or official submission is added here. Rate limits, infrastructure funding, platform enrollment and signing remain real dependencies. ChatGPT account access is not the same as a provider API key, and an API key alone would not supply an official immigration connector.

**Performance.** Avoid full-size document previews in list rows; use metadata first and load approved content on demand. Virtualize large lists in the complete native flow. The current index is intended for small dossiers, bounded at 500; worst-case low-end-device performance is unmeasured. No 60 fps or battery guarantee is made.

## 12. Quality review and release boundary

Use the requested quality weights: visual craft 20, UX 20, AI-native interaction 15, composition/type 10, differentiation 10, native quality 10, accessibility 10, engineering feasibility 5. No final numerical quality score or external validation is asserted. The concept matrix is not release acceptance.

Material corrections: removed the ten-year promise and readiness gauge; separated expired from merely supplied records; made the reference date visible; labelled blank expiry unknown; prevented duplicate overwrite and invalid calendar dates; removed the ungrounded “Mark reviewed” toggle; preserved invalid form edits; invalidated old results after saved changes; and shared the native/browser classifier.

Known gaps: only the native overview is implemented; official criteria, file authenticity, retrieval/provider orchestration, Arabic/RTL, signed builds and physical-device accessibility remain pending. Before claiming a genuinely agentic live product, demonstrate source-backed intake through gap resolution and a specifically authorized handoff, including a failed/recoverable path and an actual receipt. If official integration is unavailable, ship and name the behavior as dossier preparation rather than claiming submission autonomy.

Next portfolio unit is APP 03, Istithmar AI, preserving original order. Continue to track unresolved native/live-service gates instead of cloning Iqamah's document architecture into its business-setup comparison workflow.
