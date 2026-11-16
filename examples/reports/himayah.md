# himayah — report

Run: `efeafe74-1e01-4fcf-818a-b8e5235042e7`

Demo data: yes

## Goal

Privacy review: analyze my supplied inputs, identify gaps and prepare verifiable next steps.

## Verifiable analysis

```json
{
  "findings": [
    {
      "flagged": true,
      "matches": [],
      "required": true,
      "rule": "Retention provision"
    },
    {
      "flagged": true,
      "matches": [
        {
          "end": 27,
          "quote": "The supplier may share data. The agreement has a term of 12 months.",
          "start": 17
        }
      ],
      "required": false,
      "rule": "Data sharing"
    }
  ],
  "flag_count": 2,
  "note": "Text screening against supplied rules; not legal advice or semantic interpretation."
}
```

## Evidence

## Limits

- User-supplied sources; freshness and authenticity are not automatically verified.
- AI narrative, when present, is separate from verifiable calculations.

No external action was performed.

Analysis hash: `f281f7751e4d8620df1ebe7946ea6e30acf17542a96fcc5079060f98cabbed71`