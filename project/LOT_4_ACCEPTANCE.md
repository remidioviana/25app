# Lot 4: implementation and acceptance record

Status: implementation checkpoints and controlled tests recorded; this is not a declaration of completed applications.

The shared workflow covers structured input, app-scoped official-source retrieval, domain computation, bounded autonomous final resolution, and Markdown export. Android/iOS bundles remain compilation artifacts, not signed APKs/IPAs or device acceptance.

## App-specific acceptance checks

| App | Required behavior |
|---|---|
| Mizan AI | Reconcile verified transactions, categories and budgets without inventing bank access or religious certification. |
| Thawg AI | Filter supplied options by budget, party size and tags while keeping availability and dietary verification explicit. |
| Manzil AI | Exclude duplicate identifiers and expose unverified receipts while reconciling the household totals. |
| Gurbah AI | Preserve dependency order, overdue dates and missing relocation evidence without claiming official submissions. |
| Amanah Eco | Normalize usage by period length and keep weather, occupancy, tariffs and emissions assumptions explicit. |

## Evidence and remaining gates

- [Official HTTP reads and controlled graphs](evidence/lot-4-official-source-controls.json): original receipt timestamps and source scopes are preserved. Model callbacks are controlled test fixtures, not live inference.
- The native API client exercises missing-input rejection, authenticated execution, import/save, retrieval and report export for all 25 apps against the real Python backend using controlled data.
- Final responses distinguish completed, information-needed and inconclusive outcomes; optional user feedback does not gate analysis.
- Authentic primary cases, full device interaction and release remain unaccepted. The operator will handle Expo authentication and Render deployment later.

Live inference for this lot will start only after the preceding lot completes without a quota stop. No model execution is inferred from the shared implementation.
