import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WALLPAPERS } from "../../packages/game-assets/src/visuals.ts";
import { SECONDARY_MOBILE_ART } from "../../packages/game-assets/src/secondaryArt.ts";
import { OPEN_SOURCE_MOBILE_ART } from "../../packages/game-assets/src/openSourceArt.ts";

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(mobile, "..");
const manifest = await readFile(path.join(repo, "packages/game-assets/src/manifest.generated.ts"), "utf8");
const allKeys = [...manifest.matchAll(/^  "([^"]+)",$/gm)].map((match) => match[1]);
const generated = await readFile(path.join(mobile, "src/assets.generated.ts"), "utf8");
const imports = [...generated.matchAll(/^  "([^"]+)": \(\) => require\("\.\.\/\.\.\/packages\/game-assets\/files\/([^"]+)"\),$/gm)];
if (/": require\(/.test(generated)) throw new Error("Mobile images must resolve lazily");
const keys = imports.map((match) => match[1]);
const importedFiles = imports.map((match) => match[2]);
if (importedFiles.some((key) => key.includes("..") || !allKeys.includes(key))) throw new Error("Invalid or missing native derivative");
const size = async (key) => (await stat(path.join(repo, "packages/game-assets/files", key))).size;
const allBytes = (await Promise.all(allKeys.map(size))).reduce((sum, value) => sum + value, 0);
const bundledBytes = (await Promise.all(importedFiles.map(size))).reduce((sum, value) => sum + value, 0);
// The four shared web originals replace separate native artwork.
const limitBytes = 14 * 1024 * 1024;
if (bundledBytes > limitBytes) throw new Error(`Mobile source images exceed the 14 MiB budget: ${bundledBytes} bytes`);
if (keys.some((key) => !(key.startsWith("monsters/") || /^characters\/promotion\/[^/]+\/guide-v1\.png$/.test(key) || Object.values(WALLPAPERS).includes(key) || SECONDARY_MOBILE_ART.includes(key) || OPEN_SOURCE_MOBILE_ART.includes(key)) || !allKeys.includes(key))) throw new Error("Unexpected asset in the mobile map");
const fontBytes = await size("fonts/Galmuri14.ttf");
const audioMap = await readFile(path.join(mobile, "src/audio.generated.ts"), "utf8");
const audioKeys = [...audioMap.matchAll(/^  "([^"]+)": \(\) => require/gm)].map(match => match[1]);
if (audioKeys.length !== allKeys.filter(key => key.startsWith("audio/music/") && key.endsWith(".mp3")).length || audioKeys.some(key => !allKeys.includes(key))) throw new Error("Incomplete mobile music map");
const audioBytes = (await Promise.all(audioKeys.map(size))).reduce((sum, bytes) => sum + bytes, 0);
const audioLimitBytes = 20 * 1024 * 1024;
if (audioBytes > audioLimitBytes) throw new Error("Mobile music exceeds its 20 MiB source budget");
const totalLimitBytes = 20 * 1024 * 1024;
if (bundledBytes + fontBytes > totalLimitBytes) throw new Error("Mobile images and pixel font exceed the 20 MiB combined source budget");
const javascriptLimitBytes = 6 * 1024 * 1024;
const javascriptBundles = await Promise.all(["android", "ios"].map(async platform => {
  const directory = path.join(mobile, ".tmp-expo-export", platform);
  const metadata = JSON.parse(await readFile(path.join(directory, "metadata.json"), "utf8"));
  const files = metadata.fileMetadata[platform];
  if (files.assets.filter(asset => asset.ext === "mp3").length !== audioKeys.length) throw new Error(`Missing offline audio in ${platform} export`);
  const bytes = (await stat(path.join(directory, files.bundle))).size;
  if (bytes > javascriptLimitBytes) throw new Error(`${platform} JavaScript exceeds its 6 MiB budget`);
  return { platform, bytes };
}));
const report = { allAssets: allKeys.length, mobileAssets: keys.length, musicTracks: audioKeys.length, allBytes, bundledBytes, fontBytes, audioBytes, totalBytes: bundledBytes + fontBytes + audioBytes, savedBytes: allBytes - bundledBytes - fontBytes - audioBytes, limitBytes, totalLimitBytes, audioLimitBytes, javascriptLimitBytes, javascriptBundles };
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--write")) {
  await mkdir(path.join(mobile, ".tmp-qa"), { recursive: true });
  await writeFile(path.join(mobile, ".tmp-qa/asset-report.json"), JSON.stringify(report, null, 2) + "\n");
}
