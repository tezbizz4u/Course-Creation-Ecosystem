# Course Creation Ecosystem — standing project instructions

## Governing goal

Build one unified AI-powered course-creation platform. A simple conversational Q&A should translate the user's requirements into researched, structured, designed and validated learning experiences, with natural-language revisions and selected exports. The platform adapts to the creative brief; optional templates and editors must not restrict the long-term product vision.

The five required modules are:

1. **Course Studio:** curriculum, objectives, modules/lessons, slide content, assessments, references and versions.
2. **Visual Design Studio:** editable presentations, layouts, charts, tables, diagrams, icons, images and reusable designs.
3. **AI Visual Factory:** course-specific illustrations, infographics, backgrounds, diagrams and media assets matched to the exact learning objective.
4. **Voice & Video Studio:** narration, authorized voice cloning, pronunciation, audio editing, subtitles, synchronization and lesson rendering.
5. **AI Intelligence Layer:** one gateway coordinating self-hosted language models and specialist models/tools for research, writing, images, speech, coding and quality checks.

**All five modules share course data, a private media library, accounts, provenance, versions and the production workflow.** They are capabilities of one product, not disconnected apps the user must manually operate. Keep this end goal visible while delivering small working increments.

## Confirmed initial defaults

- Audience: Indian AYUSH practitioners only.
- Courses: CDEM (Certificate of Diabetes Education and Management), MASLD, PCOS, Obesity and Hypertension.
- Primary language: Indian English. Hindi/bilingual support and more Indian languages follow.
- First output priority: highest-quality genuinely editable presentations, including portable PPTX; media/interactive outputs extend the same foundation.
- Use CDEM for the first bounded lesson/course pilot. Preserve the user's existing Cloud Shell CDEM data.
- The initial $200 cloud-credit envelope remains; do not assume a single language model or an always-on GPU can provide every capability within it. Verify licenses, resources, credit eligibility and actual usage.

## Required engineering workflow

**REA investigation → original implementation → meaningful testing → deployment.**

Reference order is explicit: **Gamma AI (full scope), ElevenLabs (full scope), Canva (full scope)**. Keep each investigation separate in `docs/references/gamma/`, `docs/references/elevenlabs/` and `docs/references/canva/`, including requests/results, findings, coverage and limitations. Full scope is not a completion claim: mark observed, partial, blocked and untested features honestly. Tool installation, fixture analysis and public marketing descriptions do not establish editor behavior or successful full reverse engineering.

Use REA for relevant artifact/runtime evidence; ordinary source analysis and coding use normal repository tools. Create original implementations from verified behavior and the user's explicit requirements. Explain independent design choices when reference evidence is blocked. Never fabricate results or hide inaccessible features behind broad claims of completion.

Proceed without repeated phase-approval questions. Ask only for access, credentials or information that genuinely blocks further useful work, and continue independent work meanwhile. Credentials belong in secure settings, not chat/source/logs. Respect real access restrictions and preserve TLS/artifact verification.

A working editor, exported file or preview is an increment, not the completed ecosystem. Do not claim live model generation, renderer fidelity, permanent deployment or new-task restoration without actual verification.

## Sources of truth

- `docs/execution/PRODUCT-VISION.md` — conversational, extensible product specification.
- `docs/execution/COURSE-DEFAULTS.md` — portfolio, audience, language and presentation quality requirements.
- `docs/execution/ACTION-PLAN.md` — execution sequence and completion criteria.
- `docs/references/README.md` — separate reference investigations and current evidence status.
- `docs/DEVELOPMENT.md` and `docs/IMPLEMENTATION-VALIDATION.md` — actual implemented behavior, commands, checks and limitations.

Use existing isolated cloud checkouts; do not create worktrees unless explicitly requested. Preserve existing user changes and data. Keep tests tied to meaningful failure modes and report unrun checks separately.
