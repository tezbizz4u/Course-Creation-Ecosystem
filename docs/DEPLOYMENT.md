# Staging deployment preparation

The Dockerfile was built and its local runtime smoke tests passed. It builds a locked Next.js standalone server with an unprivileged runtime user. `.dockerignore` and tracing exclusions omit local credentials, databases and test artifacts. Containers listen on PORT (8080 by default) on all interfaces; the local launcher binds loopback.

## Prerequisites still required

- User-selected Google Cloud project/region, verified billing/credit eligibility and authorization for billable resource creation.
- Authorized deployment identity. GOOGLE_APPLICATION_CREDENTIALS is present by name in this environment, but its validity/roles were not established; gcloud is not installed.
- External PostgreSQL, TLS verification for any networked database, a stable AUTH_SECRET and an AUTH_URL matching the final HTTPS service domain.
- An identity/registration policy for the pilot. Default registration is closed when ALLOW_REGISTRATION is absent. Password reset/email verification and a public-production security review remain necessary.
- Approved Gemini model/key and spending limits only if generation should be enabled.

## Deployment contract

1. Build the image with `docker build -t course-studio:local .` and test with a real PostgreSQL connection. In this proxy-based cloud workspace use `node scripts/build-container.mjs`, which supplies proxy host mappings and the existing CA via an ephemeral build secret.
2. Push an immutable image to the chosen Artifact Registry repository after that repository/project is supplied.
3. Deploy to Cloud Run with minimum instances zero, maximum instances one for the pilot, explicit CPU/memory, request timeout >=60 seconds, and a least-privilege service account.
4. Configure DATABASE_URL, AUTH_SECRET and AUTH_URL through Secret Manager/environment settings. Do not pass credentials as literal command-line values or commit .env files. A local Docker env-file is used only for validation.
5. Disable LOCAL_DATABASE on Cloud Run: the application refuses its embedded local store when K_SERVICE is present. Never depend on Cloud Run's writable filesystem for persistence.
6. Confirm database connectivity, authentication, private asset access, course save/reload across deployment restart and session origin behavior before declaring staging ready.
7. Keep AI_ENABLED absent until provider access and cost approval are confirmed; application health does not depend on a paid provider.

Schema creation is currently idempotent initialization on first database use. A dedicated migration identity/versioned migration job is required before multiple release versions or a least-privilege production runtime are introduced. The current schema is in lib/db.ts; discovery/schema.sql is the broader proposed domain model, not the deployed migration.

The bounded text-generation request currently runs synchronously with a 30-second provider timeout. Long-running image/voice/video/render work is not implemented and must use separate finite workers/queues. Assets use PostgreSQL for this milestone; private Cloud Storage and signed upload URLs are later work.

## Costs

No current Cloud price estimate or verified $200 credit balance is available. Before provisioning, verify regional costs and budget alerts. Alerts are not hard caps. The application request limit does not cap database, hosting, storage or other cloud charges.
