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

Web responses are bound to the workspace instance that started them. Run starts and history selections are ordered; stale polling, document results and loader completions cannot replace the current workspace after navigation, including leaving and reopening the same app. Deferred-response regressions exercise successful and failed requests. This isolates presentation state; already-started server operations retain their own lifecycle.

If a replacement run fails to start, polling resumes for the previously displayed active run. The failure does not silently strand that run in its last recorded status.

Document panels and searches have independent generations. Only the latest search for the current query and mode can render; editing the query invalidates pending results, including editing back to the same text. Intake proposals are ordered and tied to the current goal and input panel; changing the goal clears stale proposal controls and releases the action for a fresh request.

Connector reads and file previews apply only while their draft snapshot remains current. Edits made during retrieval/extraction are kept, newer selections supersede older ones, and file reading stops before uploading for extraction when edits have already invalidated the import. Clearing case inputs also invalidates a pending run-start response so it cannot repopulate the cleared result panel.

Document mutations refresh only the collection list. A confirmed save clears the submitted form only if no fields have changed; newer edits and drafts present during deletion stay intact. List refreshes are ordered, duplicate save clicks are suppressed, and refresh failures preserve the distinction between a successful mutation receipt and an unavailable refreshed list.

Web schedule creation validates local calendar times, supported repeat settings, one-time counts and the backend's UTC year bounds before submission. Collection updates preserve edited controls, stale panel/list responses are ignored, and the last confirmed identical payload is suppressed while the panel remains open. Refresh errors retain the creation/disable receipt. Timezone regressions cover Dubai conversion and daylight-saving clock gaps.

Disabled schedules are labeled Inactive with their remaining run count; disabling future runs does not establish that those runs completed.

Ambiguous local times during a backward clock change are rejected as well as nonexistent spring-forward times, so the Web form never silently chooses one of two matching wall-clock instants. The Dubai conversion and an ordinary time after a backward transition remain accepted.

### Web notification timing

Successive portal notifications now cancel the preceding dismissal timer and ignore stale callbacks. Each new message stays visible for its own six-second interval, including refresh errors following confirmed writes. A regression test exercises the actual portal notification function with controlled timers; no provider inference or external action is involved.

### Result action isolation

Cancel, resume and artifact-review responses are scoped to the originating workspace and run request. Late responses and errors cannot replace a newly opened run or app, including leaving and reopening the same app. Pending duplicate clicks are suppressed, and failed current actions restore polling. Controlled asynchronous regression tests cover these paths without provider calls.

### Run status presentation

The portal result panel and mission history share status badges: only completed runs use the success color, failed runs use an error treatment, and queued, running and cancelled runs remain neutral. Unknown statuses display an explicit Unknown label. A rendered-result/history regression covers all five supported statuses and unexpected values. This change does not alter backend run outcomes or acceptance evidence.

### Export request isolation

JSON, report, CSV and calendar downloads now remain scoped to the originating workspace and run. Navigation suppresses delayed downloads and unrelated error notices, including responses whose body is still loading. Repeated clicks on a pending export are ignored. Only calendar exports send a date parameter, and temporary object URLs are scheduled for cleanup even if initiating the download throws. Regression tests use simulated responses without provider calls.

### Status polling recovery

Transient network, timeout and server failures during run-status reads receive at most three retries, with progressive delays of 1.8, 3.6 and 7.2 seconds. A successful read resets the retry budget. These are GET requests for the existing run; no mission or inference is restarted. Authentication, missing-run and quota errors stop immediately. Exhausted retries explain how to reopen the run from history, and navigation invalidates pending retries. API errors preserve HTTP status even for non-JSON error bodies. Controlled regression tests cover recovery, backoff limits, reset, non-retryable responses and workspace changes.

### JSON draft shape validation

The Web editor requires mission inputs to be a JSON object before returning to the form, changing tabs, loading an example or starting a run. Invalid roots retain the raw editor content and previous object draft for correction. Schema lookup tolerates additional nested fields; arrays without an item schema retain their contents and removal controls without offering an unsupported Add action. Regression tests cover scalar, null, array and malformed roots plus valid nested objects.

### Execution mode preservation

