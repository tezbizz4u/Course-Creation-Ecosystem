-- Proposed initial schema. Authentication adapter tables are a separate migration.
-- Tenant IDs are part of foreign keys to prevent cross-tenant relationships.
BEGIN;
CREATE TABLE tenants (
 id uuid PRIMARY KEY, name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200)
);
CREATE TABLE members (
 tenant_id uuid NOT NULL REFERENCES tenants(id), user_id text NOT NULL,
 role text NOT NULL CHECK(role IN ('owner','editor','viewer')),
 PRIMARY KEY(tenant_id,user_id)
);
CREATE TABLE projects (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id),
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id)
);
CREATE TABLE courses (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, project_id uuid NOT NULL,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
 audience text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft'
 CHECK(status IN ('draft','review','published')),
 UNIQUE(tenant_id,id), FOREIGN KEY(tenant_id,project_id) REFERENCES projects(tenant_id,id)
);
CREATE TABLE modules (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, course_id uuid NOT NULL,
 title text NOT NULL, position integer NOT NULL CHECK(position>=0),
 UNIQUE(tenant_id,id), UNIQUE(course_id,position),
 FOREIGN KEY(tenant_id,course_id) REFERENCES courses(tenant_id,id)
);
CREATE TABLE lessons (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, module_id uuid NOT NULL,
 title text NOT NULL, position integer NOT NULL CHECK(position>=0),
 content jsonb NOT NULL DEFAULT '{}', narration text NOT NULL DEFAULT '',
 UNIQUE(tenant_id,id), UNIQUE(module_id,position),
 FOREIGN KEY(tenant_id,module_id) REFERENCES modules(tenant_id,id)
);
CREATE TABLE presentations (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, lesson_id uuid NOT NULL,
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
 UNIQUE(tenant_id,id), FOREIGN KEY(tenant_id,lesson_id) REFERENCES lessons(tenant_id,id)
);
CREATE TABLE presentation_versions (
 tenant_id uuid NOT NULL, presentation_id uuid NOT NULL, revision integer NOT NULL,
 document jsonb NOT NULL, created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(presentation_id,revision),
 FOREIGN KEY(tenant_id,presentation_id) REFERENCES presentations(tenant_id,id)
);
CREATE TABLE assets (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, project_id uuid NOT NULL,
 object_key text NOT NULL UNIQUE, mime_type text NOT NULL,
 byte_size bigint NOT NULL CHECK(byte_size>=0), sha256 char(64) NOT NULL,
 provenance jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), FOREIGN KEY(tenant_id,project_id) REFERENCES projects(tenant_id,id)
);
CREATE TABLE jobs (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, project_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('text','image','speech','render','export')),
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','succeeded','failed','cancelled')),
 idempotency_key text NOT NULL, request jsonb NOT NULL,
 result_asset_id uuid, error_code text, attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 reserved_micro_usd bigint NOT NULL DEFAULT 0 CHECK(reserved_micro_usd>=0),
 actual_micro_usd bigint CHECK(actual_micro_usd>=0),
 lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,kind,idempotency_key), UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,project_id) REFERENCES projects(tenant_id,id),
 FOREIGN KEY(tenant_id,result_asset_id) REFERENCES assets(tenant_id,id)
);
CREATE TABLE job_outbox (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 tenant_id uuid NOT NULL, job_id uuid NOT NULL, dispatched_at timestamptz,
 FOREIGN KEY(tenant_id,job_id) REFERENCES jobs(tenant_id,id)
);
CREATE TABLE audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id),
 actor_id text NOT NULL, action text NOT NULL, resource_id uuid NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_pending ON jobs(status,created_at);
CREATE INDEX outbox_pending ON job_outbox(id) WHERE dispatched_at IS NULL;
CREATE INDEX assets_project ON assets(tenant_id,project_id);
COMMIT;
-- Tenant authorization still requires authenticated, tenant-scoped queries.
-- These constraints alone do not provide row-level access control.
