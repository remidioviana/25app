# adl — report

Run: `c320847c-7453-401b-8439-dc03f1a8c2b6`

Demo data: yes

## Goal

Dispute timeline: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "claimed_total": 5250.0,
  "claims": [
    {
      "amount": 5000.0,
      "evidence": "recibo:1",
      "label": "Claimed deposit"
    },
    {
      "amount": 250.0,
      "evidence": "nota:1",
      "label": "Claimed expense"
    }
  ],
  "currency": "AED",
  "note": "Sum of claimed amounts; does not establish entitlement to compensation.",
  "timeline": [
    {
      "date": "2026-09-01",
      "description": "Deposit payment",
      "reference": "recibo:1"
    },
    {
      "date": "2026-10-01",
      "description": "Property handover",
      "reference": "termo:1"
    }
  ]
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `01ab34bc4194b17f000c63b8959c3f0098a4662182a73d4677305dced43fa835`