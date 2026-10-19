import { randomUUID } from "node:crypto";
import { z } from "zod";
import { body, failure, HTTPError, sameOrigin } from "@/lib/http";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/password";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (process.env.ALLOW_REGISTRATION !== "1")
      throw new HTTPError(403, "Account registration is disabled.");
    const data = z
      .object({
        email: z.string().email().max(254),
        password: z.string().min(12).max(128),
      })
      .parse(await body(request));
    const result = await query(
      "INSERT INTO studio_users(id,email,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING RETURNING id",
      [randomUUID(), data.email.toLowerCase(), hashPassword(data.password)],
    );
    if (!result.rows.length)
      throw new HTTPError(409, "An account with this email already exists.");
    return Response.json({ created: true }, { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
