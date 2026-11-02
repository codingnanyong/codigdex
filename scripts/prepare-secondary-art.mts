import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { SECONDARY_CAREER_ORDER } from "@codigdex/game-content/domain/secondaryEvolutionIds";
import { MASTER_CHAPTERS } from "@codigdex/game-content/domain/masterChapters";
import { WALLPAPERS } from "../packages/game-assets/src/visuals";
import { SECONDARY_MOBILE_ART } from "../packages/game-assets/src/secondaryArt";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourceArtKey } from "@codigdex/game-content/domain/openSourceEvolutionIds";

const root = path.resolve("packages/game-assets/files");
const output = async (key: string, bytes: Buffer) => { await mkdir(path.dirname(path.join(root, key)), { recursive: true }); await writeFile(path.join(root, key), bytes); };
const png = { palette: true, colours: 128, effort: 10 } as const;

// Select connected opaque components by their centroid, rather than cutting
// wings at the nominal grid edge. Detached tiny generation specks are omitted.
async function sprites(key: string, activeRows = 5) {
  const { data, info } = await sharp(path.join(root, key)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const visited = new Uint8Array(w * h);
  const cells: number[][] = Array.from({ length: 25 }, () => []);
  for (let start = 0; start < visited.length; start++) {
    if (visited[start] || data[start * 4 + 3] < 32) continue;
    const queue = [start]; visited[start] = 1; let sx = 0, sy = 0;
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i], x = p % w, y = Math.floor(p / w); sx += x; sy += y;
      for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (n >= 0 && !visited[n] && data[n * 4 + 3] >= 32) { visited[n] = 1; queue.push(n); }
      }
    }
    if (queue.length < 45) continue;
    const col = Math.min(4, Math.floor(sx / queue.length / w * 5));
    const row = Math.min(4, Math.floor(sy / queue.length / h * 5));
    cells[row * 5 + col].push(...queue);
  }
  return Promise.all(cells.slice(0, activeRows * 5).map(async (pixels, index) => {
    if (pixels.length < 250) throw new Error(`Empty/merged sprite ${key} cell ${index}`);
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (const p of pixels) { const x = p % w, y = Math.floor(p / w); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const width = x1 - x0 + 1, height = y1 - y0 + 1;
    const raw = Buffer.alloc(width * height * 4);
    for (const p of pixels) { const target = ((Math.floor(p / w) - y0) * width + p % w - x0) * 4; data.copy(raw, target, p * 4, p * 4 + 4); }
    return { raw, width, height };
  }));
}
async function tile(sprite: Awaited<ReturnType<typeof sprites>>[number], size: number) {
  const image = await sharp(sprite.raw, { raw: { width: sprite.width, height: sprite.height, channels: 4 } })
    .resize(Math.floor(size / 4), Math.floor(size / 4), { fit: "inside", kernel: "nearest" }).png({ palette: true, colours: 16, dither: 0 }).toBuffer();
  const grid = await sharp({ create: { width: 64, height: 64, channels: 4, background: "#00000000" } }).composite([{ input: image, gravity: "centre" }]).ensureAlpha().raw().toBuffer();
  for (let p = 0; p < grid.length; p += 4) { grid[p + 3] = grid[p + 3] < 128 ? 0 : 255; if (!grid[p + 3]) grid.fill(0, p, p + 3); }
  return sharp(grid, { raw: { width: 64, height: 64, channels: 4 } }).resize(256, 256, { kernel: "nearest" }).png({ palette: true, colours: 16, dither: 0 }).toBuffer();
}
for (const job of SECONDARY_CAREER_ORDER) {
  const key = `monsters/secondary-evolutions/${job}/${job}-evolution-sheet-v1.png`;
  const cells = await sprites(key);
  const regions = SECONDARY_REGIONS.filter(({ jobId }) => jobId === job);
  for (const region of regions) for (let lv = 1; lv <= 4; lv++) {
    await output(region.chapter.stages[lv - 1].assetKey, await tile(cells[region.index * 5 + lv - 1], [128, 158, 188, 216][lv - 1]));
  }
  const source = path.join(root, `wallpapers/secondary-careers/source/${job}-atlas-source-v1.png`);
  const atlas = await sharp(source).resize(960, 540, { fit: "fill", kernel: "nearest" }).png(png).toBuffer();
  await output(regions[0].atlasAssetKey, atlas);
  for (const region of regions) {
    const points = region.outline.map(([x, y]) => `${x},${y}`).join(" ");
    const mask = Buffer.from(`<svg width="960" height="540"><polygon points="${points}" fill="white"/></svg>`);
    await output(region.terrainAssetKey, await sharp(atlas).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png(png).toBuffer());
    const [x, y] = region.center;
    const left = Math.max(0, Math.min(560, x - 200)), top = Math.max(0, Math.min(270, y - 135));
    await output(region.chapter.arena!.assetKey, await sharp(atlas).extract({ left, top, width: 400, height: 270 }).resize(960, 540, { fit: "cover", kernel: "nearest" }).png(png).toBuffer());
  }
}
const masters = await sprites("monsters/mastery/master-guardians-concept-sheet-v3.png");
for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) await output(MASTER_CHAPTERS[row].stages[col].assetKey, await tile(masters[row * 5 + col], 224));

for (let start = 0; start < OPEN_SOURCE_CATALOG.length; start += 5) {
  const cells = await sprites(`monsters/open-source/reference/oss-group-${start / 5 + 1}-evolution-sheet-v1.png`, Math.min(5, OPEN_SOURCE_CATALOG.length - start));
  for (let row = 0; row < Math.min(5, OPEN_SOURCE_CATALOG.length - start); row++) {
    const entry = OPEN_SOURCE_CATALOG[start + row];
    for (let level = 1; level <= 4; level++) await output(openSourceArtKey(entry.family, entry.id, level), await tile(cells[row * 5 + level - 1], [128, 158, 188, 216][level - 1]));
  }
}

// Keep native artwork offline while avoiding full-resolution wallpaper imports.
for (const key of new Set([...Object.values(WALLPAPERS), ...SECONDARY_MOBILE_ART])) {
  const bytes = await sharp(path.join(root, key)).resize(640, 360, { fit: "cover", kernel: "nearest" }).png(png).toBuffer();
  await output(`wallpapers/mobile/${key.replaceAll("/", "--")}`, bytes);
}
await readFile(path.join(root, MASTER_CHAPTERS[0].stages[0].assetKey));
console.log("Prepared 100 secondary + 152 OSS evolution sprites, 25 distinct master guardians, 5 atlases, 25 terrain lifts, 25 regional wallpapers and native derivatives.");
