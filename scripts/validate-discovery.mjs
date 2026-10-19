import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire('/workspace/tools/discovery-check/package.json');
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
let checks = 0;
try {
  await db.exec(await readFile(new URL('../docs/discovery/schema.sql', import.meta.url), 'utf8'));
  checks++;
  const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  assert.equal(tables.rows.length, 12); checks++;
  const a='00000000-0000-4000-8000-000000000001';
  const b='00000000-0000-4000-8000-000000000002';
  const p='00000000-0000-4000-8000-000000000003';
  const c='00000000-0000-4000-8000-000000000004';
  await db.query('INSERT INTO tenants(id,name) VALUES ($1,$2),($3,$4)',[a,'Tenant A',b,'Tenant B']);
  await db.query('INSERT INTO projects(id,tenant_id,title) VALUES ($1,$2,$3)',[p,a,'Pilot']);
  await db.query('INSERT INTO courses(id,tenant_id,project_id,title) VALUES ($1,$2,$3,$4)',[c,a,p,'Course']);
  assert.equal((await db.query('SELECT title FROM courses WHERE id=$1',[c])).rows[0].title,'Course'); checks++;
  await assert.rejects(db.query('INSERT INTO courses(id,tenant_id,project_id,title) VALUES ($1,$2,$3,$4)', ['00000000-0000-4000-8000-000000000005',b,p,'Foreign course']), e=>e.code==='23503'); checks++;
  await assert.rejects(db.query('INSERT INTO courses(id,tenant_id,project_id,title) VALUES ($1,$2,$3,$4)', ['00000000-0000-4000-8000-000000000006',a,p,'']), e=>e.code==='23514'); checks++;
  const j='00000000-0000-4000-8000-000000000007';
  await db.query("INSERT INTO jobs(id,tenant_id,project_id,kind,idempotency_key,request) VALUES ($1,$2,$3,'text','once','{}')",[j,a,p]);
  await assert.rejects(db.query("INSERT INTO jobs(id,tenant_id,project_id,kind,idempotency_key,request) VALUES ($1,$2,$3,'text','once','{}')",['00000000-0000-4000-8000-000000000008',a,p]),e=>e.code==='23505'); checks++;
  await assert.rejects(db.query("UPDATE jobs SET status='pretend-success' WHERE id=$1",[j]),e=>e.code==='23514'); checks++;
  for(const name of await readdir(new URL('../docs/discovery/',import.meta.url))){
    if(!name.endsWith('.md'))continue;
    const url = new URL('../docs/discovery/'+name,import.meta.url);
    const text=await readFile(url,'utf8');
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      if(/^(https?:|#)/.test(match[1]))continue;
      await readFile(new URL(match[1].split('#')[0],url)); checks++;
    }
  }
  console.log(`PASS: ${checks} discovery checks (PostgreSQL WASM schema/constraints and documentation links).`);
} finally {await db.close();}
