# Deployment, cost controls and security

## Proposed pilot deployment

Cloud Run web/API image, private Cloud Storage bucket, PostgreSQL database, and separate finite render/generation execution. Select a single region after checking user location, service availability, residency and actual prices. Do not choose a region merely because it is a common default.

The local machine has Docker and FFmpeg. gcloud is absent. A Google credential variable exists, but its usability and scope are unverified. No Cloud resources were provisioned, no billing account inspected, and no $200 balance verified. No deployment skeleton is presented as deployable before identity, database and queue decisions are settled.

## $200 planning envelope

| Category | Maximum allocation |
|---|---:|
| Web/API experiments | $25 |
| Database and storage | $25 |
| AI experiments | $70 |
| Rendering/media | $45 |
| Test reserve | $20 |
| Emergency reserve | $15 |
| Total | $200 |

These are user-provided allocations, not vendor price estimates. Continuously billed managed database/queue services may exceed the $25 data allocation: obtain a current regional estimate before creation. The application must report actual measured usage, not interpolate an unverified unit rate. Trial credit eligibility can differ by service/model/account and is not established here.

### Controls before first billable request

- Verify project, billing account, credit balance/expiry and service eligibility with an authorized operator.
- Set budget alerts at $50, $100, $150 and $180. Alerts can be delayed and are not hard caps.
- Enforce an application-level atomic reservation ledger, per-job maximum, per-tenant quota and global emergency stop. Ledger reconciliation includes external-provider charges and Cloud usage where available; application controls alone cannot guarantee total Cloud spend.
- Keep Cloud Run minimum instances at zero for web if viable; cap maximum instances and request concurrency based on measured DB capacity. Set finite job timeouts/retries and worker concurrency 1 for the pilot.
- Avoid continuous GPU endpoints and unattended batch runs. Require explicit approval for paid APIs and new continuously billed resources.
- Apply private asset lifecycle cleanup after an agreed retention period; do not delete user originals automatically.
- Provide an operator shutdown runbook: stop new jobs, cancel queued work, remove scheduled triggers, disable worker entrypoints, reconcile reservations, then inspect remaining database/storage/network charges.

## Security design

Identity: Auth.js-compatible provider or managed identity; server-side session validation, secure HttpOnly SameSite cookies, CSRF protection on cookie-authenticated mutations, callback allowlists and logout/session expiry tests. A local bypass must never be enabled in a production image.

Authorization: owner/editor/viewer roles checked for every resource and job. Tenant-scoped queries and composite foreign keys prevent cross-tenant relations; consider RLS as defense in depth after testing connection-pool context handling. No raw SQL built from caller strings.

Secrets: keep production credentials in Secret Manager or workload identity. Existing environment bindings must be checked before requesting new ones. Never place secret values in docs, fixtures, logs, screenshots or source. Runtime variable requirements depend on selected providers; no speculative duplicate secrets were requested.

Assets: private bucket, random immutable object keys, content length limits, actual MIME/checksum validation and malware/scanning policy for uploads. Restrict image decoding and FFmpeg input protocols; use subprocess argument arrays rather than shell commands. Render untrusted inputs in constrained workers with no broad credential access. Review font/image licenses and citation provenance before export.

Data: store provenance, user ownership, model parameters and asset hash. Redact personal content from logs. Define retention, deletion and backup restore tests before pilot data is uploaded. Backups are only useful after a restore exercise.

Observability: structured request/job IDs, latency, failures, queue lag, usage cost and storage growth; no prompt/body logging by default. Alert on repeated authentication errors, stuck jobs and spend anomalies. Repository and dependency scanning supplement, rather than replace, authorization tests.

## Access needed to deploy

Google project ID and region, usable deployment identity with least-privilege roles, approved billing/credit scope, identity provider configuration and an approved generation provider. Enter credentials via secure environment settings, never chat. Exact secret destination bindings are declared once the provider is chosen.

## Research limitations

Official Cloud Run pricing, budgets, Jobs and free-trial documentation requests returned proxy 403 responses. Required domain additions were saved in the configuration draft: `cloud.google.com`, `ai.google.dev`, `www.remotion.dev`, `ffmpeg.org`, `www.postgresql.org`, `valkey.io`. Saving does not itself apply networking changes or publish. Recheck official sources after runtime policy changes; no live price claim is made here.
