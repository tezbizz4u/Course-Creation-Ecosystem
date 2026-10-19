import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";
const root = process.cwd();
nextEnv.loadEnvConfig(root);
if (!existsSync(".next/standalone/server.js"))
  throw Error("Run npm run build before npm start.");
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    HOSTNAME: process.env.STUDIO_BIND_ADDRESS || "127.0.0.1",
    STUDIO_STATE_DIR: resolve(root, ".local"),
    LOCAL_DATA_DIR: resolve(root, ".local/database"),
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
