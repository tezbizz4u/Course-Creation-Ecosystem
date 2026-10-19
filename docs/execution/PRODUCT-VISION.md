# Course Creation Ecosystem — governing product vision

## Fundamental principle

**The user defines the dream. The platform makes it happen.**

The product is one conversational production environment that transforms an open-ended creative brief into a learning experience. It is not a collection of disconnected editors or a wizard limited to slide templates. The user describes the desired audience, outcomes, appearance, experience and delivery; the platform researches, plans, produces, checks and exports the result.

This specification refines the execution plan. Existing Forma screens are supporting editing capabilities, not the completed user experience. The required engineering order remains REA investigation → original implementation → testing → deployment, without repeated phase approvals.

## Experience

1. Accept a free-form description plus optional files, examples and sources. Ask only questions that materially affect the result; reuse existing answers and make reasonable defaults visible and editable.
2. Build a living creative brief: audience and prerequisites; objectives; subject/source boundaries; language; accessibility; tone and style; desired interaction; delivery conditions; format/resolution; budget and constraints. These are extensible properties, not an exhaustive menu of permitted creations.
3. Produce an inspectable learning and production plan. Connect each asset/activity to a learning purpose, source evidence, dependencies, estimated resources and completion criteria.
4. Execute the plan through specialist agents and modular tools. Show actual progress, partial outputs, cost/usage and actionable failures. Do not label planned or mocked work complete.
5. Accept conversational revisions at any level: change an illustration, pronunciation, explanation, activity, audience, style, sequence or whole format. Preview the impact and update dependent outputs while preserving unaffected work and earlier versions.
6. Deliver the selected output plus editable source assets and provenance where supported. Reopen, reuse, repurpose and export to other destinations without starting over.

The default interface is conversation, project progress and the evolving learning experience. Design, voice, timeline and course editors are optional detailed controls within that same project.

## Production capabilities

- Reliable-source research, evidence management and learning strategy.
- Curriculum, modules, lessons, objectives, prerequisites and assessments.
- Audience-specific explanations, examples, case studies, assignments and exercises.
- Presentations, documents, diagrams, charts, tables, infographics and illustrations.
- Narration, voiceovers, captions, B-roll, demonstrations and synchronized video.
- Animations, interactive lessons, simulations and new compositions supported by available tools.
- Accuracy, consistency, instructional alignment, accessibility and media-quality checks.
- Editable, reusable and interoperable exports, including presentation/document, media, web and LMS delivery as adapters become available.

These describe the product target, not a claim that all capabilities exist today. A single language model cannot provide every media capability; the intelligence layer coordinates appropriate specialist models and engines.

## Extensibility and truthful capability handling

Templates are optional accelerators. Users may describe outcomes beyond current templates, workflows and exporters. Keep the creative brief, course graph, asset representations, production graph and tool contracts separate from any one model, editor or output format.

Use a capability registry. Each adapter declares accepted inputs, produced artifacts, languages/modalities, supported limits, licenses, credentials, runtime/hardware, quality checks and cost estimation. The orchestrator composes a dependency graph from available capabilities instead of selecting a fixed pipeline solely from an output dropdown.

If a request requires an unavailable capability, identify it precisely. Proceed with independent supported work, retain the unresolved requirement, and evaluate a compatible tool/integration or propose an explicit alternative. Never silently downgrade an interactive simulation into a static image, fabricate research citations, or promise unlimited formats/resolutions. Adding an integration still requires compatibility, license, resource and acceptance testing.

## Specialist responsibilities

| Agent role | Responsibility | Required result |
|---|---|---|
| Brief interpreter | Understand intent and necessary follow-up questions | Versioned brief, assumptions, constraints and success criteria |
| Researcher | Gather and reconcile sources | Source-linked findings, dates, limitations and unresolved claims |
| Instructional designer | Sequence learning and practice | Objectives, course structure and assessment alignment |
| Content producer | Draft explanations and activities | Structured lesson content with source links and audience fit |
| Visual producer | Plan and create suitable visuals | Editable designs/assets, style tokens and provenance |
| Audio/video producer | Narration, timing, captions and media assembly | Source scripts, audio/timeline/caption artifacts and rendered media |
| Quality reviewer | Assess content, learning alignment and technical quality | Findings with severity, evidence and correction tasks |
| Export/publishing coordinator | Package selected outputs | Validated deliverables, editable sources and delivery metadata |

These are logical roles with explicit contracts. They need not be separate services or simultaneous model calls. Schedule according to dependencies and available budget. Human review remains available; the user has not requested a mandatory approval at every stage.

## Shared project model

The project holds a versioned creative brief; sources and claims; curriculum/objective graph; activity and assessment definitions; reusable asset library with rights/provenance; style/language/pronunciation preferences; narration/timeline/caption data; production jobs; artifact dependencies; validation findings; and export profiles.

Every job records actual state, adapter/model identity, inputs, output artifacts, usage and retry/cancellation history. Content and asset dependencies enable targeted regeneration. An export renders the project's structured representations; the exported file is not the sole source of truth.

## Quality standard

Quality checks must be meaningful for the requested experience: source support and unresolved claims; objective/content/assessment alignment; language and cross-lesson consistency; font/text/layout integrity; audio intelligibility and pronunciation; caption accuracy/timing; video decoding and synchronization; keyboard/accessibility behavior; privacy and authorization; and file/LMS compatibility.

Automatic checks do not certify all factual or pedagogical claims. Surface uncertainty and route consequential subject-matter questions for expert review. A test result must identify what ran, what passed/failed and what remains unverified.

## First complete demonstration

Use one CDEM lesson as a bounded vertical slice. From a conversational brief, produce an objective-linked plan, source-grounded lesson, editable deck and suitable diagram, narration, synchronized captioned video and a knowledge check. Accept a natural-language revision, regenerate affected artifacts, and export the validated deliverables. The architecture must preserve the ability to produce documents or interactive lessons instead of requiring every future project to use this sequence.

Research the relevant Canva and ElevenLabs workflows through REA before implementing their comparable production capabilities. Use additional reference targets only where they answer a concrete missing workflow question; record observed evidence separately from our original design decisions.

## Operational boundaries

The five-course goal and $200 cloud-credit envelope remain. Measure local/CPU and on-demand specialist workloads before selecting cloud sizes; bound concurrency, retries and job duration. Retain existing CDEM work through tested migration/backup procedures. Keep credentials out of chat and source. Missing access can block a particular operation, but must not halt useful independent work or trigger repeated approval requests.
