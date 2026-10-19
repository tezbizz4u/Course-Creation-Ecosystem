import { z } from "zod";
import { body, failure, HTTPError, owner, sameOrigin } from "@/lib/http";
import { query } from "@/lib/db";
import { savePresentation } from "@/lib/courses";
const input = z.object({
  expectedRevision: z.number().int().positive(),
  document: z.unknown(),
});
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    const uid = await owner();
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const data = input.parse(await body(request));
    return Response.json(
      await savePresentation(uid, id, data.expectedRevision, data.document),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const uid = await owner();
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const rows = await query(
      "SELECT revision,document,created_at FROM studio_versions WHERE owner_id=$1 AND presentation_id=$2 ORDER BY revision DESC LIMIT 30",
      [uid, id],
    );
    if (!rows.rows.length) throw new HTTPError(404, "Presentation not found.");
    return Response.json(rows.rows);
  } catch (e) {
    return failure(e);
  }
}
