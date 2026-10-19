# Course Creation Ecosystem

An original Next.js, React and TypeScript course studio. The first local application milestone includes private accounts, persistent projects/courses, a React/Konva presentation editor, private images, versioned autosave/history, and a configurable Gemini text adapter.

The governing [product vision](docs/execution/PRODUCT-VISION.md) is one conversational, adaptive course-production platform. The existing editor is an early supporting capability.

Follow the current [execution plan](docs/execution/ACTION-PLAN.md) for REA investigation, implementation, testing and deployment. No further phase approvals are required.

Start with [development instructions](docs/DEVELOPMENT.md), [deployment prerequisites](docs/DEPLOYMENT.md), and the [technical discovery pack](docs/discovery/README.md).

```sh
export PATH="/workspace/tools/rea-toolchain/node_modules/.bin:$PATH"
export npm_config_cache=/workspace/.npm-cache
bash scripts/start-postgres.sh
npm ci --no-audit --no-fund
npm run build
npm start
```

For this prepared cloud workspace, PostgreSQL runs locally in Docker with persistent storage and a private snapshot/restore helper. An explicit LOCAL_DATABASE=1 PostgreSQL WASM fallback is also available for local development; it is forbidden on Cloud Run. Production requires an external PostgreSQL database and securely configured authentication.

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

AI generation is disabled by default. Configure an approved model, key and spending limits before enabling it; every request requires an explicit user action and approval. No live provider request or Google Cloud deployment has been performed.

This foundation is not the complete media production platform. PPTX/PDF, narration, video, LMS exports, team roles, Cloud Storage and background workers remain on the [roadmap](docs/discovery/roadmap.md). See [implementation validation](docs/IMPLEMENTATION-VALIDATION.md) for the actual tested scope and known limits.
