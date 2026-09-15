// Mirrors @codigdex/game-assets/files into public/assets so Next.js serves
// every asset key at /assets/<key>. Runs before dev and build; unchanged files
// are skipped and files removed from the package are removed here too.
import { copyFile, mkdir, readFile, readdir, rm, rmdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sourceRoot = path.join(path.dirname(require.resolve("@codigdex/game-assets/package.json")), "files");
const targetRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/assets");

async function listFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, entryPath)));
    else files.push(path.relative(root, entryPath));
  }
  return files;
}

const sourceFiles = await listFiles(sourceRoot);
const wanted = new Set(sourceFiles);
let copied = 0;
let removed = 0;

for (const file of sourceFiles) {
  const from = path.join(sourceRoot, file);
  const to = path.join(targetRoot, file);
  const [source, target] = await Promise.all([
    readFile(from),
    readFile(to).catch(() => undefined),
  ]);
  if (target?.equals(source)) continue;
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
  copied += 1;
}

const targetFiles = await listFiles(targetRoot).catch((error) => {
  if (error?.code === "ENOENT") return [];
  throw error;
});

for (const file of targetFiles) {
  if (wanted.has(file)) continue;
  await rm(path.join(targetRoot, file));
  removed += 1;
  // Drop folders the removal emptied; rmdir refuses non-empty ones.
  for (let dir = path.dirname(path.join(targetRoot, file)); dir !== targetRoot; dir = path.dirname(dir)) {
    if (!(await rmdir(dir).then(() => true, () => false))) break;
  }
}

console.log(`Synced game assets: ${copied} copied, ${removed} removed, ${sourceFiles.length} total.`);
