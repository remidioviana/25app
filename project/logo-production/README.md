# Complete 25-app logo and symbol delivery

All 25 brands have an isolated transparent RGBA symbol, two exact-name outlined SVG wordmarks and two self-contained SVG logo compositions for light/dark surfaces. Symbols are generated raster artwork; lettering is shaped from the existing licensed brand typefaces using HarfBuzz, then converted to vector paths. SVG compositions embed the symbol without external dependencies. These are not all-vector symbols or editable 3D scenes.

The approved Munagasah proposal folio is reused unchanged. Iqamah retains its white iOS/Android launcher background. The 25 in-app signatures use the symbols with native accessible text and keep their independent layouts. Launcher artwork remains governed by the separate dimensional-icons registry; this delivery does not claim 25 new launcher icons.

- Compare every identity: `brand-assets/production/index.html` (serve the repository root over HTTP).
- File provenance and hashes: `brand-assets/dimensional-logos.json`.
- Technical evidence: `project/evidence/25-logo-symbol-validation.json`.
- Original generation briefs and provenance: this directory's `briefs.json` and `metadata/`.
- Rebuild outlined names and downloadable pack: install `requirements.txt`, then run `build-pack.py` from the repository root.
- Read-only file checks: `python project/logo-production/verify.py` (Pillow required) and `npm --prefix mobile run check:variants`.

Local validation: 251 Python tests, 92 mobile tests, TypeScript typecheck, ESLint and all 25 variant configurations passed. The comparison gallery loaded all 75 images in Chromium and was visually inspected on light, dark and transparency-grid surfaces. File checks confirm unique symbols, transparent edges, exact names and hashes. Physical Android/iOS inspection, trademark clearance and independent expert approval remain separate acceptance steps.

The inherited Expo server stopped during the first wider browser audit attempt. Repeating the audit against a newly started, explicitly configured visual-audit server passed all 25 browser flows with controlled transport and existing synthetic inputs, zero provider inference and no console warnings/errors. Evidence: `project/evidence/signature-portfolio-browser-checks.json`, source commit `23c600f3436274382b56042251e0cd8b60b580f8`. This is browser evidence, not native-device acceptance.

GitHub Code checks passed for the implementation commit: https://github.com/remidioviana/25app/actions/runs/44197595234 . Android/iOS JavaScript/assets exports were dispatched separately: first five https://github.com/remidioviana/25app/actions/runs/44197627239 and remaining lots https://github.com/remidioviana/25app/actions/runs/44197631854 . They were still pending/in progress at this documentation checkpoint; no completed export or signed build is implied.
