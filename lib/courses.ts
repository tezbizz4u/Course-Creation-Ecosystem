import { randomUUID } from "node:crypto";
import { query, transaction } from "./db";
import {
  createCourseSchema,
  documentSchema,
  type SlideDocument,
} from "./contracts";
import { HTTPError } from "./http";
export function initialDocument(title: string): SlideDocument {
  return {
    schemaVersion: 1,
    slides: [
      {
        id: randomUUID(),
        title: "Welcome",
        background: "#f0edfc",
        objects: [
          {
            id: randomUUID(),
            type: "text",
            x: 80,
            y: 95,
            width: 780,
            height: 150,
            rotation: 0,
            text: title,
            fill: "#28263b",
            fontSize: 64,
          },
          {
            id: randomUUID(),
            type: "text",
            x: 85,
            y: 290,
            width: 750,
            height: 100,
            rotation: 0,
            text: "Your expertise. A new learning experience.",
            fill: "#827b9a",
            fontSize: 25,
          },
        ],
      },
    ],
  };
}
export async function createCourse(ownerId: string, raw: unknown) {
  const data = createCourseSchema.parse(raw);
  const project = randomUUID(),
    course = randomUUID(),
    presentation = randomUUID();
  const doc = initialDocument(data.title);
  await transaction(async (sql) => {
    await sql.query(
      "INSERT INTO studio_projects(id,owner_id,title) VALUES($1,$2,$3)",
      [project, ownerId, data.projectTitle],
    );
    await sql.query(
      "INSERT INTO studio_courses(id,owner_id,project_id,title,audience) VALUES($1,$2,$3,$4,$5)",
      [course, ownerId, project, data.title, data.audience],
    );
    await sql.query(
      "INSERT INTO studio_presentations(id,owner_id,course_id,document) VALUES($1,$2,$3,$4)",
      [presentation, ownerId, course, JSON.stringify(doc)],
    );
    await sql.query(
      "INSERT INTO studio_versions(presentation_id,owner_id,revision,document) VALUES($1,$2,1,$3)",
      [presentation, ownerId, JSON.stringify(doc)],
    );
  });
  return { id: course };
}
export async function courseFor(ownerId: string, id: string) {
  const result = await query(
    `SELECT c.id,c.title,c.audience,p.title AS project_title,s.id AS presentation_id,s.revision,s.document FROM studio_courses c JOIN studio_projects p ON p.id=c.project_id JOIN studio_presentations s ON s.course_id=c.id WHERE c.owner_id=$1 AND c.id=$2`,
    [ownerId, id],
  );
  if (!result.rows[0]) throw new HTTPError(404, "Course not found.");
  return result.rows[0];
}
export async function savePresentation(
  ownerId: string,
  id: string,
  expectedRevision: number,
  raw: unknown,
) {
  const doc = documentSchema.parse(raw);
  return transaction(async (sql) => {
    const assets = [
      ...new Set(
        doc.slides.flatMap((s) =>
          s.objects.filter((o) => o.type === "image").map((o) => o.assetId!),
        ),
      ),
    ];
    for (const asset of assets) {
      if (
        !(
          await sql.query(
            "SELECT id FROM studio_assets WHERE id=$1 AND owner_id=$2",
            [asset, ownerId],
          )
        ).rows.length
      )
        throw new HTTPError(400, "An image asset is unavailable.");
    }
    const updated = await sql.query<{ revision: number }>(
      "UPDATE studio_presentations SET document=$1,revision=revision+1,updated_at=now() WHERE id=$2 AND owner_id=$3 AND revision=$4 RETURNING revision",
      [JSON.stringify(doc), id, ownerId, expectedRevision],
    );
    if (!updated.rows.length) {
      const exists = await sql.query(
        "SELECT id FROM studio_presentations WHERE id=$1 AND owner_id=$2",
        [id, ownerId],
      );
      throw new HTTPError(
        exists.rows.length ? 409 : 404,
        exists.rows.length
          ? "This presentation changed in another tab. Download your draft, then reload."
          : "Presentation not found.",
      );
    }
    const revision = updated.rows[0].revision;
    await sql.query(
      "INSERT INTO studio_versions(presentation_id,owner_id,revision,document) VALUES($1,$2,$3,$4)",
      [id, ownerId, revision, JSON.stringify(doc)],
    );
    return { revision };
  });
}
