import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import net from "node:net";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobile = path.join(repo, "mobile");
const argv = process.argv.slice(2);
let requestedPort;
let requestedDevice;
const flags = [];
for (let index = 0; index < argv.length; index++) {
  if (argv[index] === "--device") {
    if (requestedDevice !== undefined) throw new Error("Duplicate --device option");
    const value = argv[++index];
    if (!value || value.startsWith("--")) throw new Error("Provide an emulator/simulator name after --device");
    requestedDevice = value;
    continue;
  }
  if (argv[index] !== "--port") { flags.push(argv[index]); continue; }
  if (requestedPort !== undefined) throw new Error("Duplicate --port option");
  const value = argv[++index];
  if (!/^\d+$/.test(value ?? "") || Number(value) < 1024 || Number(value) > 65535) throw new Error("Choose --port 1024..65535");
  requestedPort = Number(value);
}
const args = new Set(flags);
const known = new Set(["--go", "--android", "--ios", "--check", "--dry-run", "--help"]);
for (const arg of args) if (!known.has(arg)) throw new Error(`Unknown option: ${arg}`);
if (args.has("--help")) {
  console.log("npm run mobile:qa                 Expo Go QR (Android + iPhone, same Wi-Fi)\nnpm run mobile:qa:android         Build/install on Android emulator (Android Studio + SDK + JDK 17+)\nnpm run mobile:qa:ios             Build/install on iOS Simulator (macOS + Xcode)\nnpm run mobile:qa:android -- --device Pixel_8  Select an emulator by name\nnpm run mobile:qa -- --port 8083  Choose a Metro port\nnpm run mobile:qa:check          Automated readiness checks\nInstall Node.js 22.x, then run npm ci from the repository root. Start an emulator/simulator before running a native command.\nWindows shortcut: start-mobile-qa.cmd --android\nQA uses an isolated save. Open QA on the title screen; verify the on-screen checklist.");
  process.exit(0);
}
const modes = ["--go", "--android", "--ios", "--check"].filter((arg) => args.has(arg));
if (modes.length > 1) throw new Error("Choose only one launch mode");
const mode = modes[0] ?? "--go";
if (mode === "--check" && requestedPort !== undefined) throw new Error("--port is only for launching Metro");
if (requestedDevice !== undefined && mode !== "--android" && mode !== "--ios") throw new Error("--device requires --android or --ios");
async function portAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") resolve(false);
      else reject(error);
    });
    server.listen(port, () => server.close(() => resolve(true)));
  });
}
let port = requestedPort ?? 8081;
if (mode !== "--check" && !args.has("--dry-run")) {
  while (!(await portAvailable(port))) {
    if (requestedPort !== undefined || port >= 8091) throw new Error(`Port ${port} is unavailable. Choose another with --port NUMBER.`);
    port++;
  }
  if (port !== 8081 && requestedPort === undefined) console.log(`Port 8081 is in use. Using Metro port ${port}.`);
}
const commands = mode === "--check" ? [
  ["npm", ["run", "typecheck"]], ["npm", ["run", "check:agents"]], ["npm", ["test"]],
  ["node", ["mobile/scripts/check-native.mjs"]], ["node", ["mobile/scripts/check-bundle.mjs"]],
] : [["node", ["scripts/generate-asset-map.mjs"], mobile],
  ["node", [path.join(repo, "node_modules/expo/bin/cli"), ...(mode === "--go" ? ["start", "--go", "--lan", "--clear"] : [mode === "--android" ? "run:android" : "run:ios", ...(requestedDevice === undefined ? [] : ["--device", requestedDevice])]), "--port", String(port)], mobile]];
if (args.has("--dry-run")) {
  console.log(JSON.stringify({ mode, EXPO_PUBLIC_QA: "1", commands }, null, 2));
  process.exit(0);
}
if (Number(process.versions.node.split(".")[0]) !== 22) throw new Error("Use Node.js 22.x (the repository's supported version).");
if (mode === "--ios" && process.platform !== "darwin") throw new Error("Native iOS builds require macOS + Xcode. Use the default Expo Go QR for iPhone testing from Windows.");
const env = { ...process.env,
  PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
  EXPO_PUBLIC_QA: "1", EXPO_PUBLIC_E2E: "0", EXPO_NO_TELEMETRY: "1",
  EXPO_NO_DOTENV: "1", ...(mode === "--check" ? {} : { NODE_ENV: "development" }),
  EXPO_PUBLIC_SUPABASE_URL: "", EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
};
function run(command, commandArgs, cwd = repo) {
  const executable = command === "node" ? process.execPath : command;
  const result = spawnSync(executable, commandArgs, { cwd, env, stdio: "inherit", shell: command === "npm" && process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (!existsSync(path.join(repo, "node_modules/expo/bin/cli"))) run("npm", ["ci", "--no-audit", "--no-fund"]);
console.log("Mobile QA · isolated save · open QA on the title screen. Stop Metro with Ctrl+C.");
if (mode === "--go") console.log("Use Expo Go for SDK 57 on Android/iPhone on the same Wi-Fi. This tests the JS/game flow; native startup must also be checked with a native build.");
for (const [command, commandArgs, cwd] of commands) run(command, commandArgs, cwd);
