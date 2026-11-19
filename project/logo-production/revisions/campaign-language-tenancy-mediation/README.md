# Campaign language and tenancy-mediation identity revisions

The user requested further purpose-led improvements to Adab and Adl. The existing mapping is preserved: Adab is The Cultural Marketing Copy Adapter; Adl is The RERA Property Dispute Agent. App names and functions are not swapped.

| App | Revised symbol | Purpose |
|---|---|---|
| Adab | Two contrasting quotation forms bridged by a pen nib | Adapting campaign language and tone for an audience |
| Adl | Two parties' handshake beneath a home roof | Property-dispute dialogue and tenancy mediation as a visual metaphor |

The two transparent PNG symbols and their complete light/dark SVG logos replace the previous in-app versions. All other 23 identities and all 25 original outlined wordmarks remain identical byte-for-byte. Launcher assets, native APIs, agent roles, model configuration and external-action capabilities remain unchanged.

Prior briefs and reference data are preserved in `previous-*.json`. The new entries are recorded as `user_requested_revision`, not as subsequently approved. No runtime approval flow is introduced.

`generation.json` contains prompts and original image paths. Source PNG pixels are copied unchanged; exact-name vector lettering and SVG compositions use the established licensed HarfBuzz/fontTools pipeline.

Verification passed: 280 Python tests, 97 mobile tests, typecheck, ESLint, 25 variant configurations, the English regression scan and PNG/SVG integrity checks. Chromium loaded all six comparison images and all 75 images in the refreshed portfolio gallery. Physical-device acceptance, trademark clearance and independent expert approval remain separate.

The controlled browser interaction audit passed all 25 apps without console warnings/errors or provider inference. Evidence records the exact branding-registry hash and explicit base-commit scope in `project/evidence/signature-portfolio-browser-checks.json`.