The Web mission editor preserves its selected execution mode when rebuilding form fields, adding or removing rows, switching JSON/form views, loading/restoring examples and returning from another workspace tab. Opening another app resets the selection to local tools. Regression tests verify the rendered selected options and submitted mode, preventing silent downgrades from AI/team mode during editing.

### Clearing example restoration state

Clear inputs now discards the pre-example snapshot along with the visible draft. The restore control disappears, and even a detached stale restore handler cannot recover the cleared data. Loading another example starts a new restoration baseline. Regression tests verify both clearing and subsequent example cycles without provider calls.

### JSON numeric overflow

Mission JSON parsing rejects numbers that overflow the finite JavaScript range, including nested object and array values. They can no longer become Infinity during editing and silently serialize as null when submitted. Existing invalid-draft tests also exercise overflow through form switching, tab navigation, example loading and mission submission. A separate regression verifies finite values, explicit zero and unknown null remain distinct through submission and JSON serialization.

### History and tab loading isolation

Each history load belongs to a specific visit, so older responses cannot overwrite a newer list after leaving and reopening the tab. Current history failures replace the loading indicator with a recovery message. Initial document and schedule loading errors are also scoped to the originating tab visit. Controlled asynchronous tests cover response reordering, stale errors and current failure recovery without provider calls.

### Search method and retrieval warnings

The portal document search displays the backend-reported retrieval method and warnings alongside excerpts. A requested semantic search that falls back to keywords because vectors are absent or outdated is no longer presented without that context. Warning text is escaped, and changing the query clears both the old excerpts and their method/warnings. Regression tests cover lexical fallback, hybrid retrieval, missing method metadata and safe warning rendering without provider calls.

### Result retrieval warnings

Run results now show recorded retrieval warnings before the domain analysis, rather than leaving them only inside the complete JSON. The panel renders warning strings as escaped text, tolerates missing or malformed legacy metadata, and removes earlier warnings when a different result is opened. Regression tests exercise the actual result renderer without provider calls or fabricated acceptance evidence.

### Final answer outcome visibility

The portal distinguishes completed execution from the final answer outcome. Missing-information and inconclusive decisions show their recorded final questions and limitations prominently. An answered label requires a matching final outcome and empty question/limitation lists; missing, contradictory or inconsistent metadata cannot fabricate final approval. Earlier audit revision feedback remains historical rather than replacing the final resolution. Regression tests exercise the actual result renderer and escaped list content without provider calls.

### Saved schedule state and provenance

Mobile disabled schedules now read Inactive rather than Finished, preserving the distinction between disabling future runs and completing them. Saved schedule cards in mobile and the portal display their persisted execution mode and demonstration/supplied-input provenance. Missing legacy provenance is explicitly unreported rather than assumed real. Creation views also identify the current draft provenance. Tests cover stored boolean/numeric flags, the three execution modes and inactive schedules with remaining runs.

### Mobile agenda request lifecycle

Agenda list loads and mutations now belong to a mounted API/agent session. Disposal or effect replay invalidates earlier responses, errors and busy-state updates. A synchronous operation lock prevents duplicate pending writes, and post-mutation reads supersede earlier list loads. Confirmed creation/disable receipts remain explicit when the subsequent list refresh fails. Controlled request tests cover lifecycle changes, replay, duplicate clicks, refresh failure and retry without creating real schedules or invoking models.

### Focused mobile history sessions

Private case history reloads each time the activity route gains focus. Focus cleanup invalidates pending list and case-opening responses, so leaving the route or replacing its connection cannot trigger a stale mission redirect. Only the latest case selection may open; duplicate clicks on the same pending case are ignored, and current failures allow retry. Controlled asynchronous tests cover focus changes, response ordering, stale errors and disconnected state. Expo Router focus behavior was checked against the cached SDK 58 reference and installed matching API declarations.

### Connection form action lifecycle

Connect and disconnect share a synchronous pending-operation lock and a focused-screen generation. Late completions cannot navigate back or update errors after leaving/reopening the route. Saved-connection removal failures stay visible and allow retry, including after the active session has already been cleared. Pending actions disable editable credentials and the remember control. The connection form uses the existing Web-safe switch, with native disabled behavior preserved. Controlled lifecycle tests use no credentials or real storage.

