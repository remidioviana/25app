# hisad — report

Run: `75926dcd-e28d-4ab5-92b7-1be0a6769240`

Demo data: yes

## Goal

Rescue board: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "handoff_confirmed": false,
  "matches": [
    {
      "eligible_for_review": true,
      "reasons": [],
      "recipient": "Recipient A — example",
      "travel_minutes": 45
    },
    {
      "eligible_for_review": false,
      "reasons": [
        "insufficient_capacity",
        "allergen_conflict"
      ],
      "recipient": "Recipient B — example",
      "travel_minutes": 20
    }
  ],
  "note": "Screening of supplied records; not a food-safety certification."
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `87df3a9be1cce2c140e48cf957617b2465f92480bb29186bebe6e1646c4416d0`