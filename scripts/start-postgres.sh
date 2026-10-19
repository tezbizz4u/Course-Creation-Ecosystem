#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Course-Creation-Ecosystem
mkdir -p .local
python - <<'PY'
from pathlib import Path
import secrets,os
p=Path('.local/postgres.env')
if not p.exists():
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:f.write('POSTGRES_USER=studio\nPOSTGRES_DB=studio\nPOSTGRES_PASSWORD='+secrets.token_hex(32)+'\n')
config=dict(line.split('=',1) for line in p.read_text().splitlines())
e=Path('.env.local');text=e.read_text() if e.exists() else 'LOCAL_DATABASE=1\nALLOW_REGISTRATION=1\nAUTH_URL=http://localhost:3000\n'
if not any(line.startswith('DATABASE_URL=') for line in text.splitlines()):
 with e.open('a') as f:f.write('\nDATABASE_URL=postgresql://studio:'+config['POSTGRES_PASSWORD']+'@127.0.0.1:54329/studio\n')
 e.chmod(0o600)
PY
if docker container inspect course-studio-postgres >/dev/null 2>&1; then
  test "$(docker inspect --format '{{index .Config.Labels "com.forma.workspace"}}' course-studio-postgres)" = course-creation-ecosystem
  docker start course-studio-postgres >/dev/null
else
  docker run -d --name course-studio-postgres --label com.forma.workspace=course-creation-ecosystem \
    --publish 127.0.0.1:54329:5432 --env-file .local/postgres.env \
    --mount source=course-studio-postgres-data,target=/var/lib/postgresql/data \
    postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24 >/dev/null
fi
for attempt in {1..30}; do
 if docker exec course-studio-postgres pg_isready -U studio -d studio >/dev/null 2>&1; then
   if test -s .local/backups/studio.sql; then
     table_exists=$(docker exec course-studio-postgres psql -U studio -d studio -Atc "SELECT to_regclass('public.studio_users') IS NOT NULL")
     if test "$table_exists" = f; then
       docker exec -i course-studio-postgres psql -U studio -d studio --single-transaction --set ON_ERROR_STOP=1 < .local/backups/studio.sql > /workspace/scratch/postgres-restore.log
     fi
   fi
   echo 'Local PostgreSQL is ready on port 54329.'
   exit 0
 fi
 sleep 1
done
echo 'PostgreSQL did not become ready; inspect container logs.' >&2
exit 1
