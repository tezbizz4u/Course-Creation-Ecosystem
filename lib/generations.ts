import { transaction } from "./db";
import { HTTPError } from "./http";
export async function reserveGeneration(
  id: string,
  uid: string,
  courseId: string,
  idempotencyKey: string,
  model: string,
) {
  const raw = Number(process.env.AI_MAX_REQUESTS_PER_DAY || 5);
  const limit = Number.isSafeInteger(raw) && raw > 0 ? Math.min(raw, 100) : 5;
  const existing = await transaction(async (sql) => {
    await sql.query("SELECT id FROM studio_budget_guard WHERE id=1 FOR UPDATE");
    await sql.query("SELECT id FROM studio_users WHERE id=$1 FOR UPDATE", [
      uid,
    ]);
    const prior = await sql.query<{
      status: string;
      result: unknown;
      course_id: string;
    }>(
      "SELECT status,result,course_id FROM studio_generations WHERE owner_id=$1 AND idempotency_key=$2",
      [uid, idempotencyKey],
    );
    if (prior.rows[0]) {
      if (prior.rows[0].course_id !== courseId)
        throw new HTTPError(
          409,
          "Request key was already used for a different course.",
        );
      if (prior.rows[0].status !== "succeeded")
        throw new HTTPError(
          409,
          "This request was already submitted. Check its outcome before creating another.",
        );
      return prior.rows[0].result;
    }
    const count = await sql.query<{ count: string }>(
      "SELECT count(*) FROM studio_generations WHERE owner_id=$1 AND created_at>=date_trunc('day',now())",
      [uid],
    );
    if (Number(count.rows[0].count) >= limit)
      throw new HTTPError(429, "Daily generation request limit reached.");
    const globalCount = await sql.query<{ count: string }>(
      "SELECT count(*) FROM studio_generations WHERE created_at>=date_trunc('day',now())",
    );
    const configuredGlobal = Number(
      process.env.AI_MAX_GLOBAL_REQUESTS_PER_DAY || 10,
    );
    const globalLimit =
      Number.isSafeInteger(configuredGlobal) && configuredGlobal > 0
        ? Math.min(configuredGlobal, 100)
        : 10;
    if (Number(globalCount.rows[0].count) >= globalLimit)
      throw new HTTPError(
        429,
        "Workspace-wide daily generation limit reached.",
      );
    await sql.query(
      "INSERT INTO studio_generations(id,owner_id,course_id,idempotency_key,status,model) VALUES($1,$2,$3,$4,'reserved',$5)",
      [id, uid, courseId, idempotencyKey, model],
    );
    return null;
  });
  return existing;
}
