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

GitHub Code checks passed for the implementation commit: https://github.com/remidioviana/25app/actions/runs/44197595234 . Android/iOS JavaScript/assets exports completed successfully for all 25 apps: first five https://github.com/remidioviana/25app/actions/runs/44197627239 and remaining lots https://github.com/remidioviana/25app/actions/runs/44197631854 . These runs export JavaScript and assets; they do not establish a signed binary, installation or physical-device acceptance.

CI path filters now include `brand-assets/**` for pushes and pull requests, so changes to production symbols, vector compositions or their integrity registries trigger the existing Python/mobile checks.

## Completeness regression check

The variant validator now requires exactly four SVG entries per brand, each at its canonical brand-specific path, and verifies the source typeface hash. A registry that omits an SVG can no longer pass while claiming 100 validated files. Local fault injection in isolated Node processes rejected a missing dark logo, a wordmark pointing at another brand and a stale typeface hash; no repository assets were modified by those checks. ESLint and all 25 variant checks passed with the complete registry.

## User-approved visual reference

The user explicitly approved all 25 identities after seeing the seven purpose-led revisions. `brand-assets/approved-identities.json` records the approval statement, source asset commit and exact paths/SHA-256 hashes of 25 transparent symbols and 100 outlined wordmark/logo files. This is user visual approval, not functional acceptance, physical-device testing or trademark clearance.

The existing variant validator now compares current production assets with this reference as well as verifying their bytes. Accidental regeneration cannot silently replace an approved identity merely by updating its production registry. Future user-requested redesigns should update the reference with the corresponding approval provenance. No runtime approval flow is added to any app.

ESLint and all 25 variant checks passed. In-memory fault injection into an Iqamah symbol hash and a Hisad dark-logo hash was rejected with the approved-reference diagnostic; no production artwork was changed by those checks. The approved artwork implementation passed GitHub Code checks: https://github.com/remidioviana/25app/actions/runs/44418870353 .
