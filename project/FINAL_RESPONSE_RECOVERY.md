# Final-response delivery recovery

The final model remains GPT-OSS120B. A recognized structured-generation HTTP 400 can receive one larger strict-JSON regeneration. If that also fails with a recognized generation error, the final responder alone can use one `deliver_role_result` function-report request after a 60-second cooldown.

This function reports data and performs no external action. The exact same response schema is validated locally, followed by citation validation and conservative outcome classification. Unsupported function names and invalid schemas are rejected. The successful delivery contract and recovery count are recorded; failed-attempt token usage remains explicitly unavailable.

Quota, authentication-only, invalid-schema and availability failures do not authorize this recovery. No extra request is made after a quota response. Cancellation is checked before regeneration and during the cooldown. Other roles keep their existing bounded generation policy.

This addresses an observed final-delivery failure in the Lot 2 diagnostic. Offline regression tests cover valid recovery, quota interruption, cancellation, unsupported functions and invalid final objects. A live success is recorded only after a corresponding protected workflow actually completes; a code change does not retroactively repair an earlier failed run.
