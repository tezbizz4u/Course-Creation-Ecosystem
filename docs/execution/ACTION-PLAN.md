# Course Creation Ecosystem — execution plan

Updated 19 October 2026. This is the current execution plan and supersedes the earlier discovery-only approval gate. The user has authorized proceeding without further phase approvals. The order is **REA investigation → original implementation → meaningful testing → deployment**.

## Governing product specification

Read [PRODUCT-VISION.md](PRODUCT-VISION.md). The conversational interface and adaptive production orchestrator are the product core. Studios are supporting capabilities, not separate mandatory user workflows. The pipeline below is the first vertical slice, not a restriction on future formats or creative requests.

## Outcome and scope

One platform contains Course Studio, Visual Design Studio, AI Visual Factory, Voice & Video Studio, and a shared AI Intelligence Layer. They share course context, accounts, assets, provenance and versions. The pilot is one complete CDEM lesson for AYUSH practitioners, followed by one complete course, then the remaining four courses. Do not infer the five-course inventory from the names/count of files in the reference ZIP; inspect its contents before mapping curriculum.

The pilot workflow is: source material → learning objectives → lesson outline/content → editable slides → objective-specific visuals → narration → captions/timeline → rendered video → reviewed deck and lesson package.

## Current baseline

Implemented: private accounts and courses/projects, editable text/shape/image slides, private image uploads, optimistic autosave, immutable revisions/history and an optional Gemini text adapter. Six backend tests, a browser workflow against PostgreSQL, backup restoration and a container smoke test passed in the development environment. The user has successfully edited CDEM in a Cloud Shell development preview.

Not completed: actual Canva/ElevenLabs REA investigation, full modules/lessons, specialist model hosting, real inference validation, voice/video tools, portable deck/LMS exports, team management, permanent deployment. REA's fixture/transport checks are tool readiness evidence only.

Existing work stays intact. Preserve the user's Cloud Shell CDEM data before changing storage or deploying. The preview's PostgreSQL WASM files are not a production database.

## Working rules

- No repeated approval or stage-signoff questions. Make ordinary implementation decisions and proceed through the technical completion criteria below.
- Ask only for missing access, credentials, reference materials or decisions that genuinely prevent further useful work. Never request secret values in chat. Continue independent tasks while an external prerequisite is missing.
- Research named public reference workflows first; authenticated or inaccessible features remain explicitly unverified until a supported access path exists. No access-control bypasses or copying proprietary source/assets.
- Use existing isolated checkouts, not additional worktrees. Preserve current user data and repository changes.
- REA is for artifact/runtime evidence. Use ordinary repository tools for our own source architecture, coding and testing.
- Each finding has target/version/date, steps, Evidence IDs or artifact paths, observations, inference labels, coverage and remaining unknowns. Unsupported assumptions do not become implementation requirements without being labeled design choices.
- Tests and budget checks are automatic completion criteria, not requests for user approval. A failure returns work to diagnosis and correction.

## Phase 1 — REA reference investigation

### Target A: Canva (`https://www.canva.com/`)

Investigate presentation creation and templates; text/shape/image insertion; selection, resize, rotation and layer order; theme changes; tables/charts/diagrams; page duplication/reordering; save/version behavior; and available deck/PDF export workflows. Focus on workflows needed for course creation rather than every Canva product.

### Target B: ElevenLabs (`https://elevenlabs.io/` and the user's `elevenlabs.com` reference)

Verify the canonical target before observations. Investigate script entry, language/voice selection, pronunciation, generation/preview, clip editing, project organization, captions/alignment, download and any authorized voice-cloning workflow. Do not upload the user's voice or course material to a third party without an existing authorized route.

### Method and deliverables

1. Read REA browser/runtime guidance and actual CLI schemas. Use the verified pinned CLI when tools are not connected to the chat; do not repeatedly reinstall or run broad provider diagnostics.
2. Attempt a focused public-page/browser investigation of each named target. Preserve failures such as network denial, bot challenge or missing authentication as evidence; a marketing page is not proof of editor behavior.
3. Create an investigation ledger and capture allowed UI/runtime evidence. Inspect relevant served artifacts through supported REA workflows when available.
4. Produce `REFERENCE-EVIDENCE.md`, `FEATURE-GAPS.md`, and feature specifications with reproducible acceptance scenarios.
5. For missing research coverage, proceed with independent verified features. Mark an original design as an original design rather than pretending it reproduces inaccessible behavior.

Completion: each prioritized workflow is observed with evidence, partially observed, or concretely blocked. There must be an explicit record for every workflow, not a claim that both entire products were reverse engineered.

## Phase 2 — Conversational production orchestrator and shared foundation

Implement free-form brief intake, focused Q&A, editable assumptions, a capability registry, a dependency-based production plan, progress/artifact views and conversational revisions with targeted regeneration. Preserve open requirements when a capability is unavailable; do not silently substitute outputs.

Implement proper course → module → lesson → objective structure; source references and assessments; shared private assets with ownership, license/source metadata and versions. Retain existing courses through versioned migrations.

Build provider-independent task contracts for text, image, speech, transcription and rendering. Add asynchronous jobs, idempotency, leases, bounded retries, cancellation, usage records and quota reservations before expensive generation. Separate workers from web requests. Define unavailable-model states rather than substituting fake output.

