import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { body, failure, HTTPError, owner, sameOrigin } from "@/lib/http";
import { query } from "@/lib/db";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const uid = await owner();
    const data = z
      .object({
        data: z.string().max(1_400_000),
        source: z.string().min(1).max(500),
        license: z.string().min(1).max(200),
      })
      .parse(await body(request));
    const bytes = Buffer.from(data.data, "base64");
    if (bytes.length > 1_000_000)
      throw new HTTPError(413, "Use an image smaller than 1 MB.");
    let mime = "";
    if (
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      mime = "image/png";
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
      mime = "image/jpeg";
    else throw new HTTPError(400, "Use a PNG or JPEG image.");
    const id = randomUUID();
    await query(
      "INSERT INTO studio_assets(id,owner_id,mime,data,sha256,provenance) VALUES($1,$2,$3,$4,$5,$6)",
      [
        id,
        uid,
        mime,
        bytes,
        createHash("sha256").update(bytes).digest("hex"),
        JSON.stringify({ source: data.source, license: data.license }),
      ],
    );
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
