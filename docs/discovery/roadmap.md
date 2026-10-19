# Prioritized implementation and acceptance

This is the earlier discovery roadmap. The current governing plan is [the execution plan](../execution/ACTION-PLAN.md), which follows REA investigation → implementation → testing → deployment without further phase approvals. The pasted 8–16-week estimate remains a planning hypothesis, not a delivery commitment.

## P0 — Discovery and reproducible foundation

Deliver this pack, verify the supplied REA source and obtain permitted reference targets, recheck blocked official sources, verify licenses at chosen versions, then agree on stack and billing boundaries. Next.js/React/TypeScript foundation must pin packages, supply a lockfile, run frozen installation, build and typecheck, and start against local PostgreSQL. Queue startup must be reproducible. Container-backed services use named volumes and readiness probes; do not rely on processes surviving environment publication.

Gate: clean installation in a new task; database migration applies; database-backed health request succeeds; no secret or unexpected tracked file changes. A formatter alone is not a readiness test.

## P1 — First usable deployed milestone

1. Authentication and tenant membership. Test anonymous rejection, session expiry, viewer mutation denial and cross-tenant object access using two users/tenants.
2. Project/course/module/lesson management. Create, edit, restart services, reload and prove persistence; invalid input cannot partially write state.
3. Presentation v1: add/edit/move/resize text, shape and image objects, save/reload and undo/redo. Keyboard controls and focus states included. Geometry preserved through JSON round-trip.
4. Optimistic autosave and immutable history. Two clients update revision 1: exactly one succeeds; the other receives a recoverable 409. Restoring a version creates a new revision.
5. One real AI text adapter. Explicit generate action, preflight quota, structured output validation, human review and recorded usage/model identity. Missing key is a clear unavailable state, never simulated success.
6. Staging Cloud Run deployment with private durable storage and authentication. A remote authenticated user creates a course, generates one outline, edits a slide and reloads it after deployment restart.

Acceptance evidence: unit/integration tests, Playwright end-to-end run, actual dependency versions, build output, provider request identifier without credentials, and deployed smoke-test result. Local-only success does not establish cloud readiness.

## P2 — Visual production

Reusable themes, templates, tables/charts/diagrams, citations, image adapter, editable PPTX and PDF exports. Test text overflow, missing fonts, invalid assets, image authorization and export fidelity. Open produced PPTX in two independent viewers; compare content/geometry and confirm objects remain editable. PDF page count and text extraction must match the selected presentation. Do not equate a ZIP download with a valid PowerPoint file.

## P3 — Voice/video/assessments

TTS with explicit voice and language, non-destructive audio clips, captions, timeline synchronization, finite queued FFmpeg render, cancellation and LMS exports. Verify playback, output codec and duration using ffprobe. Retry worker after a crash and prove one final artifact. Quiz scoring must run in the exported learner experience. SCORM 1.2 initialize/commit/finish and completion/score behavior must be tested in the selected LMS; no general LMS compatibility claim from manifest inspection alone.

## P4 — Pilot and hardening

One course before expanding the curriculum; confirm actual course count and priorities from supplied documents. Run restoration, failed-job recovery, accessibility, authorization and budget-stop tests. Review license/NOTICE inventories and content ownership. Measure real costs before adding GPU hosting or more providers.

## Initial test inventory

| Test | Expected failure it detects |
|---|---|
| Tenant isolation | Unauthorized course, asset, version or job disclosure |
| Revision race | Lost updates / overwritten history |
| Restart persistence | Reliance on process memory or ephemeral files |
| Provider contract | Malformed output, unsupported task, missing key, unbounded timeout |
| Idempotent submission | Duplicate generation charges and artifacts |
| Worker lease recovery | Permanently stuck jobs and duplicate finalization |
| Spend reservation race | Concurrent requests exceeding app quota |
| Upload validation | Oversized, spoofed or unsafe media |
| Slide export round-trip | Flattened text, lost object geometry, missing assets |
| Render media probe | Corrupt output, wrong duration or missing audio |
| LMS runtime | Broken completion and scoring |

## Scope boundary

REA is a research tool, not the platform or a model. A Canva-like editor and ElevenLabs-like voice workspace are separate engineering workstreams. Do not promise their full capabilities from a first milestone. The user has since instructed us to proceed without further phase approvals. Follow the current execution plan and the $200 budget envelope; missing credentials or inaccessible reference features remain concrete prerequisites rather than assumed access.