### Unicode import filename limits

The mobile document picker now counts filename Unicode code points, matching the Python server's 200-character limit. Valid names containing supplementary Arabic characters or symbols are no longer rejected because they occupy two UTF-16 units. Boundary tests cover 200 accepted and 201 rejected characters across Web, iOS and Android reader branches, preserving rejection before file reads for oversized names. Tests use simulated file contents, not device acceptance.

### Document save confirmation and operation locking

The mobile evidence editor separates a failed document write from a confirmed save followed by a failed list refresh. Failed writes retain the draft; confirmed saves clear it once and explicitly report that the document was saved if refreshing the list fails. Picking/importing and saving share a synchronous pending-operation lock. Existing editor-scope checks prevent late responses from clearing another editor or reporting after unmount. Controlled tests cover both write phases, stale responses, operation overlap and lock release without real storage or provider calls.

### Document retry error state

A confirmed document save clears the previous save error before refreshing the evidence list. Failed retries retain their current error and draft, and a subsequent list-refresh failure still replaces the cleared error with the explicit saved-document receipt. Regression coverage verifies consecutive failures followed by a confirmed retry.

### Agenda retry error state

Confirmed schedule creation and disable operations clear the preceding operation error before refreshing the list. Failed writes retain their error, and failed post-confirmation refreshes still display the saved-operation receipt. Regression tests cover a failure followed by a confirmed retry for both actions.

### Mission submission identity

Mission starts now use a synchronous submission gate and retry identity outside React state updates. Rapid repeated actions cannot create overlapping POST requests with different keys. An unchanged request on the same API client retains its key after an uncertain failure; changed content or connection gets a new key. A confirmed response clears the retry identity for a deliberate subsequent mission. Controlled tests verify request counts, keys and gate release without model inference.

### Mobile intake goal revisions

Case preparation now tracks the goal revision and API session. Editing a goal invalidates both pending and displayed proposals, including changing it and returning to the original text. Only the current ready proposal may apply, once. A synchronous gate blocks duplicate preparation requests, and mission starts also respect that pending gate. Current failures allow retry; disposed sessions cannot update errors or busy state. Controlled tests use no provider inference.

### Example restoration provenance

Mobile pre-example snapshots now include hasInputs alongside values and the demonstration flag. Restoration updates those fields together rather than passing through the ordinary edit setter, which always marks a draft as supplied. Restoring an untouched workspace therefore preserves unknown values and hasInputs=false, matching the Web behavior. Snapshot copying also isolates later edits from the saved original. Regression tests cover blank, supplied and demonstration states plus nested data isolation.

### Invalid numeric draft preservation

Workspace snapshots now copy nested values without JSON serialization. Invalid numeric editor values such as NaN remain invalid when an example is restored, instead of silently becoming nullable missing fields. Mission validation continues to reject those values; this does not permit sending non-finite numbers. Regression tests verify nested validation before/after restoration, explicit null/zero, signed zero and safe copying of prototype-named keys.

### Unicode goal, query and category limits

Mission goals, evidence-search queries and category names now count Unicode code points rather than UTF-16 units. Goal and search editors use controlled code-point limits so supplementary characters are not split or rejected at half the intended capacity. Mission submission uses the shared goal validator. Boundary tests cover Latin, Arabic, supplementary Arabic and symbol input at 2,000/2,001 characters, category names at 80/81, and transport suppression for oversized searches.

### Bounded mobile result status recovery

Run status reads now retry transient network/time-out/server failures at most three times, with 2/4/8-second delays. Authentication, missing-run and quota errors stop immediately; terminal results stop polling. A dedicated polling notice clears on recovery without clearing action/export errors. Users can explicitly refresh status after a failure. Disposal aborts and ignores delayed responses. These operations only read an existing run; they never restart a mission or inference. Controlled timer tests cover recovery, retry bounds, non-retryable errors and cancellation.

### Mobile final-review consistency

The completed-final-answer label now requires matching answered metadata with explicit empty question and limitation lists. Contradictory or incomplete final metadata is marked unverified while its recorded questions and limitations stay visible. Final-only or decision-only review records are no longer hidden by the panel's visibility condition. Legacy recorded audit acceptance remains distinct from final-answer completion, and local results do not invent a review panel. Regression tests cover these combinations without provider calls.

