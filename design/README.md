# Product design program — deliveries 01–02

This directory starts the 25-app design program in the order recovered from `apps/apps.json`. It is an incremental delivery, not a claim that 25 production apps or 750 screens are complete.

Start with [the inventory](portfolio/INVENTORY.md), [the completion tracker](portfolio/COMPLETENESS.csv), and [Himayah's design package](himayah/DESIGN.md).

Delivery 02 adds [Iqamah's independent design package](iqamah/DESIGN.md), a 34-view
prototype at `iqamah/index.html`, and a corrected native Iqamah overview. Missing,
expired and present/unverified documents are separated without an eligibility
gauge or a ten-year visa promise. The browser and native overview share one
TypeScript classifier. See [the delivery 02 checks](iqamah/VERIFICATION.md).

Open `himayah/index.html` in a browser for the self-contained prototype. No installation, API key, registration or network service is needed. The screen-reference selector is a review aid outside the product interface. The 32 views share one review state and cover input, configuration, findings, evidence, a copyable packet, recovery and deletion. The prototype performs real local phrase screening; it does not run the production AI agent or verify law.

## What this delivery changes

- Imports the supplied source ZIP as the repository's initial source baseline.
- Recovers all 25 existing identities without renaming or reordering them.
- Documents the first product's strategy, three creative directions, design foundations, 32 screen specifications, five journeys, agent contract, platform adaptations and implementation boundaries.
- Adds an independently inspectable browser prototype and reproducible browser checks.
- Keeps the existing Expo application and server implementation intact.

## What it does not establish

Full native implementation of the new designs, native accessibility, Arabic localization, authoritative legal retrieval, provider execution, verified external delivery, signed builds and the remaining 23 complete design packages are pending. Existing test reports under `docs/` arrived in the ZIP; current checks are explicitly listed in each app's `VERIFICATION.md`.

## Open the prototype

Open `design/himayah/index.html` directly, or from the repository root run:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080/design/himayah/`. This only serves a design prototype, not the Python application's API. GitHub Pages has not been enabled by this change.

For Iqamah, visit `http://localhost:8080/design/iqamah/` or open that directory's
`index.html` directly. Both prototypes are free, accountless and explicitly local.

## Run the browser checks

```sh
python3 -m venv .venv-design
.venv-design/bin/pip install playwright==1.60.0
.venv-design/bin/python -m playwright install chromium
.venv-design/bin/python design/himayah/verify.py
```

The browser executable needs the standard Linux browser libraries. The application itself has no added runtime dependencies. The test script also supports an existing Playwright installation and `PLAYWRIGHT_BROWSERS_PATH`.
