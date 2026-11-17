# Portfolio synthetic RAG validation

All 25 apps have recorded successful live graph/RAG diagnostics using repository synthetic inputs and three distinct provider-reported model IDs, including Qwen Preview. The latest recorded diagnostic status for each app is passed. The original five records are preserved unchanged.

This milestone verifies the diagnostic checks: preserved synthetic inputs, recomputed domain tools, retrieved and cited app-scoped evidence, three responding roles and no external writes. It does not certify factual correctness, authenticate customer documents, accept primary domain cases, prove device interaction, deploy services or release applications. Inconclusive and information-needed answers remain explicitly incomplete.

The permanent default uses two production model IDs across three roles. The opt-in three-model evaluation includes Preview; historical runs retain their original role order and outcomes. Recent recovery runs use 20B planning, Qwen specialist and 120B final review.

| # | App | Latest successful diagnostic evidence |
|---|---|---|
| 1 | Himayah AI | [Passed](evidence/groq-remaining-four-three-model-rag.json) |
| 2 | Iqamah AI | [Passed](evidence/groq-iqamah-sahil-three-model-rag-verified.json) |
| 3 | Istithmar AI | [Passed](evidence/groq-remaining-four-three-model-rag.json) |
| 4 | Munagasah AI | [Passed](evidence/groq-120b-last-munagasah-verified.json) |
| 5 | Sahil AI | [Passed](evidence/groq-iqamah-sahil-three-model-rag-verified.json) |
| 6 | Tawteen AI | [Passed](evidence/lot-2-groq-targeted-retry.json) |
| 7 | Adl AI | [Passed](evidence/lot-2-groq-paced-attempt.json) |
| 8 | Tawassul B2B | [Passed](evidence/lot-2-groq-paced-attempt.json) |
| 9 | Adab AI | [Passed](evidence/lot-2-groq-targeted-retry.json) |
| 10 | Khidmah AI | [Passed](evidence/lot-2-groq-paced-attempt.json) |
| 11 | Jomrok AI | [Passed](evidence/lot-3-groq-live.json) |
| 12 | Khibrat AI | [Passed](evidence/lot-3-groq-live.json) |
| 13 | Majlis AI | [Passed](evidence/lot-3-groq-live.json) |
| 14 | Rafiq | [Passed](evidence/lot-3-groq-live.json) |
| 15 | Sawm AI | [Passed](evidence/lot-3-groq-live.json) |
| 16 | Mizan AI | [Passed](evidence/mizan-official-finance-groq-retry.json) |
| 17 | Thawg AI | [Passed](evidence/lot-4-groq-live-attempt.json) |
| 18 | Manzil AI | [Passed](evidence/lot-4-financial-groq-retry.json) |
| 19 | Gurbah AI | [Passed](evidence/lot-4-groq-live-attempt.json) |
| 20 | Amanah Eco | [Passed](evidence/lot-4-groq-targeted-retry.json) |
| 21 | Nafas AI | [Passed](evidence/lot-5-groq-live.json) |
| 22 | Tadweer AI | [Passed](evidence/lot-5-groq-targeted-retry.json) |
| 23 | Turath AI | [Passed](evidence/lot-5-groq-live.json) |
| 24 | Himam AI | [Passed](evidence/lot-5-groq-live.json) |
| 25 | Hisad AI | [Passed](evidence/lot-5-groq-live.json) |

The final two recoveries used [UAE Government banking guidance](https://u.ae/en/information-and-services/finance-and-investment/banking-in-uae) for Mizan and [FTA tax-invoice guidance](https://tax.gov.ae/DataFolder/Files/Pdf/06-Tax-Invoices.pdf) for Manzil. Both also passed a separate [GitHub runner source check](https://github.com/remidioviana/25app/actions/runs/44033949295). CBUAE HTTP 403 failures and the subsequent transient transport failure remain archived. No authentication, redirect or TLS bypass was used.

Validation at the source-change commit: 242 Python tests, 51 mobile tests, typecheck, lint and all 25 variant configurations passed. Evidence-only changes are checked again by CI. No inference was repeated for already-passed apps in the final recovery.
