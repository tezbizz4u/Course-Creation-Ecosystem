import { query } from "@/lib/db";
export async function GET() {
  try {
    await query("SELECT 1");
    return Response.json({
      status: "ok",
      database: process.env.DATABASE_URL
        ? "postgresql"
        : "local-postgresql-wasm",
    });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
