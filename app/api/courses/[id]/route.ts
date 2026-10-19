import { z } from "zod";
import { failure, owner } from "@/lib/http";
import { courseFor } from "@/lib/courses";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return Response.json(
      await courseFor(await owner(), z.string().uuid().parse(id)),
    );
  } catch (e) {
    return failure(e);
  }
}
