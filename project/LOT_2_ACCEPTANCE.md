# Lot 2: implementation and acceptance record

Status: implementation checkpoints and controlled tests recorded; this is not a declaration of completed applications.

The shared workflow covers structured input, app-scoped official-source retrieval, domain computation, bounded autonomous final resolution, and Markdown export. Android/iOS bundles remain compilation artifacts, not signed APKs/IPAs or device acceptance.

## App-specific acceptance checks

| App | Required behavior |
|---|---|
| Tawteen AI | Reconcile active workforce records against the explicitly supplied target; keep arithmetic separate from regulatory applicability. |
| Adl AI | Order dated evidence and reconcile claimed amounts without asserting legal entitlement or filing a case. |
| Tawassul B2B | Use only matching approved product facts, expose uncovered needs, and keep the proposal unsent. |
| Adab AI | Distinguish exact approved claims, prohibited terms and channel limits; do not publish the campaign. |
| Khidmah AI | Separate policy eligibility, purchase age and delegated authority; do not report a refund as issued. |

## Evidence and remaining gates

- [Official HTTP reads and controlled graphs](evidence/lot-2-official-source-controls.json): original receipt timestamps and source scopes are preserved. Model callbacks are controlled test fixtures, not live inference.
- The native API client exercises missing-input rejection, authenticated execution, import/save, retrieval and report export for all 25 apps against the real Python backend using controlled data.
- Final responses distinguish completed, information-needed and inconclusive outcomes; optional user feedback does not gate analysis.
- Authentic primary cases, full device interaction and release remain unaccepted. The operator will handle Expo authentication and Render deployment later.

The [first live attempt](evidence/lot-2-groq-live-attempt.json) failed on contradictory final metadata in Tawteen and quota in Adl. Other apps were skipped after quota. The final-metadata behavior was corrected conservatively and tested offline. A paced rerun was explicitly authorized after the operator reported renewed TPM capacity.

## Latest completed live diagnostic

[Protected workflow](https://github.com/remidioviana/25app/actions/runs/44021219513). Minimum spacing: 20 seconds between model calls and 30 seconds between apps. No quota stop occurred in this run.

| App | Execution | RAG diagnostic | Final outcome |
|---|---|---|---|
| Tawteen AI | failed | not passed | Provider attempts failed: 400. Safe provider codes: json_validate_failed, invalid_request_error. Check server configuration and provider access. |
| Adl AI | completed | passed | needs_information |
| Tawassul B2B | completed | passed | reviewed_by_model |
| Adab AI | completed | not passed | reviewed_by_model |
| Khidmah AI | completed | passed | reviewed_by_model |

Passed rows complete the synthetic graph/RAG milestone only. Authentic primary cases and device/release gates remain separate. Incomplete answers are not promoted to completed customer outcomes.
