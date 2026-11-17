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

Live inference was run after the preceding lot completed without a quota stop. The completed workflow results are recorded below; no model execution is inferred from the shared implementation.

## Latest completed live diagnostic

[Run 44029691355](https://github.com/remidioviana/25app/actions/runs/44029691355) used 20-second role pacing and 30-second app pacing. No quota stop occurred.

| App | Result |
|---|---|
| Mizan | Blocked: official source HTTP 403 |
| Thawg | Synthetic RAG diagnostic passed |
| Manzil | Blocked: official source HTTP 403 |
| Gurbah | Synthetic RAG diagnostic passed |
| Amanah Eco | Failed: final response cited a passage not retrieved for this app |

These results do not establish authentic primary-case, device or release acceptance. Citation validation rejected the unsupported reference.

## Source recovery preparation

The separately catalogued [CBUAE consumer overview](https://centralbank.ae/en/consumer) returned HTTP 200 and passed controlled graph tests for Mizan and Manzil: [receipts and controls](evidence/lot-4-cbuae-overview-controls.json). Its scope is general consumer education and complaints context, not the full Consumer Protection Standards. The original standards URL and its failed live receipts remain preserved. Protected runner inference must still pass before either app receives a successful live diagnostic milestone.

## Targeted recovery result

[Run 44032273178](https://github.com/remidioviana/25app/actions/runs/44032273178) retried only Mizan, Manzil and Amanah Eco. Amanah Eco passed the synthetic RAG checks with one valid source citation and three distinct returned model IDs. Mizan and Manzil remained blocked by HTTP 403 on the separately catalogued CBUAE overview in the GitHub runner; local HTTP success did not establish runner availability. No model calls were made for those two blocked source reads, and no quota stop occurred. Thawg and Gurbah were not repeated.

The portfolio now records three successful Lot 4 synthetic RAG milestones. Authentic primary-case, device and release gates remain separate. A readable official financial source must be validated in the runner before Mizan and Manzil can pass.

## App-specific official source replacements

CBUAE HTTP 403 failures remain archived. Mizan now selects the official UAE Government banking page, including Islamic-finance context; this does not certify a supplied ledger as Sharia compliant. Manzil selects the FTA tax-invoice guidance PDF; this does not authenticate receipts, establish VAT recoverability or submit a tax return. Ministry of Finance VAT and saving/budgeting pages complement the catalogue with separately stated scopes.

[Local HTTPS and controlled graph receipts](evidence/lot-4-financial-topic-controls.json) passed for both selected sources. [Budgeting source controls](evidence/lot-4-mof-budget-controls.json) are additional local checks. Neither report uses real model inference or proves GitHub runner access; a targeted runner source check precedes any model retry.
