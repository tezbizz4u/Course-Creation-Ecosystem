# Environment and REA compatibility

## Observed

- Selected repository: `tezbizz4u/Course-Creation-Ecosystem`, `main` at `abee9e4279bf6d97505ace81f128699c34a43922`; initial tracked content was a README title only.
- Other remote branches: `Docs` contains a course DOCX ZIP; `Prompts` contains the course-platform discovery brief. Neither is an REA checkout.
- Node.js 24.19.0, npm 11.9.0, Python 3.12.14 and FFmpeg 7.1.5 are installed.
- Docker daemon responds with version 28.4.0. No local images were listed.
- PostgreSQL client/server, Redis server and gcloud CLI were not found on PATH. This does not establish those services cannot be installed.
- REA source was subsequently cloned from `https://github.com/morluto/rea` at `a0edd145d31ffeb9f022c25ec9e9131083f563d5` (package 6.7.0). Its authored code is MIT; third-party material has separate notices.
- The repository pins Node 24.18.0 and npm 11.16.0. Both were installed under `/workspace/tools/rea-toolchain`; source dependencies were installed with `npm ci` and `HUSKY=0`, then `npm run build:cached` passed (three tasks).
- The only listed cloud skill is environment onboarding. No callable REA tools were found in this chat’s tool inventory. A direct production-stdio MCP test nevertheless passed: initialization, 207 tools, 6 prompts, server identity and target-free `binary_session` request. This does not connect those tools to this chat.
- Static JavaScript analysis of REA’s readiness fixture passed, with evidence `ev_b2d4942c26b12666d83bf37ff43d0b437a8bcd349cb97adb6a35a17e464f5074`. The analyzer read the fixture without executing it.
- A procps-compatible `ps` and `/usr/bin/chromium` are installed; browser observation has not been tested. Native decompilers were not installed.
- `GOOGLE_APPLICATION_CREDENTIALS` is present by variable name. Its validity, project, role bindings, billing access and production suitability have not been tested. No credential values were read or copied.
- GitHub reads succeed through existing authentication. A separate GitHub token is not needed for repository reads.

## What is not verified

The source CLI and production MCP transport are tested, but live agent registration/connection is not established. `doctor --client codex --json` failed while probing Java for Ghidra: REA could not read `/proc/<pid>/environ` to confirm process ownership during cleanup (EACCES). Both reported PIDs were absent in a later process check. No process was killed by guessing ownership; no sandbox was disabled. This limits the broad doctor report, while the separate static and MCP tests passed.

Google Cloud authentication/resource creation, reference website observations, native decompilation and Electron runtime capture remain untested. Registration configuration was not modified. REA source and lockfile remain unchanged.

## Remaining REA integration procedure

1. Source documentation, AGENTS.md, installation guide and relevant connection guidance were read at the pinned commit. Re-read relevant target-specific guidance when a real investigation is selected.
2. Inspect install scripts, tool capabilities, local ports, dependency trust and target-platform requirements before executing anything.
3. Keep its development tooling separate from production dependencies. Use this existing isolated cloud workspace; do not create a Git worktree unless explicitly requested.
4. Configure only supported agent integrations. Inspect required credential names/status before requesting bindings.
5. Pick an authorized reference feature: for example select, move and resize a text object. Capture evidence with target URL/version/date, action sequence, observations and limitations.
6. Convert observations to an original feature specification and acceptance test. Do not infer hidden algorithms from UI appearance.
7. Record actual successful tool calls and failures. Browser observation, Electron analysis and native binary analysis must be validated separately; a pass for one is not a pass for all.

## Development topology

Web/API and workers run as separate processes. PostgreSQL and a Redis-compatible queue run locally using pinned containers once selected. Only loopback ports are exposed in development by default. Container digests, lockfile and toolchain pins are recorded with the eventual implementation. No REA/public debugger endpoint belongs in the Cloud Run deployment.
