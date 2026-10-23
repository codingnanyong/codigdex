import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

export const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const cases = JSON.parse(readFileSync(path.join(repo, "qa/home/cases.json"), "utf8"));
const children = new Set();

export function parseOptions(args, os = process.platform) {
  const options = { platform: "web", feature: "all", device: undefined, doctor: false, dryRun: false, skipBuild: false, help: false, list: false };
  const values = new Map([["--platform", "platform"], ["--feature", "feature"], ["--device", "device"]]);
  const flags = new Map([["--doctor", "doctor"], ["--dry-run", "dryRun"], ["--skip-build", "skipBuild"], ["--help", "help"], ["--list", "list"]]);
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(arg);
    if (flags.has(arg)) options[flags.get(arg)] = true;
    else if (values.has(arg)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      options[values.get(arg)] = value.toLowerCase();
      if (arg === "--device") options.device = value;
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!["web", "android", "ios", "all"].includes(options.platform)) throw new Error("Choose --platform web|android|ios|all.");
  if (options.feature !== "all" && !cases.features.some((feature) => feature.id === options.feature)) throw new Error("Unknown feature. Run npm run qa:home -- --list.");
  if (options.device && !/^[a-zA-Z0-9_.:-]+$/.test(options.device)) throw new Error("Invalid device identifier.");
  if (!options.help && !options.list && !options.dryRun && ["ios", "all"].includes(options.platform) && os !== "darwin") throw new Error("iOS Simulator requires macOS + Xcode. Run Web/Android here and iOS on your Mac.");
  if (options.platform === "all" && options.device) throw new Error("Use --device with one native platform at a time.");
  return options;
}

export function selectDevice(platform, output, requested) {
  const devices = platform === "android"
    ? output.split(/\r?\n/).map((line) => /^(\S+)\s+device(?:\s|$)/.exec(line)?.[1]).filter(Boolean)
    : Object.values(JSON.parse(output).devices).flat().filter((device) => device.state === "Booted" && device.isAvailable !== false).map((device) => device.udid);
  if (requested && !devices.includes(requested)) throw new Error(`Device ${requested} is not connected/booted. Available: ${devices.join(", ") || "none"}`);
  if (!requested && devices.length !== 1) throw new Error(`Boot one ${platform} emulator/simulator, or choose --device ID. Available: ${devices.join(", ") || "none"}`);
  return requested ?? devices[0];
}

export function reportCounts(xml) {
  const tests = (xml.match(/<testcase\b/g) ?? []).length;
  const failures = (xml.match(/<(?:failure|error)\b/g) ?? []).length;
  const skipped = (xml.match(/<skipped\b/g) ?? []).length;
  if (tests === 0 || tests === skipped) throw new Error("No tests actually ran. The run cannot be marked passed.");
  return { tests, failures, skipped, passed: tests - failures - skipped };
}

function tool(name) {
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const folder of (process.env.PATH ?? "").split(path.delimiter)) for (const extension of extensions) {
    const candidate = path.join(folder.replace(/^"|"$/g, ""), name + extension);
    if (existsSync(candidate)) return candidate;
  }
  if (name === "adb") {
    const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? (process.platform === "darwin" ? path.join(process.env.HOME ?? "", "Library/Android/sdk") : path.join(process.env.LOCALAPPDATA ?? "", "Android/Sdk"));
    const candidate = path.join(sdk, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb");
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Missing ${name}. ${name === "maestro" ? "Install Maestro CLI 2.11+ and Java 17+: https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli" : "Install/configure the platform tools and add them to PATH."}`);
}

export function commandFor(command, args, os = process.platform) {
  if (os !== "win32" || !/\.(cmd|bat)$/i.test(command)) return [command, args];
  // cmd expands metacharacters even inside quotes. Reject them rather than execute user input.
  const parts = [command, ...args];
  if (parts.some((part) => /["%!&|<>^\r\n]/.test(part))) throw new Error("Windows batch paths/arguments must not contain shell metacharacters.");
  return [process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", '"' + parts.map((part) => `"${part}"`).join(" ") + '"']];
}

function capture(command, args = [], cwd = repo) {
  const [binary, argv] = commandFor(command, args);
  const result = spawnSync(binary, argv, { cwd, encoding: "utf8", windowsHide: true, windowsVerbatimArguments: process.platform === "win32" && /\.(cmd|bat)$/i.test(command) });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed: ${result.stderr || result.stdout}`);
  return (result.stdout || result.stderr).trim();
}

function start(command, args, { cwd = repo, env, log }) {
  const [binary, argv] = commandFor(command, args);
  const output = createWriteStream(log);
  const child = spawn(binary, argv, { cwd, env, windowsHide: true, windowsVerbatimArguments: process.platform === "win32" && /\.(cmd|bat)$/i.test(command), stdio: ["ignore", "pipe", "pipe"] });
  children.add(child);
  child.stdout.on("data", (chunk) => { process.stdout.write(chunk); output.write(chunk); });
  child.stderr.on("data", (chunk) => { process.stderr.write(chunk); output.write(chunk); });
  child.completed = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => { children.delete(child); output.end(); resolve({ code, signal }); });
  });
  // A background server can fail before the caller starts waiting for it.
  child.completed.catch(() => {});
  return child;
}

