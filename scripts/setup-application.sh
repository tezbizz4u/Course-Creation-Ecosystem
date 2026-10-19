#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Course-Creation-Ecosystem
export npm_config_cache=/workspace/.npm-cache
npm install --prefix /workspace/tools/rea-toolchain --save-exact node@24.18.0 npm@11.16.0 --no-audit --no-fund
export PATH="/workspace/tools/rea-toolchain/node_modules/.bin:$PATH"
bash scripts/start-postgres.sh
npm ci --no-audit --no-fund
npm test
npm run build
bash scripts/backup-postgres.sh
