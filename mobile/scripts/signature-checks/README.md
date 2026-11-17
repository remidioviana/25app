# Opt-in signature regression checks

Install the repository Python dependencies and Playwright with Chromium. Start the existing Expo application from `mobile/`:

```sh
EXPO_PUBLIC_VISUAL_AUDIT=1 EXPO_NO_DOTENV=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port 8091
```

From the repository root, using that Python environment:

```sh
python mobile/scripts/signature-checks/run.py
python mobile/scripts/check-matrix-browser.py
```

Optional environment: `PLAYWRIGHT_CHROMIUM_EXECUTABLE` selects an installed Chromium; `EXPO_AUDIT_ORIGIN` selects the running audit frontend (default `http://127.0.0.1:8091`). The first runner starts two ephemeral local authenticated HTTP backends, generates a valid PDF from the existing synthetic Himayah example, runs the four checks sequentially and removes their temporary databases/files. The workspace token is a fixed fictional test value. Provider credentials are explicitly disabled in the child servers. Do not point these checks at a live customer workspace.

Reports go to `project/evidence/signature-*.json`. Screenshots are temporary. Time advancement is virtual and is not a performance measurement. The matrix check uses controlled API transport; the signature PDF/race checks use actual isolated HTTP backends. Neither proves authentic legal input, physical-device behavior or live model acceptance.
