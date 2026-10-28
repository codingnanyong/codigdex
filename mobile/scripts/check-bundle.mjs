import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WALLPAPERS } from "../../packages/game-assets/src/visuals.ts";

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(mobile, "..");
const manifest = await readFile(path.join(repo, "packages/game-assets/src/manifest.generated.ts"), "utf8");
const allKeys = [...manifest.matchAll(/^  "([^"]+)",$/gm)].map((match) => match[1]);
const generated = await readFile(path.join(mobile, "src/assets.generated.ts"), "utf8");
const keys = [...generated.matchAll(/^  "([^"]+)": require\(/gm)].map((match) => match[1]);
const size = async (key) => (await stat(path.join(repo, "packages/game-assets/files", key))).size;
const allBytes = (await Promise.all(allKeys.map(size))).reduce((sum, value) => sum + value, 0);
const bundledBytes = (await Promise.all(keys.map(size))).reduce((sum, value) => sum + value, 0);
// The four shared web originals replace separate native artwork.
const limitBytes = 14 * 1024 * 1024;
if (bundledBytes > limitBytes) throw new Error(`Mobile source images exceed the 14 MiB budget: ${bundledBytes} bytes`);
if (keys.some((key) => !(key.startsWith("monsters/") || /^characters\/promotion\/[^/]+\/guide-v1\.png$/.test(key) || /^characters\/open-source\/[a-z0-9-]+-v1\.png$/.test(key) || Object.values(WALLPAPERS).includes(key)) || !allKeys.includes(key))) throw new Error("Unexpected asset in the mobile map");
const fontBytes = await size("fonts/Galmuri14.ttf");
const totalLimitBytes = 20 * 1024 * 1024;
if (bundledBytes + fontBytes > totalLimitBytes) throw new Error("Mobile images and pixel font exceed the 20 MiB combined source budget");
const report = { allAssets: allKeys.length, mobileAssets: keys.length, allBytes, bundledBytes, fontBytes, totalBytes: bundledBytes + fontBytes, savedBytes: allBytes - bundledBytes - fontBytes, limitBytes, totalLimitBytes };
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--write")) {
  await mkdir(path.join(mobile, ".tmp-qa"), { recursive: true });
  await writeFile(path.join(mobile, ".tmp-qa/asset-report.json"), JSON.stringify(report, null, 2) + "\n");
}
