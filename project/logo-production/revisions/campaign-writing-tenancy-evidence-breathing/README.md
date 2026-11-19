# Campaign writing, tenancy evidence and breathing identity revisions

The user explicitly requested purpose-led improvements to Adab, Adl and Nafas.

| App | Revised symbol | Actual task |
|---|---|---|
| Adab | Megaphone with an integrated pen nib | Reviewing and adapting campaign copy |
| Adl | House-topped rental folio, evidence rail and inspection lens | Organizing tenancy evidence and reviewing claims |
| Nafas | Calm seated figure with an open breathing arc | A local wellbeing and breathing pause |

The three transparent PNG symbols and complete light/dark SVG logos replace the previous in-app assets. All other 22 identity systems and all 25 original outlined wordmarks remain identical byte-for-byte. Launcher assets, native APIs, agent roles and model configuration are unchanged.

The earlier briefs and identity-reference manifest are retained in `previous-*.json`. The three new entries are recorded as `user_requested_revision`, not as subsequently approved. No runtime approval flow is added.

`generation.json` records prompts and original generated paths. PNG pixels are copied unchanged; exact-name vector lettering and self-contained compositions use the existing licensed HarfBuzz/fontTools pipeline.

Local verification passed: 280 Python tests, 97 mobile tests, typecheck, ESLint, all 25 variant configurations, the English regression scan and PNG/SVG integrity checks. Chromium loaded all nine comparison images and all 75 images in the refreshed portfolio gallery. Physical-device acceptance, trademark clearance and independent expert approval remain separate.

The controlled browser interaction audit passed all 25 apps without console warnings/errors or provider inference. Evidence records the exact branding-registry hash and base-commit scope in `project/evidence/signature-portfolio-browser-checks.json`.
