# Interactive mobile portfolio

## Scope

The 23 apps below now expose domain-specific interactive record views alongside their existing tools. Iqamah's dossier and Istithmar's setup comparison remain intact. Shared controls use each identity's typography, surfaces, accent and corner treatment; domain compositions use different visual encodings and detail vocabulary.

| App | Interactive view | Composition / data |
|---|---|---|
| himayah | Clause lens | Phrase-match inspection |
| sahil | Service checkpoints | Step rail and document references |
| munagasah | Tender coverage | Requirement coverage cells |
| tawteen | People behind the target | Active employee badges |
| adl | Evidence chronology | Ordered event rail |
| tawassul | Account fit canvas | Product-to-need comparison |
| adab | Claim editing desk | Original and approved wording lengths |
| khidmah | Return policy gates | Amount, dates and reason gates |
| jomrok | Cargo manifest desk | Field presence register |
| khibrat | Competency evidence map | Reference dots, not ability scores |
| majlis | Onboarding commitments | Completion declarations and dependencies |
| rafiq | Your time ribbon | Horizontal entered-time blocks |
| sawm | Pace your commitments | Task-duration columns |
| mizan | Category balance | Deduplicated category spending |
| thawg | A table for your group | Price discs and supplied constraints |
| manzil | Receipt tape | Unique receipt slips |
| gurbah | Relocation path | Prerequisite paths |
| amanah-eco | Consumption comparison | Daily-rate comparison bars |
| nafas | Make room for a pause | Preferred activity carousel linked to local selections |
| tadweer | Material destination map | Destination markers and entered distances |
| turath | Source reading trail | Chapter folios with source excerpts |
| himam | Access along the route | Route rails with explicit unknown accessibility |
| hisad | Recipient capacity board | Capacity comparisons and handling constraints |

## Interaction and data

Selecting a visual item synchronizes its detail panel with the current draft. Filters distinguish recorded, flagged and unknown states. Long collections are paginated in groups of 24. Reduced-motion preferences suppress detail fades. Controls retain touch targets, keyboard access and textual readings alongside the visualizations.

“See How It Works” explicitly loads a cloned example into the form and marks it as example input. It replaces the current draft only on an explicit press; no example is silently loaded. “Restore previous inputs” restores the saved draft and its example flag. Nafas retains its own activity choices, local routine and breathing timer; it does not introduce demo reflections.

Boolean form fields use a native checkbox styled as a switch on Web, with valid `checked` state and browser keyboard/focus behavior. Android/iOS continue using React Native Switch. The checked state is not passed as a custom non-boolean DOM attribute.

The variant guard verifies file hashes against the registry and approval references, then checks that every light/dark SVG embeds the exact current dimensional PNG. It never rewrites hashes or approves artwork automatically. The pending approved Adl/Nafas artwork import is separate from these UI changes.

## Verification

- TypeScript, ESLint and the complete mobile test suite.
- Domain derivation regressions for 23 distinct scenes, edits, duplicate receipts, unknown accessibility, invalid return dates and empty collections.
- All 25 variant and identity checks, including embedded PNG equality.
- [Controlled browser results](evidence/interactive-portfolio-browser.json): 25 variants at a 390px viewport, demo action where present, selection/detail synchronization, filters, form switch click/Space interaction, and console monitoring for non-boolean warnings.
- Android/iOS JavaScript and asset exports are compilation checks; physical-device and signed distribution acceptance remain separate.

Reproduce the browser audit with Expo started using `EXPO_PUBLIC_VISUAL_AUDIT=1`; run `python scripts/audit_interactive_mobile.py --origin http://localhost:8106 --chromium /path/to/chrome`. This development-only variant selector is not a production navigation feature.

All visual values are derived from entered records or explicitly chosen examples. This update does not add live provider inference, government submissions, financial certification, venue availability or external actions.

## Follow-up: unavailable durations and incomplete access evidence

Day-block previews reject malformed clocks and reversed intervals instead of displaying zero minutes as an observed duration. A valid same-time block still displays zero. Accessibility previews require both declared needs and nonempty segment evidence before reporting all needs available; an explicit barrier is flagged separately from missing evidence. Regression tests cover these cases.
