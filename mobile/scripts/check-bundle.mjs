import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(mobile, "..");
const manifest = await readFile(path.join(repo, "packages/game-assets/src/manifest.generated.ts"), "utf8");
const allKeys = [...manifest.matchAll(/^  "([^"]+)",$/gm)].map((match) => match[1]);
const generated = await readFile(path.join(mobile, "src/assets.generated.ts"), "utf8");
const keys = [...generated.matchAll(/^  "([^"]+)": require\(/gm)].map((match) => match[1]);
const size = async (key) => (await stat(path.join(repo, "packages/game-assets/files", key))).size;
const allBytes = (await Promise.all(allKeys.map(size))).reduce((sum, value) => sum + value, 0);
const bundledBytes = (await Promise.all(keys.map(size))).reduce((sum, value) => sum + value, 0);
const limitBytes = 8 * 1024 * 1024;
if (bundledBytes > limitBytes) throw new Error(`Mobile source assets exceed the 8 MiB budget: ${bundledBytes} bytes`);
if (keys.some((key) => !key.startsWith("monsters/") || !allKeys.includes(key))) throw new Error("Unexpected asset in the mobile map");
const report = { allAssets: allKeys.length, mobileAssets: keys.length, allBytes, bundledBytes, savedBytes: allBytes - bundledBytes, limitBytes };
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--write")) {
  await mkdir(path.join(mobile, ".tmp-qa"), { recursive: true });
  await writeFile(path.join(mobile, ".tmp-qa/asset-report.json"), JSON.stringify(report, null, 2) + "\n");
}
