# gurbah — report

Run: `239f5ffb-2bc6-4132-99ee-ff884cafb9f6`

Demo data: yes

## Goal

Move command center: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "ordered_tasks": [
    {
      "depends_on": [],
      "done": false,
      "due": "2026-11-10",
      "id": "visa",
      "overdue": true,
      "ready": true,
      "title": "Prepare documents"
    },
    {
      "depends_on": [
        "visa"
      ],
      "done": false,
      "due": "2026-12-01",
      "id": "housing",
      "overdue": false,
      "ready": false,
      "title": "Compare housing"
    }
  ],
  "remaining": 2
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `a3f65db1a8c6b1facc846ecafb8436f15c6e9c6fda980144b12c3fb47f1ca81d`