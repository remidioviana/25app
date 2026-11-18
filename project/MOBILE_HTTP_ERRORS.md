# Mobile HTTP error status preservation

When a proxy or server returned HTML, plain text or an empty body for an HTTP failure, the mobile API client previously threw a JSON parsing error and lost the HTTP status. JSON `null` caused a property-access error; non-string `error` fields could become unusable messages.

The client now retains the response status in `ApiError` and uses the existing English fallback when a valid non-empty error string is unavailable. Raw proxy response bodies are not shown. Valid JSON error messages remain supported. Cancelled body reads preserve their cancellation error, and invalid JSON on a successful HTTP response still fails instead of being reported as successful data.

Regression coverage includes HTTP 401 HTML, HTTP 429 text, HTTP 503 empty body, null/array/invalid JSON error shapes, malformed successful JSON and cancellation while reading a failed response. The mobile suite passes 95 tests, along with typecheck, ESLint and all 25 variant configurations. This verification uses controlled transport and the local backend tests; no provider inference or device acceptance is asserted.
