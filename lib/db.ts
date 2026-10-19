import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Pool, PoolClient } from "pg";
import type { PGlite } from "@electric-sql/pglite";
export interface SQL {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}
const schema = `
CREATE TABLE IF NOT EXISTS studio_users(id uuid PRIMARY KEY,email text NOT NULL UNIQUE,password_hash text NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_attempts(key text PRIMARY KEY,count integer NOT NULL,window_start timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS studio_projects(id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES studio_users(id),title text NOT NULL,UNIQUE(owner_id,id));
CREATE TABLE IF NOT EXISTS studio_courses(id uuid PRIMARY KEY,owner_id uuid NOT NULL,project_id uuid NOT NULL,title text NOT NULL,audience text NOT NULL DEFAULT '',created_at timestamptz DEFAULT now(),UNIQUE(owner_id,id),FOREIGN KEY(owner_id,project_id) REFERENCES studio_projects(owner_id,id));
CREATE TABLE IF NOT EXISTS studio_presentations(id uuid PRIMARY KEY,owner_id uuid NOT NULL,course_id uuid NOT NULL UNIQUE,revision integer NOT NULL DEFAULT 1,document jsonb NOT NULL,updated_at timestamptz DEFAULT now(),UNIQUE(owner_id,id),FOREIGN KEY(owner_id,course_id) REFERENCES studio_courses(owner_id,id));
CREATE TABLE IF NOT EXISTS studio_versions(presentation_id uuid NOT NULL,owner_id uuid NOT NULL,revision integer NOT NULL,document jsonb NOT NULL,created_at timestamptz DEFAULT now(),PRIMARY KEY(presentation_id,revision),FOREIGN KEY(owner_id,presentation_id) REFERENCES studio_presentations(owner_id,id));
CREATE TABLE IF NOT EXISTS studio_assets(id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES studio_users(id),mime text NOT NULL,data bytea NOT NULL,sha256 text NOT NULL,provenance jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS studio_budget_guard(id integer PRIMARY KEY);
INSERT INTO studio_budget_guard(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS studio_generations(id uuid PRIMARY KEY,owner_id uuid NOT NULL,course_id uuid NOT NULL,idempotency_key uuid NOT NULL,status text NOT NULL CHECK(status IN ('reserved','succeeded','failed')),model text NOT NULL,input_tokens integer,output_tokens integer,result jsonb,error_code text,created_at timestamptz DEFAULT now(),UNIQUE(owner_id,idempotency_key),FOREIGN KEY(owner_id,course_id) REFERENCES studio_courses(owner_id,id));
`;
type DB = { sql: SQL; pool?: Pool; embedded?: PGlite };
const globalDB = globalThis as unknown as { studioDB?: Promise<DB> };
async function initialize(): Promise<DB> {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    const sql = pool as unknown as SQL;
    await sql.query(schema);
    return { sql, pool };
  }
  if (process.env.LOCAL_DATABASE !== "1" || process.env.K_SERVICE)
    throw Error(
      "DATABASE_URL is required. LOCAL_DATABASE=1 is available only for local development.",
    );
  const { PGlite } = await import("@electric-sql/pglite");
  const path = resolve(
    /* turbopackIgnore: true */ process.env.LOCAL_DATA_DIR || ".local/database",
  );
  mkdirSync(path, { recursive: true });
  const embedded = new PGlite(path);
  await embedded.exec(schema);
  return { sql: embedded as unknown as SQL, embedded };
}
export const database = () =>
  (globalDB.studioDB ??= initialize().catch((e) => {
    globalDB.studioDB = undefined;
    throw e;
  }));
export async function transaction<T>(fn: (sql: SQL) => Promise<T>): Promise<T> {
  const db = await database();
  if (db.embedded)
    return db.embedded.transaction((tx) => fn(tx as unknown as SQL));
  const client: PoolClient = await db.pool!.connect();
  try {
    await client.query("BEGIN");
    const value = await fn(client as unknown as SQL);
    await client.query("COMMIT");
    return value;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
) {
  return (await database()).sql.query<T>(sql, params);
}
