import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
const root = path.resolve("packages/game-assets/files");
const report = [];
for (const entry of OPEN_SOURCE_CATALOG) {
  const oldKey = `characters/open-source/${entry.id}-v1.png`, key = entry.character.assetKey!;
  const source = path.resolve(root, oldKey), target = path.resolve(root, key);
  if (![source, target].every((file) => file.startsWith(root + path.sep))) throw new Error("Asset outside source tree");
  const original = await readFile(source).catch(() => undefined);
  if (original) { await mkdir(path.dirname(target), { recursive: true }); await rename(source, target); }
  const bytes = await readFile(target);
  if (original && !original.equals(bytes)) throw new Error(`Migration changed art: ${entry.id}`);
  report.push({ id: entry.id, oldKey, assetKey: key, sha256: createHash("sha256").update(bytes).digest("hex") });
}
await mkdir("qa/art", { recursive: true });
await writeFile("qa/art/open-source-art-relocation.json", JSON.stringify(report, null, 2) + "\n");
console.log(`Relocated ${report.length} original images without changing bytes.`);
