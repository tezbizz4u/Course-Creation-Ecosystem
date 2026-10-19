# Working first application milestone

The repository now includes a Next.js/React/TypeScript course studio. The discovery pack remains the design record; this document describes implemented behavior.

## Available now

- Auth.js credentials sign-in, salted scrypt password storage, eight-hour JWT sessions and a bounded sign-in attempt window.
- Private projects/courses, each with an editable presentation. Each new course currently creates its own project; project reuse, memberships and project administration are future work.
- React/Konva text, shape and image objects: move, resize, rotate, reorder, numeric properties, colors, undo/redo, slide creation/removal.
- Debounced autosave, optimistic revisions, immutable history and restoring an older version as a new revision. Stale saves return 409 and preserve the local draft for download.
- Private PNG/JPEG assets up to 1 MB with source/license declarations, hashes and owner checks. Assets are stored in PostgreSQL in this milestone; Cloud Storage migration is pending.
- A real Gemini HTTP adapter for structured slide outlines, timeout/error handling, bounded output and explicit request approval. Provider credentials, model and enablement are required; no live inference was performed.
- Editable PowerPoint export with native text/shapes, preserved slide geometry, original embedded images and slide notes. Export uses the last saved revision, checks image ownership, and reports basic layout warnings. JSON draft download remains available and references account image IDs.

This is an original local foundation, not Canva/ElevenLabs parity or the completed production platform. Narration, video, LMS exports, full modules/lessons, background queues, public sharing, email verification, password reset, team roles and Cloud Storage are not implemented. Auth.js is pinned to a beta release; review its stability/security before public launch. Registration is explicitly enabled for local development and disabled by default when the flag is absent.

## Start in this cloud workspace

Use the existing isolated checkouts; do not create worktrees.

```sh
export PATH="/workspace/tools/rea-toolchain/node_modules/.bin:$PATH"
export npm_config_cache=/workspace/.npm-cache
cd /workspace/Course-Creation-Ecosystem
bash scripts/start-postgres.sh
npm ci --no-audit --no-fund
npm run build
npm start
```

`start-postgres.sh` starts only the named, labeled local container, with port 54329 bound to loopback and a pinned PostgreSQL image digest. It creates local credentials once in an ignored file and appends a local DATABASE_URL only if one is absent. It does not print secrets or replace an existing DATABASE_URL. Do not use these local credentials for production. The server listens on port 3000 by default; internal `/api/health` should report `postgresql`.

For active UI development, use `npm run dev` instead of the production start command. Do not run both against one embedded PGlite directory. External PostgreSQL supports separate web processes. The standalone launcher loads `.env.local`, retains the auth secret under the root `.local` directory, copies static assets and forwards shutdown signals.

Create an account through the sign-in screen; no shared default password is provided. ALLOW_REGISTRATION=1 is present only in ignored local configuration. AUTH_URL must match the browser origin, including port. Production requires a stable AUTH_SECRET supplied securely.

## Tests

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The unit/integration suite uses an isolated temporary PostgreSQL WASM database. Playwright uses system Chromium and starts the production server against the configured database. It creates unique pilot accounts with synthetic data. Browser checks cover signup/sign-in, persistent course creation, real canvas drag, image upload/access, history restoration, stale-save rejection, origin rejection, disabled generation and cross-account isolation. Browser tests need port 3000 free.

## Persistence and snapshots

Docker process state and named volumes must not be assumed to survive a new task. Run `bash scripts/backup-postgres.sh` before environment publication to retain a private SQL snapshot under `.local/backups`. Startup restores it only into a database without the application users table, with a single transaction and ON_ERROR_STOP. It never overwrites an existing populated database. Keep the `.local` auth secret and database credentials with that snapshot. A local restore exercise is recorded in implementation validation; fresh-task restoration is not yet verified.

## Provider configuration

Set GEMINI_API_KEY securely, AI_MODEL to an approved model ID, and AI_ENABLED=1 only after spending is authorized. The key is used only for HTTPS requests to `generativelanguage.googleapis.com`; no custom endpoint is accepted. A provider call must be explicitly approved in the UI. AI_MAX_REQUESTS_PER_DAY defaults to five requests per account; AI_MAX_GLOBAL_REQUESTS_PER_DAY defaults to ten across the installation. A database lock serializes quota reservations. Both limits count failures conservatively. Recent outcomes and successful drafts are available from the AI dialog. Bounded request counts and output tokens are not a dollar spending guarantee. No image, voice or video provider is connected.

A generation is proposed content. The user reviews it before adding slides, and must check facts, citations and text overflow. The adapter records model, status and returned token usage; exact price calculation awaits verified model pricing. A timeout can still incur a provider charge, and no automatic retry is made.

## Production deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). No paid resources have been created and no live AI request has been sent.

## Google Cloud Shell preview

After cloning and building in Cloud Shell, start the server with:

```sh
export STUDIO_BIND_ADDRESS=0.0.0.0
export PORT=3000
export AUTH_URL="https://3000-${WEB_HOST}"
npm start
```

Use Web Preview on port 3000. Leave the process running. If WEB_HOST is unset, copy the actual preview origin into AUTH_URL and restart. The default launcher continues to bind loopback unless STUDIO_BIND_ADDRESS is explicitly supplied. Set AUTH_URL to the browser origin so sign-in and mutation origin checks use the same address.

## PowerPoint export validation

The exporter has structural tests for native text/shapes, geometry, slide count, notes and exact embedded image bytes, plus missing-image failure and basic layout warnings. Independent python-pptx read-back also passed. These are not a visual fidelity guarantee in Microsoft PowerPoint or LibreOffice; rendered cross-application comparison remains unverified. Warnings cover explicit line-height overflow and objects outside slide bounds, not full text wrapping or rotated bounds. Export is disabled while edits are unsaved or saving.
