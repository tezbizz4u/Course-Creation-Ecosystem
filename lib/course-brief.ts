import { query, transaction } from "./db";
import { courseFor } from "./courses";
import {
  courseBriefSchema,
  newCourseBrief,
  productionOutline,
  type CourseBrief,
} from "./course-brief-contract";
import { HTTPError } from "./http";
type StoredBrief = { revision: number; document: CourseBrief };
export async function getCourseBrief(ownerId: string, courseId: string) {
  await courseFor(ownerId, courseId);
  const stored = (
    await query<StoredBrief>(
      "SELECT revision,document FROM studio_briefs WHERE owner_id=$1 AND course_id=$2",
      [ownerId, courseId],
    )
  ).rows[0];
  const brief = stored
    ? courseBriefSchema.parse(stored.document)
    : newCourseBrief();
  return {
    revision: stored?.revision ?? 0,
    brief,
    outline: productionOutline(brief),
  };
}
export async function saveCourseBrief(
  ownerId: string,
  courseId: string,
  expectedRevision: number,
  input: unknown,
) {
  const brief = courseBriefSchema.parse(input);
  await courseFor(ownerId, courseId);
  return transaction(async (sql) => {
    const result =
      expectedRevision === 0
        ? await sql.query<{ revision: number }>(
            "INSERT INTO studio_briefs(course_id,owner_id,revision,document) VALUES($1,$2,1,$3) ON CONFLICT(course_id) DO NOTHING RETURNING revision",
            [courseId, ownerId, JSON.stringify(brief)],
          )
        : await sql.query<{ revision: number }>(
            "UPDATE studio_briefs SET document=$1,revision=revision+1,updated_at=now() WHERE course_id=$2 AND owner_id=$3 AND revision=$4 RETURNING revision",
            [JSON.stringify(brief), courseId, ownerId, expectedRevision],
          );
    if (!result.rows.length)
      throw new HTTPError(
        409,
        "The course brief changed in another tab. Reload the saved brief before editing it.",
      );
    const revision = result.rows[0].revision;
    await sql.query(
      "INSERT INTO studio_brief_versions(course_id,owner_id,revision,document) VALUES($1,$2,$3,$4)",
      [courseId, ownerId, revision, JSON.stringify(brief)],
    );
    return { revision, brief, outline: productionOutline(brief) };
  });
}
