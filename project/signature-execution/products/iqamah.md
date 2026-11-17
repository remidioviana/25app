# Iqamah implementation record

The preparation folio now uses the Iqamah burgundy/ivory palette and Cormorant heading system. A numbered evidence pathway leads into expandable document records, rather than generic metric cards. The Folio tab supports editing references and expiry dates, removing records and exporting the current editable dossier as JSON.

The deterministic assessment uses the supplied checklist and exact names; missing, recorded-expired and present-unverified remain distinct. Unknown expiry stays unknown. No route eligibility or document authenticity is inferred. Open Criteria for the existing official-source context; this increment does not automatically create a current legal checklist.

Required primary screens remain:

- Visa Intelligence
- Eligibility Explorer
- Qualification Assessment
- Application Dossier
- Submission Preparation

This increment implements the preparation interaction, not all five new compositions. Existing historical synthetic live RAG diagnostics are preserved. No new provider inference was needed for local record editing.

Evidence: `project/evidence/iqamah-preparation-browser.json`. Actual Expo Web interactions with the repository synthetic example through controlled intake transport verify invalid-date rejection, unknown expiry, editing, removal, downloaded JSON and reduced-motion behavior. Physical iOS/Android, authentic primary case, current legal applicability and measured performance remain pending. Scores and acceptance gates remain unassigned/unaccepted.

Reproduce with `python mobile/scripts/check-iqamah-browser.py`, the running visual-audit Expo frontend and Playwright Chromium. Set `EXPO_AUDIT_ORIGIN` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if needed. The controlled transport is explicit test scaffolding and performs zero provider calls.
