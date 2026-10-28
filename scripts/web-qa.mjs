import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...process.env,
  PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
  CODIGDEX_WEB_QA: "1", NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
};
const synced = spawnSync(process.execPath, ["web/scripts/sync-assets.mjs"], { cwd: root, env, stdio: "inherit", windowsHide: true });
if (synced.error) throw synced.error;
if (synced.status !== 0) process.exit(synced.status ?? 1);
console.log("Codigdex local QA: http://localhost:3002/qa (local-only; separate save origin)");
const server = spawn(process.execPath, ["../node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3002"], {
  cwd: path.join(root, "web"), env, stdio: "inherit", windowsHide: true,
});
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
server.on("exit", (code) => { process.exitCode = code ?? 0; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { server.kill(signal); });
