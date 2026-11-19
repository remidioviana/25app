# Workforce, B2B, care, property and recycling identity revisions

The user explicitly requested clearer-purpose logos for Tawteen, Tawassul, Nafas, Adl and Tadweer.

| App | Revised symbol | Purpose |
|---|---|---|
| Tawteen | Personnel panel, workforce bars and hiring target | Workforce composition and hiring planning |
| Tawassul | Proposal document joined by copper/green links | Evidence-backed B2B proposals |
| Nafas | Person embraced by a caring heart | Emotional support and breathing room |
| Adl | Home outline and balanced scales | Tenancy disputes and evidence-led fairness |
| Tadweer | Separated paper/bottle within directional recycling arrows | Material sorting and recycling routes |

The five PNG symbols and complete light/dark SVG compositions replace the corresponding in-app assets. All other 20 current identity systems and all 25 outlined wordmarks are unchanged byte-for-byte. Launcher artwork, native APIs, agent roles and model selections are unchanged.

Previous approval/reference data and generation briefs are preserved in `previous-*.json`. These five assets are recorded as `user_requested_revision`, not as subsequently approved. Earlier requests and the original approval remain traceable. No runtime approval flow is introduced.

`generation.json` records the image-generation prompts and original output paths. PNG pixels are copied unchanged; vector lettering and self-contained compositions use the existing licensed HarfBuzz/fontTools pipeline.

Local verification passed: 280 Python tests, 97 mobile tests, typecheck, ESLint, all 25 variant configurations, the English regression scan and full PNG/SVG integrity checks. Chromium loaded all 15 images in the equal-size before/after panel and all 75 images in the refreshed 25-brand gallery. Physical-device acceptance, trademark clearance and independent expert approval remain separate.

The controlled browser interaction audit passed all 25 apps without console warnings/errors or provider inference. `project/evidence/signature-portfolio-browser-checks.json` records the exact branding-registry hash and explicit base-commit scope of the tested working-tree revision.
