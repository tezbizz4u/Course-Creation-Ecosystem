#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Course-Creation-Ecosystem
mkdir -p .local/backups
umask 077
docker exec course-studio-postgres pg_dump -U studio -d studio --no-owner --no-acl > .local/backups/studio.sql.tmp
# Never replace a good backup with a failed or empty dump.
test -s .local/backups/studio.sql.tmp
mv .local/backups/studio.sql.tmp .local/backups/studio.sql
echo 'Database snapshot saved in .local/backups/studio.sql (private; not tracked).'
