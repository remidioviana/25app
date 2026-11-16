# Verification — delivery 02 / Iqamah AI

This report concerns the new design and native-overview increment. It does not convert source exports or browser checks into signed/device verification.

## Executed

| Check | Result | What it establishes |
|---|---|---|
| `npm run typecheck` in `mobile/` | Passed | New native component/helper and existing project typecheck |
| `npm run lint` in `mobile/` | Passed | No reported lint errors or warnings |
| `npm test` in `mobile/` | 36 passed | Includes 5 new dossier tests and existing API/form/evidence tests; actual local authenticated Python HTTP execution for all 25 agents |
| `node scripts/check-domains.cjs` | 25 components × 3 scenarios passed | Example, invalid draft and empty arrays render without NaN/undefined; React DOM adapters, not native visual tests |
| `npm run variant -- iqamah export --platform android --platform ios` | Both passed | Metro produced Android and iOS bundles for the Iqamah variant; no APK/IPA signing or physical-device test |
| `node design/iqamah/build-engine.cjs --check` | Passed | Browser classifier generated from the native TypeScript source is current |
| `python design/iqamah/verify-parity.py` | 12 passed | Supported, unambiguous date/name cases agree with the existing Python tool's statuses/references |
| `python design/iqamah/verify.py` | Passed | Connected preparation workflow and behavioral cases below |
| Browser layout matrix | 272 passed | 34 views × 4 viewport widths × iOS/light and Android/dark visual-intent combinations |
| Enlarged text | 34 views passed | At 320-wide viewport with 200% root text; app content has no hidden horizontal clipping |
| Reduced motion | Passed | View animation disabled under the system preference |
| Contrast script | See `contrast-check.json` | Intended body/status/action/selection text pairs meet 4.5:1; not all possible visual states or native shell |
| Visual inspection | Home, summary and dark record view inspected | Three browser views at 390-wide viewport; not an exhaustive manual visual/native audit |
| Diff whitespace | Passed | New and edited tracked-source diff |

## Browser behavioral coverage

- Initial real dossier is empty; fictional sample is an explicit separate choice.
- Main route, checklist, document, date, brief, plan, acknowledgement, local-check and packet journey.
- Missing acknowledgement produces a readable message.
- Sample produces one missing item and one present/unverified record; no expired item or eligibility result is fabricated.
- Invalid calendar dates preserve all document draft fields.
- Duplicate record names do not silently overwrite a record.
- Recorded expired evidence is counted separately from missing evidence.
- Blank expiry remains unknown/present-unverified, not perpetual validity.
- Saved record/date/context changes invalidate the previous local result.
- Markup in references and requirement names is displayed as text, not executed.
- Export contains exact current inputs, recorded results and explicit `submission: not performed` / `eligibility: not determined`.
- Deletion removes metadata, checklist and current result; an empty checklist cannot run.
- Zero browser page errors or external HTTP(S) requests during the test.

The classifier's native tests cover equality at the reference date, leap years/non-leap centuries, exact-name matching, immutable inputs and ambiguous/invalid input rejection. The UI's duplicate/name/date validation is intentionally stricter than the legacy backend tool; the parity result is limited to supported unambiguous inputs.

## Reproduce

From the repository root, after the supplied dependencies and Playwright/Chromium are installed:

```sh
cd mobile
npm ci
npm run typecheck
npm test
npm run lint
node scripts/check-domains.cjs
npm run variant -- iqamah export --platform android --platform ios
cd ..
node design/iqamah/build-engine.cjs --check
python design/iqamah/verify-parity.py
python design/iqamah/verify-contrast.py
python design/iqamah/verify.py
```

Open `design/iqamah/index.html` directly in a browser; it has no application runtime service dependency. Only the optional test/build tools need Node/Python packages. To regenerate the browser classifier after changing `mobile/src/dossier.ts`, run `node design/iqamah/build-engine.cjs`.

## Remaining acceptance

No official criteria, document content/authenticity, live model call, official portal authorization, application filing, signed build, physical iOS/Android run, native accessibility acceptance, Arabic translation or RTL prototype was verified. No usability study, independent design score, visa outcome or award competitiveness is asserted.

The full 34-view design has not been installed into native navigation. The native increment is the corrected overview/index with expandable references, written states and deterministic validation. Existing backend-wide historical test reports remain separate; the Python suite was last run in delivery 01, while the native API test was rerun in this delivery.
