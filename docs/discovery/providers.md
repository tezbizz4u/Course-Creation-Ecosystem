# AI provider and model capability matrix

This is an evaluation shortlist, not a tested integration. No generation request was sent and no quality, latency or cost result is claimed. No provider has been authorized for spending.

| Candidate | Tasks to evaluate | Deployment / credential | Acceptance gate |
|---|---|---|---|
| Gemini API | Course outline, lesson text, assessments; image capabilities vary by exact model | Hosted HTTPS, provider credential | Approved model/version, structured JSON conformance, citations checked, real usage and price recorded |
| Vertex AI | Google-hosted generative models; feature/region availability varies | Google Cloud project and service identity | Verify billing/credit eligibility for the chosen model; do not assume trial credits apply |
| OpenAI-compatible adapter | Text; image/audio depend on endpoint and model | Explicit allowlisted endpoint and credential | Confirm endpoint protocol and task support; compatibility label alone is insufficient |
| Self-hosted text model | Outline and revision tasks | Separate compute/model runtime | Exact weights license, memory/latency measurements, artifact checksums and quality review |
| Self-hosted image model | Illustrations and backgrounds | GPU worker likely required | Exact model license, provenance, safety controls, VRAM and cost benchmark |
| Hosted TTS | Narration, language/voice selection | Approved external service and key | Voice consent/licensing, timestamps, downloadable output, pronunciation review |
| Self-hosted TTS | Narration | Isolated worker and exact model assets | License, supported languages, quality and runtime benchmark |
| Local template | Deterministic editable course structure | No provider / zero inference calls | Label as template; never call it AI-generated content |

## Selection protocol

Use one representative lesson with a teacher-reviewed reference, not all courses. Test instructional correctness, unsupported claims, required structure, output language, prompt injection resistance, content policy failure and rate-limit recovery. Store seed/settings where available. Estimate cost before submission and record actual usage afterward. A benchmark requires real provider access; mock responses validate adapter plumbing only.

First implementation: one text provider through a typed adapter, plus a deterministic fake exclusively for tests. Keep model IDs in server-side configuration rather than hardcoding a model into product data. Image and speech adapters come after course/version/asset foundations. Self-hosted GPU inference is deferred under the $200 ceiling until a measured benchmark demonstrates value.

Source: https://ai.google.dev/gemini-api/docs/text-generation — blocked by current network policy during discovery. Provider model versions, current pricing and free-tier terms remain unverified.
