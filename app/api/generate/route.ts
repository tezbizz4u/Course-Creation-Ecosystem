import { reserveGeneration } from "@/lib/generations";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { body, failure, HTTPError, owner, sameOrigin } from "@/lib/http";
import { query } from "@/lib/db";
import { configuredProvider } from "@/lib/ai";
import { courseFor } from "@/lib/courses";
const input = z.object({
  courseId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  approved: z.literal(true),
});
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const uid = await owner();
    const data = input.parse(await body(request));
    const course = await courseFor(uid, data.courseId);
    const provider = configuredProvider();
    if (!provider)
      throw new HTTPError(503, "No generation provider is enabled.");
    const id = randomUUID();
    const existing = await reserveGeneration(
      id,
      uid,
      data.courseId,
      data.idempotencyKey,
      process.env.AI_MODEL!,
    );
    if (existing) return Response.json({ idempotent: true, outline: existing });
    try {
      const result = await provider.generate(
        String(course.title),
        String(course.audience),
      );
      await query(
        "UPDATE studio_generations SET status='succeeded',result=$1,input_tokens=$2,output_tokens=$3 WHERE id=$4",
        [
          JSON.stringify(result.outline),
          result.inputTokens,
          result.outputTokens,
          id,
        ],
      );
      return Response.json({ outline: result.outline });
    } catch {
      await query(
        "UPDATE studio_generations SET status='failed',error_code='PROVIDER_FAILED' WHERE id=$1",
        [id],
      );
      throw new HTTPError(
        502,
        "Generation failed or timed out. A provider charge may still have occurred. This request will not be automatically retried.",
      );
    }
  } catch (e) {
    return failure(e);
  }
}

export async function GET(request: Request) {
  try {
    const uid = await owner();
    const courseId = z
      .string()
      .uuid()
      .parse(new URL(request.url).searchParams.get("courseId"));
    await courseFor(uid, courseId);
    return Response.json(
      (
        await query(
          "SELECT id,status,model,input_tokens,output_tokens,result,error_code,created_at FROM studio_generations WHERE owner_id=$1 AND course_id=$2 ORDER BY created_at DESC LIMIT 20",
          [uid, courseId],
        )
      ).rows,
    );
  } catch (e) {
    return failure(e);
  }
}
