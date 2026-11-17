# Lot 1: completed synthetic RAG validation milestones

The five completed validation records below remain preserved. Each app completed an integrated synthetic diagnostic with real Groq inference, local tools, BM25 retrieval and three distinct provider-reported model identifiers. These milestones are not authentic-case acceptance, device verification, permanent deployment or release.

| App | Source scope | Completed validation evidence |
|---|---|---|
| Himayah | Explicitly selected reviewed PDPL snapshot; no fresh runner fetch asserted | [43864001094](https://github.com/remidioviana/25app/actions/runs/43864001094) |
| Iqamah | ICP Golden Residency information read over HTTPS | [43867467664](https://github.com/remidioviana/25app/actions/runs/43867467664) |
| Istithmar | DMCC Schedule of Charges read over HTTPS | [43864001094](https://github.com/remidioviana/25app/actions/runs/43864001094) |
| Munagasah | eSupply information page, not an individual tender | [44007989450](https://github.com/remidioviana/25app/actions/runs/44007989450) |
| Sahil | DEWA Move-in information read over HTTPS | [43867467664](https://github.com/remidioviana/25app/actions/runs/43867467664) |

The historical first-lot runs used planner GPT-OSS20B, specialist GPT-OSS120B and critic Qwen3.8-27B Preview and ended with `requires_human_review`. Their original outcomes remain intact. Munagasah was subsequently verified in the requested order, **20B → Qwen → 120B**, ending with `reviewed_by_model`: three role calls, 6,304 reported tokens, four retrieved passages and one cited passage. The [evidence](evidence/groq-120b-last-munagasah-verified.json) does not establish primary tender acceptance. The additional final-resolution branch was not exercised in that successful run.

The [earlier Munagasah 401/400 attempt](evidence/groq-120b-last-munagasah-attempt.json) remains preserved. Historical success is not substituted for the latest failed attempt. The permanent code defaults still contain two production IDs; the explicit three-model profile includes Qwen Preview. Render's prepared configuration selects that profile with opt-in.

## Current application behavior

The final 120B responder can correct a draft, ask for indispensable information, or return an explicitly limited answer. New runs do not use generic human review as their fallback outcome. Earlier saved records retain their original states. Optional useful/not-useful feedback is separate from the autonomous analysis workflow.

- [Autonomous response policy](RESPOSTA_AUTONOMA.md).
- [Same-model final-delivery recovery](FINAL_RESPONSE_RECOVERY.md).
- [Groq contingency and catalogue limits](GROQ_CONTINGENCIA.md).

Source receipts, source scope, original fetch times, claims, citation IDs and exact recorded passages survive report export. Reusing a stored source receipt is marked as reuse, not a fresh network read. Passage hashes identify the exported text; they do not establish factual support or authenticity.

The mobile import/save workflow now keeps a server-computed receipt for original bytes, extracted text and saved text, explicitly recording edits. That receipt accompanies retrieval and Markdown export. Original bytes are not retained. Tests exercise missing-input rejection, authenticated execution, document import/save, retrieval and export for all 25 apps using controlled data.

## Build and deployment preparation

Android/iOS JavaScript and asset exports exist for the first five, with variant identifiers and bundle hashes. They are not signed APKs/IPAs. The backend container has passed controlled execution, authentication, non-root operation, Render-hostname handling and data persistence after container replacement using a local Docker volume.

Expo owner/project configuration and the Render Blueprint are saved. The operator will authenticate EAS and deploy later. Render Free has ephemeral local storage; local Docker persistence does not establish durability on that plan.

- [Expo and Render setup](EXPO_RENDER_CONFIGURACAO.md).
- [Backend deployment preparation](IMPLANTACAO_BACKEND.md).
- [Historical native export report](evidence/first-five-native-exports.json).
- [Container verification](evidence/backend-container-check.json).

## Remaining acceptance gates

Authentic primary cases, factual/legal applicability, complete native flows on Android/iOS devices, durable hosted operation and signed distribution remain separate unaccepted gates. No government submission, bid, refund, booking or other external write has been claimed complete. The first-lot synthetic milestones remain completed in `portfolio.json`; none of these additional gates is inferred from shared code or passing unit tests.

Lots 2–5 now have official-source catalogues and controlled integration evidence in their respective acceptance records. Live runs must remain sequential and preserve quota stops, failed attempts and explicit incomplete outcomes. A new live run is not inferred from time passing or from a configuration-only check.
