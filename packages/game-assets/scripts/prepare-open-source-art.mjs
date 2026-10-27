import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const sourceFlag = process.argv.indexOf("--sources");
if (sourceFlag < 0 || !process.argv[sourceFlag + 1]) throw new Error("Usage: node prepare-open-source-art.mjs --sources <generation-metadata-directory>");
const sources = path.resolve(process.argv[sourceFlag + 1]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../files");
const names = (await readdir(sources)).filter((name) => name.endsWith(".json")).sort();
const jobs = await Promise.all(names.map(async (name) => JSON.parse(await readFile(path.join(sources, name), "utf8"))));
for (const job of jobs) {
  if (!/^[a-z0-9-]+$/.test(job.id) || job.assetKey !== `characters/open-source/${job.id}-v1.png`) throw new Error(`Invalid asset identity: ${job.id}`);
  const target = path.join(root, job.assetKey);
  await mkdir(path.dirname(target), { recursive: true });
  const { data, info } = await sharp(job.source).trim()
    .resize(56, 56, { fit: "contain", background: "#00000000", kernel: "nearest" })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: "#00000000" })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Binary alpha prevents palette quantization from tinting the transparent border.
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = data[i + 3] < 128 ? 0 : 255;
    if (!data[i + 3]) data.fill(0, i, i + 3);
  }
  const grid = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ palette: true, colours: 16, dither: 0 }).toBuffer();
  await sharp(grid).resize(256, 256, { kernel: "nearest" }).png({ palette: true, colours: 16, dither: 0 }).toFile(target);
}
console.log(`Prepared ${jobs.length} open-source character sprites.`);

const reportFlag = process.argv.indexOf("--preview-dir");
if (reportFlag >= 0 && process.argv[reportFlag + 1]) {
  const previews = path.resolve(process.argv[reportFlag + 1]);
  await mkdir(previews, { recursive: true });
  const ordered = jobs.toSorted((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  async function sheet(items, columns, output) {
    if (!items.length) return;
    const panels = await Promise.all(items.map(async (job, i) => ({ input: await sharp(path.join(root, job.assetKey)).png().toBuffer(), left: i % columns * 256, top: Math.floor(i / columns) * 256 })));
    await sharp({ create: { width: columns * 256, height: Math.ceil(items.length / columns) * 256, channels: 4, background: "#34374c" } })
      .composite(panels).png().toFile(path.join(previews, output));
  }
  await sheet(ordered, 8, "oss-character-contact.png");
  for (let i = 0; i < ordered.length; i += 12) await sheet(ordered.slice(i, i + 12), 4, `oss-character-contact-${i / 12 + 1}.png`);
  await writeFile(path.join(previews, "oss-art-export.json"), JSON.stringify(ordered.map(({ id, name, assetKey, source, prompt }) => ({ id, name, assetKey, source, prompt })), null, 2));
}
