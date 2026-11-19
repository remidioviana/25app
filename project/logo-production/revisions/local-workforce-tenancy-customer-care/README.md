# Local workforce, tenancy and customer-care identity revisions

The user explicitly requested purpose-led refinements for Tawteen, Adl and Khidmah.

| App | Revised symbol | Purpose |
|---|---|---|
| Tawteen | Emirati professional figures with a business case | Local professional participation and hiring |
| Adl | House-shaped rental key and legal gavel | Tenancy rights and dispute preparation |
| Khidmah | Support headset, parcel and return arrow | Customer support and return resolution |

These three transparent PNG symbols and complete light/dark SVG logos replace the previous in-app versions. The other 22 current identity systems and all 25 exact-name outlined wordmarks remain unchanged byte-for-byte. Launcher artwork, native APIs, agent roles and provider configuration do not change.

Previous briefs and the identity-reference manifest are preserved in `previous-*.json`. New entries are marked `user_requested_revision`, not as subsequently approved. Earlier requests and the original user approval remain traceable. There is no new approval flow in the apps.

`generation.json` contains image-generation prompts and original output paths. Source PNG pixels are copied unchanged; the established licensed HarfBuzz/fontTools pipeline composes vector lettering and self-contained SVG logos.

Verification passed: 280 Python tests, 97 mobile tests, typecheck, ESLint, 25 variant configurations, the English regression scan and full PNG/SVG integrity validation. Chromium loaded all nine images in the equal-size before/after comparison and all 75 images in the refreshed portfolio gallery. Physical-device acceptance, trademark clearance and independent expert approval remain separate.

The controlled browser interaction audit passed all 25 apps without console warnings/errors or provider inference. Its evidence records the exact branding-registry hash and explicit base-commit scope: `project/evidence/signature-portfolio-browser-checks.json`.
