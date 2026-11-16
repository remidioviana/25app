# thawg — report

Run: `0c8572fa-19bc-45c2-8981-7160c439db19`

Demo data: yes

## Goal

Dining shortlist: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "booked": false,
  "note": "Confirm availability and dietary restrictions directly with the venue.",
  "shortlist": [
    {
      "available_seats": 4,
      "eligible_on_supplied_data": true,
      "name": "Venue A — example",
      "price": 100,
      "reasons": [],
      "tags": [
        "vegetarian"
      ]
    },
    {
      "available_seats": 2,
      "eligible_on_supplied_data": false,
      "name": "Venue B — example",
      "price": 180,
      "reasons": [
        "over_budget",
        "insufficient_reported_seats"
      ],
      "tags": [
        "vegetarian"
      ]
    }
  ]
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `7c8d0b3b1c3f26ba0af117f0d639bbaddaac51404845c7860214acec9b43f99c`