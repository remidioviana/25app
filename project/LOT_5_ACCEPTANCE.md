# Lot 5: implementation and acceptance record

Status: implementation checkpoints and controlled tests recorded; this is not a declaration of completed applications.

The shared workflow covers structured input, app-scoped official-source retrieval, domain computation, bounded autonomous final resolution, and Markdown export. Android/iOS bundles remain compilation artifacts, not signed APKs/IPAs or device acceptance.

## App-specific acceptance checks

| App | Required behavior |
|---|---|
| Nafas AI | Prepare only the selected self-care routine without diagnosis, treatment or automatic sharing. |
| Tadweer AI | Separate hazardous acceptance from ordinary material matches and require confirmation of the actual collection route. |
| Turath AI | Build a reading path from recorded source cards, preserve citations and expose missing topics without invented history. |
| Himam AI | Separate reported accessible, blocked and unknown route conditions without claiming live infrastructure verification. |
| Hisad AI | Screen supplied lot, allergens, expiry and capacity without certifying food safety or confirming a handoff. |

## Evidence and remaining gates

- [Official HTTP reads and controlled graphs](evidence/lot-5-official-source-controls.json): original receipt timestamps and source scopes are preserved. Model callbacks are controlled test fixtures, not live inference.
- The native API client exercises missing-input rejection, authenticated execution, import/save, retrieval and report export for all 25 apps against the real Python backend using controlled data.
- Final responses distinguish completed, information-needed and inconclusive outcomes; optional user feedback does not gate analysis.
- Authentic primary cases, full device interaction and release remain unaccepted. The operator will handle Expo authentication and Render deployment later.

Live inference ran after the preceding lot completed without a quota stop. Results are recorded below.

## Latest completed live diagnostic

[Protected workflow](https://github.com/remidioviana/25app/actions/runs/44030572739): 20-second role and 30-second app pacing; no quota stop.

| App | RAG diagnostic | Outcome |
|---|---|---|
| nafas | passed | inconclusive |
| tadweer | failed: no source citation | reviewed_by_model |
| turath | passed | reviewed_by_model |
| himam | passed | reviewed_by_model |
| hisad | passed | reviewed_by_model |

Four successful synthetic RAG milestones are preserved. This does not establish authentic primary-case, device or release acceptance. Tadweer remains unaccepted by the RAG diagnostic despite its completed model review.

## Targeted recovery completed

[Run 44032613763](https://github.com/remidioviana/25app/actions/runs/44032613763) retried only Tadweer after the source-context instruction change. It passed the unchanged synthetic RAG checks with two valid source citations, three distinct returned model IDs and no quota stop. Its bounded final answer remained inconclusive. The four previously passed apps were not repeated.

All five Lot 5 apps now have successful synthetic graph/RAG milestones. Authentic primary-case, device and release acceptance remain separate. The earlier missing-citation result remains archived.
