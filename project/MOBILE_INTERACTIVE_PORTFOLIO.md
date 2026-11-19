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

Budget comparisons reuse the reconciler's decimal totals and remaining amounts, avoiding binary floating-point false overruns. Categories with entered transactions but no supplied budget remain visible as unknown instead of disappearing from the comparison. Duplicate transaction IDs retain the reconciler's first-record policy.

Food-recipient previews also screen arrival against the entered expiry, matching the backend boundary: arrival at expiry is flagged. Strict timestamp validation requires an explicit timezone and a valid calendar date; missing or malformed timing remains unknown. These checks use the entered reference time, not live freshness or a food-safety certification.

Return-policy date gates reuse the strict calendar-date validator. Impossible dates and timestamps in date-only fields are displayed as unavailable instead of being normalized by JavaScript into a different day. Valid leap-day arithmetic and inclusive return-window boundaries remain supported.

Editorial counters, allowance meters and source-excerpt lengths count Unicode code points, matching Python string lengths and the existing form validator. Emoji no longer count as two UTF-16 units; combining marks continue to count individually under that backend contract.

Campaign term scanning uses the backend's full, locale-independent Unicode casefold semantics. The same hit list drives the text scan and the selected record's attention state. The generated table is pinned to Python's Unicode database; a Python regression checks its complete mapping against the runtime. Regenerate it with `python scripts/generate_mobile_casefold.py` when upgrading the backend Unicode contract. Casefold does not strip accents or normalize distinct combining sequences.

Service-document checkpoints reuse dossier validation and assessment. Recorded expiry before the entered reference date is flagged; expiry on that date remains recorded, while missing expiry stays unknown. Duplicate names and invalid calendar dates prevent a positive checkpoint assessment instead of selecting an arbitrary record. Document presence still does not establish authenticity or service eligibility.

Dossier requirement names, document names and references use the same Unicode code-point limit as schema validation and the backend. A supplementary-plane character does not consume two character slots in Iqamah or Sahil; inputs above the actual limit still fail validation.

Paged record compositions preserve global ordinals within the filtered list. Source 25 is displayed as chapter 25 rather than restarting chapter numbers on the second page. Regression tests keep ordinals, record details and evidence references aligned across source pages, filtering, deletion and empty collections.

The Web workspace example flow preserves the first pre-example draft, provenance and editor mode, including pending valid JSON edits. Invalid JSON remains in place until corrected; changing agents clears the restore snapshot. Logo registry repairs must match both the actual versioned file bytes and the previously approved hashes; a metadata change alone does not approve new artwork.
