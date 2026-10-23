import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobile = path.join(repo, "mobile");
const args = new Set(process.argv.slice(2));
const known = new Set(["--go", "--android", "--ios", "--check", "--dry-run", "--help"]);
for (const arg of args) if (!known.has(arg)) throw new Error(`Unknown option: ${arg}`);
if (args.has("--help")) {
  console.log("npm run mobile:qa              Expo Go QR (Android + iPhone, same Wi-Fi)\nnpm run mobile:qa -- --android  Build/install native Android\nnpm run mobile:qa -- --ios      Build/install native iOS (macOS + Xcode)\nnpm run mobile:qa:check         Automated readiness checks\nQA uses an isolated save. Open QA on the title screen; verify the on-screen checklist.");
  process.exit(0);
}
const modes = ["--go", "--android", "--ios", "--check"].filter((arg) => args.has(arg));
if (modes.length > 1) throw new Error("Choose only one launch mode");
const mode = modes[0] ?? "--go";
const commands = mode === "--check" ? [
  ["npm", ["run", "typecheck"]], ["npm", ["run", "check:agents"]], ["npm", ["test"]],
  ["node", ["mobile/scripts/check-native.mjs"]], ["node", ["mobile/scripts/check-bundle.mjs"]],
] : [["node", ["scripts/generate-asset-map.mjs"], mobile],
  ["node", [path.join(repo, "node_modules/expo/bin/cli"), ...(mode === "--go" ? ["start", "--go", "--lan", "--clear"] : [mode === "--android" ? "run:android" : "run:ios", "--device"])], mobile]];
if (args.has("--dry-run")) {
  console.log(JSON.stringify({ mode, EXPO_PUBLIC_QA: "1", commands }, null, 2));
  process.exit(0);
}
if (Number(process.versions.node.split(".")[0]) !== 22) throw new Error("Use Node.js 22.x (the repository's supported version).");
if (mode === "--ios" && process.platform !== "darwin") throw new Error("Native iOS builds require macOS + Xcode. Use the default Expo Go QR for iPhone testing from Windows.");
const env = { ...process.env, EXPO_PUBLIC_QA: "1" };
function run(command, commandArgs, cwd = repo) {
  const executable = command === "node" ? process.execPath : command;
  const result = spawnSync(executable, commandArgs, { cwd, env, stdio: "inherit", shell: command === "npm" && process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (!existsSync(path.join(repo, "node_modules/expo/bin/cli"))) run("npm", ["ci", "--no-audit", "--no-fund"]);
console.log("Sprint 04 QA · isolated save · open QA on the title screen. Stop Metro with Ctrl+C.");
if (mode === "--go") console.log("Use Expo Go for SDK 57 on Android/iPhone on the same Wi-Fi. This tests the JS/game flow; native startup must also be checked with a native build.");
for (const [command, commandArgs, cwd] of commands) run(command, commandArgs, cwd);
