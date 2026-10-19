# Technical Discovery Pack

Prepared 19 October 2026 for Course Creation Ecosystem. This records the discovery milestone requested in the supplied technical direction. A subsequent local application foundation is documented in [development instructions](../DEVELOPMENT.md); the full platform and cloud deployment remain incomplete.

## Decision

Build a TypeScript modular monolith: Next.js/React web and API, PostgreSQL state, private Cloud Storage assets, a provider adapter boundary, and separate workers for generation and rendering. Use a React/Konva editor candidate for the first proof of concept. Keep REA in the development environment; do not expose it as a production service. Do not enable paid providers or deploy billable resources during discovery.

First implementation milestone: authenticated course projects with durable storage, versioned autosave, one real text-generation adapter, and editable presentation objects. Acceptance requires a deployed authenticated round trip, not a mock screen. Expand voice/video only after that foundation passes.

## Deliverables

- [Environment and REA compatibility](rea-environment.md)
- [Feature comparison, components and licenses](components.md)
- [Architecture and data ownership](architecture.md)
- [PostgreSQL schema](schema.sql)
- [API and job contracts](api-contracts.md)
- [Provider capability matrix](providers.md)
- [Deployment, budget and security](cloud-security.md)
- [Prioritized backlog and acceptance tests](roadmap.md)
- [Source retrieval evidence](evidence/sources.json)
- [Executed validation and reproducible commands](validation.md)

## Evidence labels

**Observed** means a command or source retrieval was performed in this machine. **Proposed** means an engineering recommendation, not an implemented capability. **Unverified** means live evidence or permission is missing. Package license metadata is initial screening; archive-level LICENSE/NOTICE files and transitive dependencies must be reviewed at the exact pinned version before shipping.

## Principles

1. Course, lesson, slide and asset data belong to the platform; providers are replaceable.
2. Human review is required before generated material is published or exported as final content.
3. Evidence from reference applications describes visible behavior, not hidden backend architecture.
4. Use original UI and implementation; do not copy proprietary assets or claim feature parity.
5. Preserve source references, media provenance, generation parameters and model identities.
6. Enforce authorization at data queries and asset access, not only in navigation.
7. Fail closed on missing credentials, unsupported tasks and budget exhaustion.
8. Never treat billing alerts as a guaranteed spending cutoff.

## Outstanding decisions

- REA source is verified at `morluto/rea` commit `a0edd145d31ffeb9f022c25ec9e9131083f563d5`; real reference application targets remain unspecified.
- Google Cloud project/region, verified credit balance and billing permissions: not established.
- Identity provider, allowed pilot users and callback domain: not selected.
- First generation provider and user-approved spending limits: not selected.
- License approval for any Remotion dependency: unresolved; use FFmpeg worker design as fallback.
- Actual editable-canvas/PPTX round-trip and Redis-compatible queue behavior: spike required.

The earlier Python/SQLite prototype was moved outside this repository to `/workspace/scratch/course-prototype-before-technical-direction`. It is not the selected foundation. The selected TypeScript implementation is now in the checkout; the discovery pack itself remains a design/evidence record.
