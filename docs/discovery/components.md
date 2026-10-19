# Feature comparison and component shortlist

The Canva-style and ElevenLabs-style columns below are user-requested feature categories, not verified reverse-engineering findings. No reference application has been instrumented or tested.

| Area | Reference workflow to investigate | Original MVP | Later work / acceptance risk |
|---|---|---|---|
| Canvas | Select, drag, resize, reorder objects | Text, image, shape objects; numeric position; undo/redo | Multi-selection, grouping, snapping, keyboard accessibility |
| Templates | Apply a theme across slides | Theme tokens and reusable layouts | Imported assets, font availability and licensing |
| Data visuals | Insert tables, charts and diagrams | Editable tables and SVG diagrams | Lossless PowerPoint editing and chart semantics |
| Narration | Script-to-voice, pronunciation, previews | Explicit voice selection, async TTS, downloadable audio | Pronunciation dictionaries, timing and language quality |
| Audio editing | Trim and reorder clips | Non-destructive clip in/out points | Waveforms, crossfades and loudness normalization |
| Video | Synchronize narration and visuals | Scene durations, captions, queued MP4 render | Animation interpolation and rendering determinism |
| Delivery | Export and publish | PPTX, PDF and SCORM pilot acceptance | LMS-specific behavior and accessible outputs |

## Candidate decisions

| Component | Evidence on 19 Oct 2026 | Recommendation / gate |
|---|---|---|
| Next.js 16.4.2 | npm metadata: MIT, Node >=20.9 | Web/API candidate; pin after compatibility spike |
| React 19.3.1 | npm metadata: MIT | UI candidate; verify peer ranges with selected editor |
| Konva 10.9.0 | npm metadata: MIT | Canvas candidate; use React bindings after version compatibility check |
| Fabric 7.4.0 | npm metadata: MIT, Node >=20 | Alternative if text editing/serialization spike outperforms Konva |
| BullMQ 6.3.17 | npm metadata: MIT, Node >=14.17 | Queue candidate; Redis/Valkey compatibility and version tests required |
| Auth.js core 0.41.3 | npm metadata: ISC | Identity candidate; validate supported Next integration and CSRF/session behavior |
| PptxGenJS 4.0.1 | npm metadata: MIT | PPTX candidate; exercise object geometry and fonts in PowerPoint/LibreOffice |
| PostgreSQL | Upstream REL_18_STABLE COPYRIGHT retrieved from GitHub: permissive PostgreSQL license | Proposed relational database; verify selected distribution notices and image digest |
| Valkey | Upstream COPYING retrieved from GitHub: BSD 3-Clause | Candidate queue backend; test BullMQ compatibility at selected versions |
| FFmpeg 7.1.5 installed build | `ffmpeg -L`: GPL v2 or later, configured `--enable-gpl` | Worker executable; assess distribution obligations and codec patents for chosen output regions |
| Remotion 4.0.536 | Tagged upstream LICENSE.md retrieved from GitHub; custom Free/Company terms | Free eligibility includes individuals, for-profit organizations with up to 3 employees, non-profits and non-commercial evaluation. Larger for-profit organizations require a Company License; derivative resale restrictions also apply. Confirm entity and use-case eligibility before adoption |

No editor provides Canva parity out of the box. Keep the platform slide document independent of a canvas library: object IDs, geometry, normalized text/style and asset references should survive a renderer replacement.

## Required spikes

1. Render and edit 25 slides with 20 objects each; measure interaction latency on an agreed pilot device.
2. Reload saved JSON and compare geometry/text ordering; test undo across object creation/deletion.
3. Export text, shapes and images as editable PPTX objects; open in two viewers.
4. Queue one successful and one failed job; restart a worker and prove no duplicate final artifact.
5. Render a 30-second sample with timestamps; compare measured output duration to the timeline.

Sources: npm registry URLs and metadata are retained in `evidence/`. Official pages are linked in source evidence with retrieval outcomes. Fetch success alone does not prove package compatibility or security.
