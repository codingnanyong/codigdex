import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TERTIARY_JOB_OPTIONS } from "../packages/game-content/src/domain/player/jobs";

const root = path.resolve("packages/game-assets/files");
for (const { id } of TERTIARY_JOB_OPTIONS) {
  const key = `wallpapers/mastery/${id}-arena-v1.png`;
  const source = path.join(root, `wallpapers/mastery/source/${id}-source-v1.png`);
  const bytes = await sharp(source).resize(320, 180, { fit: "fill", kernel: "nearest" }).png({ palette: true, colours: 128, dither: 0 }).toBuffer();
  await writeFile(path.join(root, key), bytes);
  await mkdir(path.join(root, "wallpapers/mobile"), { recursive: true });
  await sharp(bytes).resize(640, 360, { kernel: "nearest" }).png({ palette: true, colours: 128, dither: 0 }).toFile(path.join(root, "wallpapers/mobile", key.replaceAll("/", "--")));
}
console.log("Prepared five tier-three arena backgrounds and native derivatives.");
