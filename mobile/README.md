# 25 standalone mobile agents — release 6.0

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
- Planner and Specialist: `llama-3.3-70b-versatile`.
- Auditor: `openai/gpt-oss-120b`.

The transport rotates the starting key on each request, tries each distinct key at most once per model pass, and sanitizes errors. Only the Auditor downgrades to llama, and only after every distinct key returns HTTP 429. Authentication, mixed HTTP failures and connection failures do not trigger a model downgrade. `respond(..., model_override=...)` routes each role explicitly. Tests use fictional keys and controlled HTTP responses; no live provider verification is claimed.

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
