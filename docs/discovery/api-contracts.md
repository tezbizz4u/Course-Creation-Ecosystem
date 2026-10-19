# Proposed API contracts

Version prefix `/api/v1`. All routes except health and identity callbacks require a server-validated session. Never accept caller-supplied tenant identity as authorization. Resolve active tenant from membership. JSON requests use runtime schema validation and size limits; schemas must be implemented before routes are shipped.

| Method / path | Input | Result / critical rules |
|---|---|---|
| GET `/health` | None | 200 only if required dependencies are healthy; no secrets in diagnostics |
| GET/POST `/projects` | Creation: `{title}` | Tenant-scoped list / 201 project |
| GET/POST `/projects/:id/courses` | `{title,audience}` | Membership and project scope enforced |
| POST `/courses/:id/modules` | `{title,position}` | Transactional ordering, 201 |
| POST `/modules/:id/lessons` | `{title,position,content}` | Validate structured content, 201 |
| GET `/lessons/:id/presentation` | None | `{id,revision,document}` with tenant scope |
| PUT `/presentations/:id` | `{expectedRevision,document}` | Atomic compare-and-update; 409 for stale revisions |
| GET `/presentations/:id/versions` | Cursor | Paginated immutable history |
| POST `/assets/uploads` | `{projectId,mimeType,byteSize,sha256}` | Short-lived upload capability after type/quota checks |
| POST `/assets/:id/finalize` | Storage object generation | Verify actual size/type/checksum before use |
| GET `/assets/:id/download` | None | Scoped short-lived URL; no permanent public bucket objects |
| GET `/providers` | None | Available capabilities, availability and approved model IDs; no keys |
| POST `/jobs` | `Idempotency-Key` header; `{projectId,kind,provider,model,input}` | 202 `{id,status}` after quota reservation and outbox transaction |
| GET `/jobs/:id` | None | Status, safe error code, progress and authorized artifact references |
| POST `/jobs/:id/cancel` | None | Cooperative cancellation request; terminal states immutable |

Errors: `{error:{code,message,requestId}}`. Use 400 invalid request, 401 missing session, 403 insufficient role, 404 absent/not-visible resource, 409 revision/idempotency conflict, 413 payload too large, 429 quota, 503 dependency unavailable. Do not include raw SDK exceptions or credentials.

## Slide document v1

```json
{"schemaVersion":1,"width":1920,"height":1080,"theme":{"background":"#ffffff","accent":"#6658e8"},"slides":[{"id":"uuid","durationMs":10000,"objects":[{"id":"uuid","type":"text","x":120,"y":90,"width":1200,"height":160,"rotation":0,"z":0,"text":"Lesson title","style":{"fontFamily":"Inter","fontSize":64,"color":"#202030"}}]}]}
```

Object types initially text, image (assetId), shape; dimensions, string lengths, object counts, font families and URLs are allowlisted/validated. Use integer milliseconds for timelines. SVG inputs are sanitized or rasterized in isolation. Font and image asset provenance is mandatory. Revision history snapshots are independent of any canvas library's private serialization.

## Adapter boundary

```typescript
type Capability = 'text' | 'image' | 'speech' | 'transcription';
interface ProviderAdapter {
  id: string;
  capabilities: readonly Capability[];
  estimate(input: GenerationRequest): Promise<{ microUsd: number }>;
  generate(input: GenerationRequest, signal: AbortSignal): Promise<GenerationResult>;
}
// GenerationRequest: validated task, approved model ID, inputs, limits, request ID.
// GenerationResult: text or staged artifact, provider request ID, usage and provenance.
```

No arbitrary provider endpoint from user input: configure server-side destinations to prevent SSRF. Normalize unsupported capability, authentication, timeout, rate limit, content policy and permanent failure. Do not silently substitute providers or charge a fallback without explicit policy. Persist model version and provider response identifiers without storing keys.
