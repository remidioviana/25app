# sahil — report

Run: `db05b58c-6d24-4125-af5a-407f78b65c95`

Demo data: yes

## Goal

Service guide: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "as_of": "2026-11-14",
  "checks": [
    {
      "reference": "identity.txt:1",
      "requirement": "identity",
      "status": "expired"
    },
    {
      "reference": null,
      "requirement": "address",
      "status": "missing"
    },
    {
      "reference": null,
      "requirement": "application",
      "status": "missing"
    }
  ],
  "missing": [
    "identity",
    "address",
    "application"
  ],
  "note": "User-supplied checklist; document presence does not establish legal eligibility."
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `f2b3a07518215e2ca2a587e572fc8c4732e6512ceab79d89b37fca68cacb25bd`