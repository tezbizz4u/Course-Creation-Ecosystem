import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "../lib/password";
import { GeminiProvider } from "../lib/ai";
import { documentSchema } from "../lib/contracts";
let dir: string;
before(async () => {
  dir = await mkdtemp(join(tmpdir(), "course-studio-test-"));
  process.env.LOCAL_DATABASE = "1";
  process.env.LOCAL_DATA_DIR = dir;
  process.env.AUTH_SECRET = "test-only-secret-not-for-production-use";
  delete process.env.DATABASE_URL;
});
after(async () => {
  const { database } = await import("../lib/db");
  await (await database()).embedded?.close();
  await rm(dir, { recursive: true, force: true });
});
test("password hashes use unique salts and reject a wrong password", () => {
  const a = hashPassword("test-password-123"),
    b = hashPassword("test-password-123");
  assert.notEqual(a, b);
  assert.ok(verifyPassword("test-password-123", a));
  assert.equal(verifyPassword("wrong-password-123", a), false);
});
test("course persistence, owner isolation, revision race, immutable history and asset scope", async () => {
  const { query } = await import("../lib/db");
  const { createCourse, courseFor, savePresentation } =
    await import("../lib/courses");
  const a = randomUUID(),
    b = randomUUID();
  await query(
    "INSERT INTO studio_users(id,email,password_hash) VALUES($1,$2,$3),($4,$5,$6)",
    [a, "a@tests.invalid", "unused", b, "b@tests.invalid", "unused"],
  );
  const { id } = await createCourse(a, {
    title: "Evidence-based teaching",
    audience: "Educators",
    projectTitle: "Pilot",
  });
  const course = await courseFor(a, id);
  assert.equal(course.title, "Evidence-based teaching");
  await assert.rejects(
    courseFor(b, id),
    (e: Error & { status?: number }) => e.status === 404,
  );
  const document = documentSchema.parse(course.document);
  document.slides[0].title = "Updated";
  const pid = String(course.presentation_id);
  const results = await Promise.allSettled([
    savePresentation(a, pid, 1, document),
    savePresentation(a, pid, 1, document),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const failed = results.find(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult;
  assert.equal(failed.reason.status, 409);
  await assert.rejects(
    savePresentation(b, pid, 2, document),
    (e: Error & { status?: number }) => e.status === 404,
  );
  const rows = await query<{ revision: number; document: unknown }>(
    "SELECT revision,document FROM studio_versions WHERE presentation_id=$1 ORDER BY revision",
    [pid],
  );
  assert.deepEqual(
    rows.rows.map((r) => r.revision),
    [1, 2],
  );
  assert.equal(
    documentSchema.parse(rows.rows[0].document).slides[0].title,
    "Welcome",
  );
  const image = randomUUID();
  await query(
    "INSERT INTO studio_assets(id,owner_id,mime,data,sha256,provenance) VALUES($1,$2,$3,$4,$5,$6)",
    [image, b, "image/png", Buffer.from("test"), "hash", "{}"],
  );
  document.slides[0].objects.push({
    id: randomUUID(),
    type: "image",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    text: "",
    fill: "#ffffff",
    fontSize: 24,
    assetId: image,
  });
  await assert.rejects(
    savePresentation(a, pid, 2, document),
    (e: Error & { status?: number }) => e.status === 400,
  );
  assert.equal((await courseFor(a, id)).revision, 2);
});
test("slide schema rejects duplicate object identities and invalid geometry", async () => {
  const { initialDocument } = await import("../lib/courses");
  const doc = initialDocument("Sample");
  doc.slides[0].objects.push({ ...doc.slides[0].objects[0] });
  assert.equal(documentSchema.safeParse(doc).success, false);
  doc.slides[0].objects.pop();
  doc.slides[0].objects[0].width = -1;
  assert.equal(documentSchema.safeParse(doc).success, false);
});
test("Gemini adapter sends bounded requests and normalizes valid structured output", async () => {
  let observed = false;
  const fake: typeof fetch = async (url, init) => {
    assert.match(String(url), /^https:\/\/generativelanguage.googleapis.com\//);
    const request = JSON.parse(String(init?.body));
    assert.equal(request.generationConfig.maxOutputTokens, 4096);
    assert.equal(
      (init?.headers as Record<string, string>)["x-goog-api-key"],
      "test-key",
    );
    observed = true;
    return Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  slides: [
                    { title: "Introduction", body: "Practice with evidence." },
                  ],
                }),
              },
            ],
          },
        },
      ],
      usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 10 },
    });
  };
  const result = await new GeminiProvider(
    "test-key",
    "configured-test-model",
    fake,
  ).generate("Teaching", "Educators");
  assert.ok(observed);
  assert.equal(result.outline.slides[0].title, "Introduction");
  assert.equal(result.inputTokens, 20);
});
test("Gemini adapter rejects errors, malformed results and unsafe model identifiers", async () => {
  await assert.rejects(
    new GeminiProvider(
      "key",
      "model",
      async () => new Response("", { status: 429 }),
    ).generate("a", "b"),
    /PROVIDER_RATE_LIMIT/,
  );
  await assert.rejects(
    new GeminiProvider("key", "model", async () =>
      Response.json({
        candidates: [{ content: { parts: [{ text: '{"slides":[]}' }] } }],
      }),
    ).generate("a", "b"),
  );
  assert.throws(() => new GeminiProvider("key", "../../other-host"));
});
test("concurrent AI quota reservations and idempotency prevent duplicate requests", async () => {
  const { query } = await import("../lib/db");
  const { createCourse } = await import("../lib/courses");
  const { reserveGeneration } = await import("../lib/generations");
  const uid = randomUUID();
  await query(
    "INSERT INTO studio_users(id,email,password_hash) VALUES($1,$2,$3)",
    [uid, "quota@tests.invalid", "unused"],
  );
  const course = await createCourse(uid, {
    title: "Quota pilot",
    audience: "Pilot",
    projectTitle: "Tests",
  });
  process.env.AI_MAX_GLOBAL_REQUESTS_PER_DAY = "1";
  process.env.AI_MAX_REQUESTS_PER_DAY = "1";
  const id = randomUUID(),
    key = randomUUID();
  const attempts = await Promise.allSettled([
    reserveGeneration(id, uid, course.id, key, "test-model"),
    reserveGeneration(randomUUID(), uid, course.id, randomUUID(), "test-model"),
  ]);
  assert.equal(attempts.filter((a) => a.status === "fulfilled").length, 1);
  assert.equal(
    (attempts.find((a) => a.status === "rejected") as PromiseRejectedResult)
      .reason.status,
    429,
  );
  const row = (
    await query<{ id: string; idempotency_key: string }>(
      "SELECT id,idempotency_key FROM studio_generations WHERE owner_id=$1",
      [uid],
    )
  ).rows[0];
  await assert.rejects(
    reserveGeneration(
      randomUUID(),
      uid,
      course.id,
      row.idempotency_key,
      "test-model",
    ),
    (e: Error & { status?: number }) => e.status === 409,
  );
  const outline = {
    slides: [{ title: "A verified draft", body: "Review before publication." }],
  };
  await query(
    "UPDATE studio_generations SET status='succeeded',result=$1 WHERE id=$2",
    [JSON.stringify(outline), row.id],
  );
  assert.deepEqual(
    await reserveGeneration(
      randomUUID(),
      uid,
      course.id,
      row.idempotency_key,
      "test-model",
    ),
    outline,
  );
  delete process.env.AI_MAX_GLOBAL_REQUESTS_PER_DAY;
  delete process.env.AI_MAX_REQUESTS_PER_DAY;
});
test("course briefs persist independently, reject stale writes and enforce owner boundaries", async () => {
  const { query } = await import("../lib/db");
  const { createCourse } = await import("../lib/courses");
  const { getCourseBrief, saveCourseBrief } =
    await import("../lib/course-brief");
  const { courseBriefSchema } = await import("../lib/course-brief-contract");
  const a = randomUUID(),
    b = randomUUID();
  await query(
    "INSERT INTO studio_users(id,email,password_hash) VALUES($1,$2,$3),($4,$5,$6)",
    [
      a,
      "brief-a@tests.invalid",
      "unused",
      b,
      "brief-b@tests.invalid",
      "unused",
    ],
  );
  const course = await createCourse(a, {
    title: "CDEM brief pilot",
    audience: "Indian AYUSH practitioners",
    projectTitle: "Pilot",
  });
  const original = await getCourseBrief(a, course.id);
  assert.equal(original.revision, 0);
  assert.equal(original.brief.language, "English (India)");
  assert.equal(original.brief.audience, "Indian AYUSH practitioners");
  const brief = {
    ...original.brief,
    vision: "Create an editable lesson with diagrams.",
    objectives: "Explain the learning objectives clearly.",
    sourceNotes: "Source material supplied by the educator; not yet verified.",
  };
  const writes = await Promise.allSettled([
    saveCourseBrief(a, course.id, 0, brief),
    saveCourseBrief(a, course.id, 0, { ...brief, vision: "Different tab" }),
  ]);
  assert.equal(writes.filter((w) => w.status === "fulfilled").length, 1);
  assert.equal(
    (writes.find((w) => w.status === "rejected") as PromiseRejectedResult)
      .reason.status,
    409,
  );
  const current = await getCourseBrief(a, course.id);
  assert.equal(current.revision, 1);
  assert.equal(
    current.outline.find((s) => s.id === "research")?.status,
    "pending",
  );
  assert.equal(
    current.outline.find((s) => s.id === "brief")?.status,
    "captured",
  );
  await assert.rejects(
    getCourseBrief(b, course.id),
    (e: Error & { status?: number }) => e.status === 404,
  );
  await assert.rejects(
    saveCourseBrief(b, course.id, 1, brief),
    (e: Error & { status?: number }) => e.status === 404,
  );
  await saveCourseBrief(a, course.id, 1, {
    ...current.brief,
    design: "Editable diagrams, consistent typography, clear hierarchy.",
  });
  const versions = await query<{ revision: number }>(
    "SELECT revision FROM studio_brief_versions WHERE course_id=$1 ORDER BY revision",
    [course.id],
  );
  assert.deepEqual(
    versions.rows.map((r) => r.revision),
    [1, 2],
  );
  assert.equal(
    courseBriefSchema.safeParse({
      ...brief,
      references: [{ title: "Unsafe source", url: "javascript:alert(1)" }],
    }).success,
    false,
  );
});
test("generation uses the saved brief as bounded unverified context before calling a provider", async () => {
  const { buildGenerationPrompt } = await import("../lib/ai");
  const { newCourseBrief } = await import("../lib/course-brief-contract");
  const brief = {
    ...newCourseBrief(),
    vision: "A CDEM lesson with native editable diagrams",
    objectives: "Understand the learning objectives",
    sourceNotes: "Unverified educator notes",
  };
  const prompt = buildGenerationPrompt(
    "CDEM",
    "Indian AYUSH practitioners",
    brief,
  );
  assert.ok(prompt.includes(brief.vision));
  assert.ok(prompt.includes(brief.objectives));
  assert.ok(prompt.includes("Source notes have not been verified"));
  let calls = 0;
  const provider = new GeminiProvider(
    "test-key",
    "test-model",
    async (_url, init) => {
      calls++;
      const request = JSON.parse(String(init?.body));
      assert.ok(request.contents[0].parts[0].text.includes(brief.objectives));
      return Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '{"slides":[{"title":"Objectives","body":"Source verification required."}]}',
                },
              ],
            },
          },
        ],
      });
    },
  );
  await provider.generate("CDEM", "Indian AYUSH practitioners", brief);
  assert.equal(calls, 1);
  await assert.rejects(
    provider.generate("CDEM", "Practitioners", {
      ...brief,
      vision: "x".repeat(25000),
    }),
    /BRIEF_INPUT_TOO_LARGE/,
  );
  assert.equal(calls, 1);
});