Evaluate self-hosted language and specialist models against exact license/weight terms, supported languages, hardware, memory, latency and output quality. A language model coordinates tasks; image, speech and video need appropriate engines. Compare a CPU development route and on-demand cloud compute using measurements before choosing deployment sizes. No permanently running GPU during the pilot.

Completion: a plain-language request becomes a versioned brief and executable production graph; a conversational revision updates the correct dependent artifacts; real course hierarchy persists; unauthorized access fails; stale updates cannot overwrite work; one real generation task completes and records provenance/usage; duplicate submission does not run it twice. Fake providers remain confined to tests.

## Phase 3 — Visual Design Studio

Build the prioritized Canva-derived workflows in small complete slices: reusable slide layouts/themes; selection/grouping/layers and keyboard editing; editable tables/charts/diagrams; image cropping/placement; objective-linked asset search; and presentation generation from structured lesson content.

Add portable editable PPTX and PDF exports. Keep a documented slide schema independent of a canvas library. Preserve fonts, geometry, citations and asset provenance. Adopt rendering/editor dependencies only after license and compatibility checks.

Completion: a CDEM lesson deck can be created, edited, reloaded and exported. PowerPoint objects remain editable in independent viewers. PDF page count/text and visual comparisons pass. Large text, missing fonts and asset failures produce actionable feedback.

## Phase 4 — AI Visual Factory

Implement a visual brief derived from the lesson objective, audience, instructional purpose, source references, required labels and style. Support draft/revise/regenerate, consistent style presets, private asset storage and provenance. Prefer editable SVG/chart/table output where appropriate; use image models for suitable illustrations rather than flattening all learning materials into pictures.

Completion: generate and revise a real lesson-specific visual with the selected engine, record its actual model/license/parameters, insert it into a slide, and retain its relationship to the learning objective. Check label legibility, content accuracy and consistency. Medical teaching material needs subject-matter review before release.

## Phase 5 — Voice & Video Studio

Implement the prioritized ElevenLabs-derived workflows: narration scripts, voice/language settings, pronunciation controls, preview, audio clips, non-destructive trimming and slide synchronization. Voice cloning is limited to authorized voices and supported model licenses.

Add caption timing/editing, scene durations and finite FFmpeg render jobs. Review Remotion's exact license eligibility before adopting it; do not make the media pipeline depend on unverified licensing assumptions.

Completion: a short CDEM lesson produces downloadable narration and a playable synchronized video with captions. ffprobe verifies duration/streams; listening review checks pronunciation; playback checks timing; cancelled/retried jobs cannot create duplicate final artifacts.

## Phase 6 — Integrated quality and exports

Run one complete lesson workflow, then an entire CDEM course. Add question/answer editing and scoring plus a lesson delivery package. Validate SCORM in the selected LMS before claiming LMS compatibility; keep PPTX/PDF/video downloads independently usable.

Required checks: clean installation; migrations with existing CDEM data; ownership/role isolation; autosave conflict recovery; backup/restore; queue recovery; model failures/timeouts; concurrent quota reservations; media decoding; portable asset exports; reference-feature acceptance tests; accessibility and keyboard navigation; measured resource/cost use. Report failed, skipped and unrun tests separately.

Completion: one coherent lesson package has usable content, editable visuals, narration/video, assessments and traceable sources. Technical success does not substitute for content review.

## Phase 7 — Permanent deployment and five-course rollout

Prepare an immutable release, versioned migrations, durable PostgreSQL, private object storage, stable authentication, secret bindings, separate workers, logs, backups and a rollback/restore runbook. Configure public registration deliberately; keep the pilot private to existing/invited users initially.

Deploy web/API to project `course-creation-ecosystem`, region `asia-south1` (Mumbai). Choose database, queue and worker hosting after resource/price measurements. Migrate the user's Cloud Shell data through a private, verified backup; never upload secrets or a local data directory as container build context. Validate persistence across restart/redeployment, private media access and the complete lesson workflow on the real service.

Roll out to all five courses only after the first course's acceptance checks pass. Expand generation capacity from measured throughput and cost, not speculative always-on resources.

## $200 operating envelope

Preserve the original allocations: web/API $25; database/storage $25; AI experiments $70; rendering $45; tests $20; emergency reserve $15. These are internal limits, not vendor price quotes or evidence that every service is covered by trial credits.

Verify available credit, expiry and service/model eligibility before cloud spending. Record estimates before jobs and reconcile actual usage afterward. Use low concurrency, finite job timeouts, web minimum instances zero where feasible, maximum instance limits and on-demand model workers. No spend beyond the $200 envelope without a new instruction from the user.

Use billing alerts plus application quotas and an operator shutdown runbook. Alerts can be delayed and do not impose a hard financial cap. Continuously billed database/storage resources need explicit tracking even when the web service scales to zero. If reliable spend visibility or remaining credit cannot be established, continue local research/build/testing and report the deployment blocker rather than guessing.

## Immediate next actions

1. Create the reference-workflow ledger for Canva and ElevenLabs and attempt focused REA browser investigations.
2. Record verified observations, access limitations and the gap against the existing studio.
3. Inspect course reference documents and select a bounded CDEM pilot lesson without modifying originals.
4. Implement the highest-priority verified gaps through the shared course/AI foundation, then visuals and media.
5. Demonstrate the resulting workflows with real screenshots/output artifacts and test evidence, then deploy the tested release within the budget/access constraints above.

Progress reports will describe evidence acquired, working behavior, tests completed, measured costs and concrete blockers. They will not describe planned applications as built or a development preview as permanent deployment.
