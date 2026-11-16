# 25 standalone mobile agents — release 6.0

## Operational audit and real public-source pilot

Start with the [structural plan](PLANO_ESTRUTURAL.md),
[agentic priority and actual model roles](project/PRIORIDADE_AGENTICA.md),
[25-app capability audit](project/auditoria_capacidades.json), and
[real integration/source matrix](project/INTEGRACOES_REAIS.md).

Operational apps now start with empty/unknown data instead of preloaded fictional
records. Five reviewed public-source readers have actual retrieval receipts and a
native Evidence panel. The tool-calling and team runtimes can request permitted
source reads, preserve provenance and exclude superseded source versions from
current retrieval. These are partial capabilities, not completed primary agents.

The default runtime has three roles and two distinct model IDs. Protected GitHub Actions runs verified live tool roundtrips and a synthetic Munagasah graph with official-source RAG; see [live evidence](project/evidence/groq-munagasah-rag-verified.json). These checks do not validate authentic customer cases or three distinct models. No government submission, financial write,
booking, signed app or complete primary live-agent workflow is claimed. See the
[integrated verification report](project/VERIFICACAO_INTEGRADA.md).

## New design program — incremental delivery

The original source package is preserved below. The [design program](design/README.md)
adds the recovered 25-app inventory, an honest completion tracker, and the first
Himayah AI design unit with a 32-view interactive browser prototype. This is not
a claim that 25 production-ready apps or 750 native screens are complete.

See [Himayah design and boundaries](design/himayah/DESIGN.md) and
[checks executed for this update](design/himayah/VERIFICATION.md).

Delivery 02 adds [Iqamah's 34-view design and prototype](design/iqamah/DESIGN.md)
and a functional native-overview correction: expired, missing and unverified
records are distinct, dates and duplicates are validated, and no visa-eligibility
score or unsupported ten-year promise is displayed in that overview. The full
native journeys and official integrations remain pending. See the
[Iqamah verification report](design/iqamah/VERIFICATION.md).

The primary experience is `mobile/`: 25 individual Expo Android/iOS variants. Each launches directly into its own domain workspace with Overview, Mission, Evidence and Activity tabs. There is no cross-app catalog in the mobile UI. Mizan is the default variant. The existing web operator console and Python backend remain available.

## Run

Use Python 3.10+ and a Node version supported by Expo SDK 58.

```sh
python3 -m pip install -r requirements-agentic.txt -r requirements-documents.txt
python3 server.py
```

In a second terminal:

```sh
cd mobile
npm ci
npm run variant -- mizan start --go
```

Replace `mizan` with any ID in `brand-assets/brands.json`. Open the matching Expo Go app, then connect from the app to your server URL using its server-issued user token. Production connections require HTTPS. Provider API keys belong only on the Python server, never in the mobile app. Local domain tools need no AI key; team execution needs the configured provider and LangGraph dependencies.

## Hybrid AI transport

Set server environment variables before starting Python (the application does not automatically load `.env`):

- `OPENAI_API_KEY`: comma-separated server-side keys.
- `OPENAI_BASE_URL`: `https://api.groq.com/openai/v1` (default).
- Planner and Specialist: `openai/gpt-oss-20b`.
- Auditor: `openai/gpt-oss-120b`.

The transport rotates the starting key on each request, tries each distinct key at most once per model pass, and sanitizes errors. Only the Auditor may downgrade to GPT-OSS20B in non-strict mode, and only after every distinct key returns HTTP 429. Authentication, mixed HTTP failures and connection failures do not trigger a model downgrade. `respond(..., model_override=...)` routes each role explicitly. Unit tests use fictional keys and controlled HTTP responses. Separate live evidence is recorded explicitly; GPT-OSS reviewer decisions now use strict JSON schema while planner/specialist retain tool calling.

Role IDs are configurable through `AGENT_PLANNER_MODEL`, `AGENT_SPECIALIST_MODEL`, and `AGENT_AUDITOR_MODEL`. `AGENT_REQUIRE_DISTINCT_MODELS=1` rejects duplicate configured or provider-reported identities. The defaults contain two distinct models, not three. See [secure Groq setup](project/GROQ_CONEXAO_SEGURA.md) for the protected secret and manual Actions verifier. Catalogue reading is separate from optional, potentially billable inference probes.

## Build variants

```sh
cd mobile
npm run variant -- hisad config --type public
npm run variant -- hisad export --platform android --platform ios
npm run variant -- hisad build --platform android
npx eas-cli@latest build --profile hisad-preview --platform ios
```

Each variant has separate preview/production profiles, bundle/package IDs, icons, portrait splash and SVG logo. Set `APP_ID_PREFIX` to your registered reverse-DNS namespace. EAS signing and app-store submission are separate operator steps. No APK/IPA or physical-device verification is included. Expo Go does not prove native splash rendering.

## Verification

```sh
python3 -m unittest discover -s tests -v
python3 -m pip install Pillow
python3 scripts/audit_images.py
python3 scripts/audit_english.py
cd mobile
npm run typecheck
npm test
npm run lint
npm run check:variants
node scripts/check-domains.cjs
npm run export:native
```

See `docs/IMPLEMENTATION_STATUS.md` and adjacent test reports for results and pending checks. The examples are fictional, executed locally and explicitly marked as demonstration data. Legal rules, fees, availability, certifications and route status require supplied evidence. The UI does not fabricate government datasets or perform external submissions. On-device inference, voice, operating-system automation and advanced cryptography are not implemented by this release.
