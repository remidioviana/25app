# Five purpose-led identity refinements

The user explicitly requested new Himayah, Tawteen, Sawm, Majlis and Turath logos with a clearer relationship to their app purposes. “Majilis” was interpreted as the existing Majlis corporate-onboarding companion.

| App | Revised symbol | Purpose |
|---|---|---|
| Himayah | Shield, contract page and inspection magnifier | Privacy-contract protection and clause review |
| Tawteen | Professional workforce within an employment frame | Workforce reconciliation and national-hiring planning |
| Sawm | Crescent and hourglass | Intentional work/rest windows during Ramadan |
| Majlis | Employee badge crossing an open office threshold | Sequenced professional onboarding |
| Turath | Open book and Gulf wind tower | Source-backed cultural-heritage learning |

The five transparent PNG symbols and their complete light/dark SVG logos replace the prior versions at the existing in-app asset paths. All 25 original outlined wordmarks and the other 20 identity systems are preserved byte-for-byte. Himayah also receives matching opaque launcher artwork and a separately generated, padded Android adaptive foreground; its existing indigo background remains unchanged. No native APIs or agent-model selections change.

The original approval snapshot and generation briefs are retained in `previous-*.json`. The current reference manifest marks these five as `user_requested_revision`; it does not claim the new versions were subsequently approved. The other 20 retain their original approval. This explicit user-requested redesign supersedes the five earlier visual references without introducing an app approval flow.

`generation.json` records source image paths and prompts, including the two matching launcher exports. Source artwork is copied unchanged; image generation performs the illustration/editing. The existing HarfBuzz/fontTools pipeline composes the exact-name vector lettering.

Local verification passed: 279 Python tests, 97 mobile tests, typecheck, ESLint, all 25 variant configurations, the English regression scan, PNG alpha/hash validation and Android circular safe-area checks. Chromium loaded every image in the five-brand equal-size before/after comparison and refreshed all-25 gallery. These checks do not establish physical-device acceptance, trademark clearance or factual/functional app approval.

The controlled browser interaction audit passed all 25 apps with no console warnings/errors and no provider inference. Evidence: `project/evidence/signature-portfolio-browser-checks.json`, including the exact branding-registry hash and explicit base-commit scope of the tested working-tree revision.
