import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { OPEN_SOURCE_ARENA_FAMILIES, openSourceArenaArt } from "../packages/game-assets/src/openSourceArt";
const root = path.resolve("packages/game-assets/files");
const source = path.join(root, "wallpapers/open-source/source/open-source-arenas-sheet-v1.png");
const grid = await sharp(source).resize(960, 540, { fit: "fill", kernel: "nearest" }).png().toBuffer();
for (const [index, family] of OPEN_SOURCE_ARENA_FAMILIES.entries()) {
  const key = openSourceArenaArt(family);
  const bytes = await sharp(grid).extract({ left: index % 3 * 320, top: Math.floor(index / 3) * 180, width: 320, height: 180 }).png({ palette: true, colours: 128, dither: 0 }).toBuffer();
  const target = path.join(root, key); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, bytes);
  const native = path.join(root, "wallpapers/mobile", key.replaceAll("/", "--"));
  await sharp(bytes).resize(640, 360, { kernel: "nearest" }).png({ palette: true, colours: 128, dither: 0 }).toFile(native);
}
console.log("Prepared nine 320x180 ecosystem arenas and nine native derivatives from the generated background sheet.");
