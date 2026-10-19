# Application foundation validation

Executed 19 October 2026 in the existing cloud workspace. All results below concern the local first milestone; the complete platform and staging deployment are unfinished.

## Passed

- Frozen dependency installation and repeatable `scripts/setup-application.sh`, including PostgreSQL startup, six tests, production build and private database backup.
- TypeScript checking and optimized Next.js production build.
- Six backend tests: salted password verification; persistent course/owner boundaries; concurrent presentation revision race and immutable history; image owner validation; slide contract validation; provider request/result/error handling; and concurrent generation quotas/idempotency. Some test cases cover multiple related assertions; the runner reports six tests, all passed.
- One Playwright end-to-end scenario against real PostgreSQL and the standalone production server. It exercised signup/sign-in, private course creation, text editing/autosave, numeric object edits, actual canvas dragging, image upload/access, reload persistence, stale-save rejection, cross-origin rejection, history restoration as a new revision, disabled-provider behavior, and a second account's inability to read/update the first account's resources. Final result: one passed, zero failed or skipped.
- A PostgreSQL dump restored with ON_ERROR_STOP in a separate temporary database, and restored course rows were verified before that test database was removed.
- Docker image built from locked source in a separate container build. Runtime image `course-studio:local` was tested with real PostgreSQL: health 200 with database=postgresql, sign-in page 200, unauthenticated private API 401. The temporary validation container was stopped and removed; the development database remains available.
- Standalone output inspection found no `.env.local`, `auth-secret` or `postgres.env` files. Docker context excludes local configuration, data, tests and Git metadata.

## Diagnosed failures during setup

- npm's home cache and Docker buildx's home configuration directory were not writable. Scoped workspace cache/config directories resolved these failures.
- Initial browser checks used a stale save indicator before asynchronous upload finished and an ambiguous status locator after a restore notice appeared. Tests now wait for the image selection state and target the presentation save indicator. The application workflow passed afterward.
- Docker's build network could not resolve the workspace proxy alias. `scripts/build-container.mjs` uses the existing proxy's resolved host mapping, forwards standard proxy arguments and mounts the supplied CA as a build secret. TLS verification remains enabled; CA/proxy configuration is not baked into the runtime image.
- Google authentication failed during initialization: the supplied credential configuration type was not supported by google-auth. No credential values were printed or copied. Resource Manager discovery did not execute, so no accessible project, billing balance or deployment permission was established. The user's link is an organization-level project selector, not a selected project ID.

## Unverified / remaining

- No external inference request: Gemini transport is implemented and tested using controlled responses only. A key, approved model, explicit enablement and spending authorization are still needed.
- No Google Cloud deployment or live Cloud Storage/queue integration. No cloud resources were created and no paid provider was invoked.
- No public-production security audit, email verification, password recovery, multi-user project permissions, migrations across releases, backups to a managed service, or live LMS/media export tests.
- No restoration in a separate newly published cloud task. A local database restore passed; publication and cross-task restoration are separate operations.
- No personal-computer/browser connection is available. Permission in chat alone does not establish a remote desktop or authenticated browser transport.

## Reproduce

From `/workspace/Course-Creation-Ecosystem`, activate `/workspace/tools/rea-toolchain/node_modules/.bin` on PATH. Run `bash scripts/setup-application.sh`, then `npm run test:e2e` with port 3000 free. Build the container with `node scripts/build-container.mjs` in this proxy-based cloud workspace, or ordinary `docker build` in an environment with direct registry access.

Test traces and private database snapshots are ignored. Synthetic pilot accounts created by Playwright are isolated to local development; do not copy the local test database into a production deployment. Application increments are pushed to feat/course-studio-foundation; this is not a production release.

## Editable PowerPoint increment

Implemented native editable text/shapes, slide dimensions/rotation/backgrounds, original embedded PNG/JPEG assets and slide notes using PptxGenJS 4.0.1. Export is authenticated, scopes assets to the course owner, uses the last saved revision, and is disabled in the UI while edits are unsaved.

Validation: nine backend tests passed, including three PowerPoint cases for editable XML/geometry/media/notes, missing-asset failure and layout warnings. Independent python-pptx read-back reopened the exported two-slide demonstration and verified editable text/shapes and images. The extended Playwright workflow passed actual download, MIME/revision checks and cross-account export rejection. Production build and TypeScript passed. Rendered fidelity in Microsoft PowerPoint/LibreOffice is not yet verified. Text wrapping and rotated bounds require visual review; current preflight warnings cover explicit-line height and unrotated bounds only.

Separate reference investigations are retained under docs/references/gamma, elevenlabs and canva. Actual REA browser attempts failed; direct HTTPS checks returned proxy 403 responses. No product editor observations were obtained. This export increment implements the user's independently specified editable-deck requirement; it is not claimed to reproduce verified Gamma/Canva internals or workflows.


## Guided course brief increment

New courses open a five-question brief covering the vision, learning objectives, source notes, design and constraints. Existing courses expose the same dialog through Course brief. Answers persist privately with optimistic revision checks and immutable history. The default audience is Indian AYUSH practitioners, with Indian English and editable PowerPoint as the initial output. Closing an unsaved answer prompts before discarding it; saving temporarily disables editing to prevent input races.

The summary distinguishes captured requirements from pending research, structure, design, quality checks and export. Source notes remain unverified. The optional Gemini adapter receives the saved brief and records its revision; oversized input is rejected before reserving quota or calling the provider. This is requirement capture, not completed autonomous course production.

Validation: 11 backend tests passed, production build and TypeScript passed, and the extended Chromium workflow against PostgreSQL passed. The browser test verifies all five exact answers, reopening, stale-revision rejection, private ownership, editor operations and editable PowerPoint download. No paid provider call was made. Schema additions create brief/history tables and add a generation brief revision without deleting existing courses.

Full reference investigations remain blocked as recorded separately under docs/references. Deployment and rendered PowerPoint fidelity remain unverified.
