# Executed validation

19 October 2026. These results cover discovery tooling and schema design, not an implemented application.

## Passed

- GitHub authenticated read, clone and pinned source inspection for `morluto/rea`.
- REA exact toolchain: Node 24.18.0, npm 11.16.0, locked `npm ci`, `npm run build:cached` (three tasks, including TypeScript compilation and runtime bundling).
- REA production MCP stdio initialization, catalog identity, 207 tools/6 prompts and a real target-free `binary_session` request.
- REA static JavaScript readiness fixture analysis: fixture identified, nonempty graph, expected import present, zero integrity contradictions. No target execution or native engine involved.
- Seventeen discovery checks using PGlite 0.5.10 (PostgreSQL WASM): schema execution, 12 expected tables, course persistence in the test database, rejected foreign-tenant project relation, rejected empty title, rejected duplicate job idempotency key, rejected invalid job state, and ten documentation links in the final run. The initial run contained nine links (16 total checks).

PGlite validates PostgreSQL semantics for this schema; it does not validate an external PostgreSQL deployment, authentication, concurrency over multiple server connections or production persistence. An actual PostgreSQL migration/integration test remains a foundation acceptance requirement.

## Failed / diagnosed

- Initial npm installs used an unwritable home cache. Retried with `npm_config_cache=/workspace/.npm-cache`; installation succeeded. No trust verification was disabled.
- Broad `rea doctor --client codex --json`: Java/Ghidra process ownership cleanup could not be confirmed because `/proc/<pid>/environ` returned EACCES. Reported PIDs were absent at a later process check. This is a host capability limitation for that diagnostic, not a passing client registration check.
- Direct official documentation requests for Google Cloud, Gemini, Remotion, FFmpeg, PostgreSQL and Valkey were denied by network policy. PostgreSQL/Valkey/Remotion license text was subsequently retrieved from upstream GitHub sources, with outcomes retained separately. Live Cloud pricing/trial terms remain unverified.

## Not run

Reference website comparison, browser/Electron runtime observation, native decompilation, real generation, application tests, cloud deployment, billing validation and a new-task snapshot restoration. No existing application or test suite was present on `main`; the implementation backlog defines those checks rather than reporting fictional passes.

## Reproduce

From `/workspace/Course-Creation-Ecosystem`:

```sh
bash scripts/setup-discovery.sh
```

This installs exact tools into `/workspace/tools`, frozen REA dependencies into the existing `/workspace/rea` checkout, rebuilds ignored runtime artifacts and executes both validation runners. It uses existing isolated checkouts and does not create worktrees or edit REA source/lockfiles. `HUSKY=0` prevents setup from installing Git hooks. Setup was exercised again after the initial successful install to verify the saved path.

For a retained snapshot where dependencies/runtime are present:

```sh
export PATH="/workspace/tools/rea-toolchain/node_modules/.bin:$PATH"
cd /workspace/Course-Creation-Ecosystem
node scripts/validate-discovery.mjs
node scripts/validate-rea.mjs
```

Full smoke-test outputs are retained under `/workspace/scratch/rea-validation/`. The earlier diagnostic report is `/workspace/scratch/rea-doctor.json`. No live service needs restarting for this discovery workflow. A future application requires separate startup/readiness instructions when it exists.
