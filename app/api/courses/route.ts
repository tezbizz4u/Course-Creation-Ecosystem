import { body, failure, owner, sameOrigin } from "@/lib/http";
import { query } from "@/lib/db";
import { createCourse } from "@/lib/courses";
export async function GET() {
  try {
    const id = await owner();
    return Response.json(
      (
        await query(
          "SELECT c.id,c.title,c.audience,p.title AS project_title,s.revision,jsonb_array_length(s.document->'slides') AS slide_count FROM studio_courses c JOIN studio_projects p ON p.id=c.project_id JOIN studio_presentations s ON s.course_id=c.id WHERE c.owner_id=$1 ORDER BY c.created_at DESC",
          [id],
        )
      ).rows,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    return Response.json(
      await createCourse(await owner(), await body(request)),
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