### Focus-scoped result operations and report cleanup

Result mutations and exports share a synchronous pending-operation lock. Focus cleanup invalidates late results, error notices and share-sheet initiation. Status polling is stopped synchronously before an operation and remains suspended while it is busy. Temporary reports are removed on failure or supersession; cleanup errors cannot strand the busy state or mask an earlier export failure. Controlled tests cover duplicate operations, reopened sessions, delayed sharing, Web/native adapters and cleanup failure. No real file sharing or external submission is used in these tests.

### Reopened result synchronization

Run views adopt externally refreshed results even when the run ID and status are unchanged. Such refreshes advance the result-session revision, invalidating earlier polling and pending operations. An unchanged initial prop cannot roll back locally fetched data, and an echoed local update does not restart the session. Regression tests cover source identity, same-case review updates and API replacement.

### Result operation retry messages

A successful result action or export clears its preceding operation error only after the asynchronous work completes in the current session. New action, sharing or cleanup failures remain visible. Operation notices belong to the result panel, so clearing them does not clear separate mission, planning or inspector form errors. Regression coverage checks failure, confirmed retry and a subsequent distinct failure, alongside the existing stale-session and cleanup-failure tests.

### Shared result updates and focus ownership

Mission and Nafas result panels now publish polled and action-confirmed runs through AppState's API-scoped setter. Other screens receive the current recorded result instead of retaining the initial queued snapshot. Status polling follows route focus as well as app foreground state, preventing hidden panels from publishing older reads. Existing polling disposal and echoed-source regression coverage applies to this wiring. Result operation and connection notices use alert accessibility semantics. No mission or inference is started by this change.

### Temporary export file ownership

Run reports and Himayah, Iqamah, Istithmar and Munagasah preparation exports use UUID-scoped cache filenames instead of fixed names or timestamps. Files are created without overwrite, and cleanup is restricted to a file whose creation succeeded in that operation. A failed creation cannot delete another export's file. Cleanup errors remain contained and visible without stranding the controls or replacing an earlier primary error. Existing Web download names are unchanged. Controlled storage tests cover collisions, independent cleanup and cleanup retry; no real sharing occurs.

### Web export URL cleanup

Himayah, Iqamah, Istithmar and Munagasah Web exports share one text-download helper. Object URL revocation is scheduled in a finally block, including link-creation and click failures. Filenames, content, MIME types and delayed release remain unchanged. Controlled browser-adapter tests cover normal downloads and failures before/after URL allocation without initiating real downloads. Native report handling is unchanged.

### Himayah inspector operation ownership

PDF import, model analysis and annotation export now share a synchronous operation lease. Export can no longer bypass the import/analysis gate, and completion from an earlier API revision cannot unlock a newer operation. Stale exports do not open a share sheet or report errors after a session replacement. Import resource cleanup runs inside a protected finally path so URL/file cleanup failure cannot strand the controls. Pure gate tests cover overlap, session replacement, duplicate completion and token identity without inference or real files.

### Preparation export focus ownership

Iqamah, Istithmar and Munagasah preparation exports now use the focused operation controller shared with result reports. Duplicate presses cannot generate overlapping files or share sheets. Leaving the screen or replacing its base inputs invalidates pending completion; a delayed availability check cannot open a stale share sheet. Owned temporary files are still cleaned up, and a new focused session can export independently. Web downloads retain their names, JSON content and URL cleanup. Controlled tests exercise duplicate report generation and session replacement during native availability checks without real files or sharing.

### Source catalogue and read ordering

Starting a live source read now cancels any older catalogue/history request. A late catalogue snapshot cannot overwrite the newly confirmed retrieval receipt. The same request scope prevents overlapping source reads, blocks reloads during a read, and ignores cancelled or superseded completions. Replacing a catalogue request or disposing the panel invalidates its response even if the transport resolves after cancellation. Controlled tests cover delayed snapshot delivery, duplicate reads, cancellation followed by a new read and panel disposal; no official source or inference is contacted by these tests.
