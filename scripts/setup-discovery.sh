#!/usr/bin/env bash
set -euo pipefail
# Work in the existing isolated cloud checkout; do not create worktrees.
export npm_config_cache=/workspace/.npm-cache
npm install --prefix /workspace/tools/rea-toolchain --save-exact node@24.18.0 npm@11.16.0 --no-audit --no-fund
export PATH="/workspace/tools/rea-toolchain/node_modules/.bin:$PATH"
export HUSKY=0
npm install --prefix /workspace/tools/discovery-check --save-exact @electric-sql/pglite@0.5.10 --no-audit --no-fund
cd /workspace/rea
npm ci --no-audit --no-fund
npm run build:cached
cd /workspace/Course-Creation-Ecosystem
node scripts/validate-discovery.mjs
node scripts/validate-rea.mjs
