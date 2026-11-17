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

The [targeted GitHub runner source check](https://github.com/remidioviana/25app/actions/runs/44033949295) passed both official HTTPS reads and controlled graphs: [archived runner receipts](evidence/lot-4-financial-runner-controls.json). Mizan used the UAE Government banking page and Manzil used the FTA invoice PDF. This check performed no provider inference. The subsequent protected two-app inference run is tracked separately.

## Financial-source inference result

[Run 44034097716](https://github.com/remidioviana/25app/actions/runs/44034097716) passed Manzil with the FTA invoice PDF, two valid source citations and three distinct returned model IDs. Mizan encountered a source HTTPS transport failure before any model call, despite its preceding successful runner source check. No quota stop occurred. Manzil is preserved as a completed synthetic RAG milestone; Mizan remains pending. Only Mizan is eligible for the next targeted retry.

## Mizan recovery completed

[Run 44034448316](https://github.com/remidioviana/25app/actions/runs/44034448316) retried only Mizan after the new transport failure. It passed with the official UAE Government banking page, two valid source citations and three distinct returned model IDs. No quota stop occurred. Manzil and the other three successful Lot 4 apps were not repeated.

All five Lot 4 apps now have successful synthetic graph/RAG milestones. Earlier failures remain archived. This is not authentic primary-case, device or production-release acceptance.

## Current-code two-app revalidation

The source correction commit `fe63ca3` is included in `ffd28b05b0956e27e69aa7de50137c4d67dd8186`. The current selected sources are the UAE Government banking page for Mizan and the Ministry of Finance VAT overview for Manzil. The FTA invoice guidance remains complementary; historical FTA results above retain their original source scope.

[Run 44089340437](https://github.com/remidioviana/25app/actions/runs/44089340437) was explicitly requested for only Mizan and Manzil, with 20-second role pacing and 30-second app pacing. [The archived report](evidence/lot-4-finance-current-retest.json) records Manzil passing with the Ministry of Finance VAT overview and three provider-reported model IDs. Mizan failed HTTPS transport before model execution. No quota stop occurred. A single targeted Mizan retry follows this new transport failure; Manzil is not repeated. Previous successful milestones are preserved independently of this new attempt.

## Current-code Mizan retry and portfolio result

[Run 44089778189](https://github.com/remidioviana/25app/actions/runs/44089778189) retried only Mizan after the new transport failure. It passed official-source retrieval, domain recomputation, cited evidence and all three roles with distinct provider-reported model IDs, ending with GPT-OSS120B. [Archived report](evidence/lot-4-mizan-current-retry.json). Manzil was not repeated.

Together with the Ministry of Finance Manzil result above, the portfolio again records **25/25 historical successful synthetic live RAG milestones and 25/25 latest recorded synthetic diagnostics passed**. This count spans recorded runs and does not assert that every app was rerun on the latest code. Authentic primary workflows, factual applicability, device acceptance and release remain unaccepted. The failed two-app attempt remains archived separately.
