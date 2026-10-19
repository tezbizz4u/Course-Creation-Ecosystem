import { z } from "zod";
import { courseFor } from "@/lib/courses";
import { documentSchema } from "@/lib/contracts";
import { exportPresentation } from "@/lib/presentation-export";
import { query } from "@/lib/db";
import { failure, owner } from "@/lib/http";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await owner();
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const course = await courseFor(userId, id);
    const exported = await exportPresentation({
      title: String(course.title),
      audience: String(course.audience),
      document: documentSchema.parse(course.document),
      loadAsset: async (assetId) =>
        (
          await query<{ mime: string; data: Uint8Array }>(
            "SELECT mime,data FROM studio_assets WHERE id=$1 AND owner_id=$2",
            [assetId, userId],
          )
        ).rows[0] ?? null,
    });
    return new Response(new Uint8Array(exported.bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition":
          'attachment; filename="course-presentation.pptx"',
        "Cache-Control": "private, no-store",
        "X-Presentation-Revision": String(course.revision),
        "X-Presentation-Warnings": String(exported.warnings.length),
      },
    });
  } catch (e) {
    return failure(e);
  }
}
