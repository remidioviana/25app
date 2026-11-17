# Lot 3: implementation and acceptance record

Status: implementation checkpoints and controlled tests recorded; this is not a declaration of completed applications.

The shared workflow covers structured input, app-scoped official-source retrieval, domain computation, bounded autonomous final resolution, and Markdown export. Android/iOS bundles remain compilation artifacts, not signed APKs/IPAs or device acceptance.

## App-specific acceptance checks

| App | Required behavior |
|---|---|
| Jomrok AI | Expose missing shipment fields, use only the supplied duty rate, and never invent HS classifications or clearance. |
| Khibrat AI | Map references to the approved rubric without ranking applicants or inferring skills from absent evidence. |
| Majlis AI | Respect task dependencies and the supplied review date; do not claim an account or training task was completed. |
| Rafiq | Fit supplied meetings and buffers inside the selected time range without modifying a calendar or inventing travel telemetry. |
| Sawm AI | Respect user-selected work/rest periods and buffers without inventing prayer times or religious determinations. |

## Evidence and remaining gates

- [Official HTTP reads and controlled graphs](evidence/lot-3-official-source-controls.json): original receipt timestamps and source scopes are preserved. Model callbacks are controlled test fixtures, not live inference.
- The native API client exercises missing-input rejection, authenticated execution, import/save, retrieval and report export for all 25 apps against the real Python backend using controlled data.
- Final responses distinguish completed, information-needed and inconclusive outcomes; optional user feedback does not gate analysis.
- Authentic primary cases, full device interaction and release remain unaccepted. The operator will handle Expo authentication and Render deployment later.

Live inference was run after the preceding lot completed without a quota stop. The completed workflow results are recorded below; no model execution is inferred from the shared implementation.

## Latest completed live diagnostic

[Protected workflow](https://github.com/remidioviana/25app/actions/runs/44022717271). Minimum spacing: 20 seconds between model calls and 30 seconds between apps. No quota stop occurred in this run.

| App | Execution | RAG diagnostic | Final outcome |
|---|---|---|---|
| Jomrok AI | completed | passed | reviewed_by_model |
| Khibrat AI | completed | passed | inconclusive |
| Majlis AI | completed | passed | inconclusive |
| Rafiq | completed | passed | reviewed_by_model |
| Sawm AI | completed | passed | needs_information |

Passed rows complete the synthetic graph/RAG milestone only. Authentic primary cases and device/release gates remain separate. Incomplete answers are not promoted to completed customer outcomes.
