import { z } from "zod";
import { body, failure, owner, sameOrigin } from "@/lib/http";
import { getCourseBrief, saveCourseBrief } from "@/lib/course-brief";
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
    return Response.json(await getCourseBrief(uid, id), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
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
    const data = z
      .object({ expectedRevision: z.number().int().min(0), brief: z.unknown() })
      .parse(await body(request));
    return Response.json(
      await saveCourseBrief(uid, id, data.expectedRevision, data.brief),
    );
  } catch (e) {
    return failure(e);
  }
}
