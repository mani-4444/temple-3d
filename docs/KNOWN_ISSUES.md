# Known issues

Record issues honestly. Do not delete an issue until it has been verified as resolved.

| ID | Issue | Severity | Reproduction / evidence | Status | Next action |
|---|---|---|---|---|---|
| KI-001 | Temple model is an original procedurally generated, stylized GLB rather than a professionally sculpted/scanned model. Openly licensed Sketchfab candidates exist, but downloading them requires a signed-in account. | Medium (visual fidelity) | `curl …/v3/models/1449065e…/download` → HTTP 401 "Authentication credentials were not provided." | Open (accepted fallback) | Optional: the user downloads a CC BY model while signed in, places it in `public/models/`, and updates `TEMPLE_MODEL` + landmark poses (see README "Swapping the model"). |
