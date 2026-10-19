import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
export function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.LOCAL_DATABASE === "1" && !process.env.K_SERVICE) {
    const state = process.env.STUDIO_STATE_DIR || ".local";
    mkdirSync(state, { recursive: true });
    const file = join(/* turbopackIgnore: true */ state, "auth-secret");
    try {
      writeFileSync(file, randomBytes(32).toString("hex"), {
        flag: "wx",
        mode: 0o600,
      });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    }
    return readFileSync(file, "utf8");
  }
  return undefined;
}