async function run(command, args, context) {
  const result = await start(command, args, context).completed;
  if (result.code !== 0) throw new Error(`${path.basename(command)} exited ${result.code ?? result.signal}. See ${context.log}`);
}

function stop(child) {
  if (!children.has(child) || !child.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" });
  else child.kill("SIGTERM");
}

async function unusedPort(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () => reject(new Error(`Port ${port} is already in use. Stop the existing test/Metro server first.`)));
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}

async function waitMetro(child) {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    if (!children.has(child)) throw new Error("Metro stopped before it was ready. See metro.log.");
    try {
      const response = await fetch("http://127.0.0.1:8081/status", { signal: AbortSignal.timeout(1500) });
      if ((await response.text()).includes("packager-status:running")) return;
    } catch { /* Startup is asynchronous. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Metro did not become ready within 180 seconds.");
}

export function plan(options) {
  return {
    platforms: options.platform === "all" ? ["web", "android", "ios"] : [options.platform],
    feature: options.feature,
    nativeFlows: cases.nativeFlows.filter((flow) => options.feature === "all" || flow.feature === options.feature).map((flow) => flow.file),
    build: !options.skipBuild,
    results: "qa-results/<timestamp>-<commit>/<platform>/",
    isolation: "Native development QA save only; Web uses fresh Playwright browser contexts. No clearState or keychain clearing.",
    deferred: cases.deferred,
  };
}

function doctor(platforms) {
  if (Number(process.versions.node.split(".")[0]) !== 22) throw new Error("Use Node.js 22.x.");
  for (const module of ["expo/bin/cli", "tsx/dist/cli.mjs", "@playwright/test/cli.js"]) if (!existsSync(path.join(repo, "node_modules", module))) throw new Error("Run npm ci in the repository root first.");
  const tools = {};
  if (platforms.some((platform) => platform !== "web")) {
    tools.maestro = tool("maestro");
    tools.java = tool("java");
    const java = capture(tools.java, ["-version"]);
    const javaVersion = /version "(\d+)/.exec(java);
    if (!javaVersion || Number(javaVersion[1]) < 17) throw new Error("Configure Java 17 or newer before running Maestro/native builds.");
    const version = capture(tools.maestro, ["--version"]);
    const match = /(\d+)\.(\d+)\.(\d+)/.exec(version);
    if (!match || Number(match[1]) < 2 || (Number(match[1]) === 2 && Number(match[2]) < 11)) throw new Error("Install Maestro CLI 2.11.0 or newer.");
    console.log(`Maestro ${version}`);
  }
  if (platforms.includes("android")) tools.adb = tool("adb");
  if (platforms.includes("ios")) {
    tools.xcrun = tool("xcrun");
    tools.pod = tool("pod");
    capture(tools.xcrun, ["--find", "xcodebuild"]);
    capture(tools.pod, ["--version"]);
  }
  return tools;
}

export async function main(args) {
  const options = parseOptions(args);
  if (options.help) {
    console.log(`Home feature QA (Node 22.x)\n\nnpm run qa:home -- --list\nnpm run qa:home -- --platform web --feature cod-235\nnpm run qa:home -- --platform android --feature all\nnpm run qa:home -- --platform ios --feature all\nnpm run qa:home -- --platform all --feature all  (Mac with Android SDK + Xcode)\n\nOptions: --doctor, --dry-run, --device ID, --skip-build (installed native app required).\nBoot the emulator/simulator first. Native tests build/install a debug app and manage Metro automatically.\nInstall once: npm ci; npx playwright install chromium. Native: Maestro CLI 2.11+, Java 17+, Android Studio or Mac/Xcode/CocoaPods.\nMaestro setup: https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli\nResults: qa-results/ (logs, screenshots, JUnit, HTML and run.json). Cloud login/sync remains deferred.`);
    return;
  }
  if (options.list) { console.table(cases.features); return; }
  const execution = plan(options);
  if (options.dryRun) { console.log(JSON.stringify(execution, null, 2)); return; }
  const tools = doctor(execution.platforms);
  if (options.doctor) {
    if (tools.adb) console.log(capture(tools.adb, ["devices"]));
    if (tools.xcrun) console.log(capture(tools.xcrun, ["simctl", "list", "devices", "booted"]));
    console.log("Tool checks passed. Run the selected platform without --doctor to build and test.");
    return;
  }
  const sha = capture("git", ["rev-parse", "HEAD"]);
  const branch = capture("git", ["branch", "--show-current"]);
  const dirty = Boolean(capture("git", ["status", "--porcelain"]));
  const revision = sha + (dirty ? "-dirty" : "");
  const directory = path.join(repo, "qa-results", `${new Date().toISOString().replace(/[:.]/g, "-")}-${sha.slice(0, 7)}`);
  mkdirSync(directory, { recursive: true });
  const summary = { branch, commit: sha, dirty, feature: options.feature, startedAt: new Date().toISOString(), buildSkipped: options.skipBuild, results: [], deferred: cases.deferred };
  const env = { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1", NEXT_TELEMETRY_DISABLED: "1", EXPO_PUBLIC_QA: "1", EXPO_PUBLIC_E2E: "1", EXPO_PUBLIC_E2E_REVISION: revision,
    NEXT_PUBLIC_E2E: "1", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", EXPO_PUBLIC_SUPABASE_URL: "", EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    MAESTRO_CLI_NO_ANALYTICS: "true", MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true" };
  let failed = false;
  try {
    await run(process.execPath, [path.join(repo, "node_modules/tsx/dist/cli.mjs"), "scripts/generate-home-qa.mts", "--check"], { env, log: path.join(directory, "cases.log") });
    for (const platform of execution.platforms) {
      const folder = path.join(directory, platform);
      mkdirSync(folder);
      const result = { platform, status: "running", startedAt: new Date().toISOString() };
      summary.results.push(result);
      let metro;
      try {
        if (platform === "web") {
          await unusedPort(3002);
          const webEnv = { ...env, QA_RESULTS_DIR: folder };
          await run(process.execPath, [path.join(repo, "node_modules/@playwright/test/cli.js"), "test", "--config", "web/playwright.home.config.ts", ...(options.feature === "all" ? [] : ["--grep", `@${options.feature}\\b`])], { env: webEnv, log: path.join(folder, "test.log") });
        } else {
          const listing = platform === "android" ? capture(tools.adb, ["devices"]) : capture(tools.xcrun, ["simctl", "list", "devices", "booted", "--json"]);
          result.device = selectDevice(platform, listing, options.device);
          await unusedPort(8081);
          const mobile = path.join(repo, "mobile");
          await run(process.execPath, ["scripts/generate-asset-map.mjs"], { cwd: mobile, env, log: path.join(folder, "assets.log") });
          metro = start(process.execPath, [path.join(repo, "node_modules/expo/bin/cli"), "start", "--dev-client", "--localhost", "--port", "8081", "--clear"], { cwd: mobile, env: { ...env, EXPO_OFFLINE: "1" }, log: path.join(folder, "metro.log") });
          await waitMetro(metro);
          if (platform === "android") capture(tools.adb, ["-s", result.device, "reverse", "tcp:8081", "tcp:8081"]);
          if (!options.skipBuild) {
            if (platform === "ios") await run(tools.pod, ["install"], { cwd: path.join(mobile, "ios"), env, log: path.join(folder, "pods.log") });
            await run(process.execPath, [path.join(repo, "node_modules/expo/bin/cli"), `run:${platform}`, "--device", result.device, "--no-bundler"], { cwd: mobile, env, log: path.join(folder, "build.log") });
          }
          await run(tools.maestro, ["--device", result.device, "--platform", platform, "test", "--format", "JUNIT", "--output", path.join(folder, "junit.xml"), "--test-output-dir", path.join(folder, "screenshots"), "--debug-output", path.join(folder, "debug"), "-e", `QA_BUILD=${revision}`, ...execution.nativeFlows.map((file) => path.join(repo, file))], { env, log: path.join(folder, "test.log") });
        }
        result.counts = reportCounts(readFileSync(path.join(folder, "junit.xml"), "utf8"));
        result.expectedTests = execution.nativeFlows.length;
        if (result.counts.failures || result.counts.skipped || result.counts.passed !== result.expectedTests) throw new Error(`Expected ${result.expectedTests} passing tests without skips; got ${JSON.stringify(result.counts)}.`);
        result.status = "passed";
      } catch (error) {
        result.status = "failed";
        result.error = error.message;
        const report = path.join(folder, "junit.xml");
        if (existsSync(report)) {
          try { result.counts = reportCounts(readFileSync(report, "utf8")); }
          catch (reportError) { result.reportError = reportError.message; }
        }
        failed = true;
        console.error(`${platform}: ${error.message}`);
      } finally {
        if (metro) { stop(metro); await metro.completed; }
        result.finishedAt = new Date().toISOString();
        writeFileSync(path.join(directory, "run.json"), JSON.stringify(summary, null, 2));
      }
    }
  } finally {
    for (const child of children) stop(child);
    summary.finishedCommit = capture("git", ["rev-parse", "HEAD"]);
    summary.dirtyAtFinish = Boolean(capture("git", ["status", "--porcelain"]));
    summary.sourceChanged = summary.finishedCommit !== sha || (!dirty && summary.dirtyAtFinish);
    if (summary.sourceChanged) console.error("Source changed during QA (possibly Podfile.lock after the first iOS build). Commit the change and re-run before comparing platforms.");
    summary.finishedAt = new Date().toISOString();
    summary.status = !failed && !summary.sourceChanged && summary.results.length === execution.platforms.length && summary.results.every((result) => result.status === "passed") ? "passed" : "failed";
    writeFileSync(path.join(directory, "run.json"), JSON.stringify(summary, null, 2));
    console.log(`QA ${summary.status}: ${directory}`);
  }
  if (summary.status !== "passed") throw new Error("QA failed. Inspect run.json and the platform logs.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => { for (const child of children) stop(child); process.exit(signal === "SIGINT" ? 130 : 143); });
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
