import { z } from "zod";
import { failure, HTTPError, owner } from "@/lib/http";
import { query } from "@/lib/db";
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
    const asset = (
      await query<{ data: Uint8Array; mime: string }>(
        "SELECT data,mime FROM studio_assets WHERE id=$1 AND owner_id=$2",
        [id, uid],
      )
    ).rows[0];
    if (!asset) throw new HTTPError(404, "Asset not found.");
    return new Response(new Uint8Array(asset.data), {
      headers: {
        "Content-Type": asset.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
