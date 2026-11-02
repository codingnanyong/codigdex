import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CHAPTERS, DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_CHAPTERS } from "@codigdex/game-content/domain/chapters/career";
import { SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { MASTER_CHAPTERS } from "@codigdex/game-content/domain/masterChapters";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourceEvolutionFor } from "@codigdex/game-content/domain/openSourceChapters";
import { evolutionIdentity } from "@codigdex/game-content/domain/secondaryEvolutionIds";
import { openSourceIdentity } from "@codigdex/game-content/domain/openSourceEvolutionIds";
import { DEFAULT_JOB, JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { PROMOTION_MISSIONS } from "@codigdex/game-content/domain/promotionChapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";

const root = path.resolve("packages/game-assets/files");
const archiveRoot = path.join(root, "monsters/archives");
await mkdir(archiveRoot, { recursive: true }); await mkdir("qa/art", { recursive: true });
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const label = (lines: string[], width: number, height: number) => Buffer.from(`<svg width="${width}" height="${height}"><style>text{font:13px monospace;fill:#f6e9cd}</style>${lines.map((copy, index) => `<text x="8" y="${18 + index * 19}"${copy.length * 8 > width - 16 ? ` textLength="${width - 16}" lengthAdjust="spacingAndGlyphs"` : ""}>${escape(copy)}</text>`).join("")}</svg>`);
type Row = { title: string; stages: readonly MonsterDefinition[] };
const sections: { id: string; title: string; rows: Row[] }[] = [
  { id: "common-primary", title: "COMMON + PRIMARY | No.000-110 | Each row is one evolution family", rows: [...CHAPTERS, ...CAREER_CHAPTERS].map((chapter) => ({ title: chapter.name.en, stages: chapter.stages })) },
  { id: "secondary", title: "SECONDARY | No.111-235 | 25 species x 5 evolution forms", rows: SECONDARY_REGIONS.map((region) => ({ title: `${region.jobId} / ${region.label.en}`, stages: region.chapter.stages })) },
  { id: "tertiary", title: "TERTIARY | No.236-260 | 25 independent guardians (not evolution rows)", rows: MASTER_CHAPTERS.map((chapter) => ({ title: chapter.name.en, stages: chapter.stages })) },
  { id: "open-source", title: "OPEN SOURCE | No.261-450 | Each tool evolves independently", rows: OPEN_SOURCE_CATALOG.map((entry) => ({ title: `${entry.name} / ${entry.character.name.en}`, stages: openSourceEvolutionFor(entry.id) })) },
];
const listed = sections.flatMap(({ rows }) => rows.flatMap(({ stages }) => stages.map(({ id }) => id)));
if (listed.length !== DEX_MONSTERS.length || new Set(listed).size !== listed.length || DEX_MONSTERS.some(({ id }) => !listed.includes(id))) throw new Error("Archive omits or duplicates dex entries");
const pages: Buffer[] = [];
for (const section of sections) {
  const height = 68 + section.rows.length * 174;
  const layers: sharp.OverlayOptions[] = [{ input: label([section.title], 1000, 42), left: 10, top: 8 }];
  for (let row = 0; row < section.rows.length; row++) {
    const entry = section.rows[row], top = 68 + row * 174;
    layers.push({ input: label([entry.title], 990, 28), left: 8, top });
    for (let col = 0; col < entry.stages.length; col++) {
      const monster = entry.stages[col], left = col * 198 + 14;
      layers.push({ input: await sharp(path.join(root, monster.assetKey)).resize(104, 104, { kernel: "nearest" }).png().toBuffer(), left: left + 40, top: top + 26 });
      layers.push({ input: label([`No.${monster.dexNumber} | Lv.${monster.level}`, monster.name.en], 190, 44), left, top: top + 128 });
    }
    for (let col = entry.stages.length; col < 5; col++) layers.push({ input: label(["N/A"], 190, 44), left: col * 198 + 14, top: top + 80 });
  }
  const image = await sharp({ create: { width: 1000, height, channels: 4, background: "#302c3b" } }).composite(layers).png({ palette: true, colours: 128 }).toBuffer();
  pages.push(image); await writeFile(path.join(archiveRoot, `${section.id}-evolution-guide-v2.png`), image);
}
let top = 0;
const allLayers = [];
for (const page of pages) { allLayers.push({ input: page, left: 0, top }); top += (await sharp(page).metadata()).height!; }
await sharp({ create: { width: 1000, height: top, channels: 4, background: "#302c3b" } }).composite(allLayers).png({ palette: true, colours: 128 }).toFile(path.join(root, "monsters/all-monster-evolution-guide-v2.png"));

const audit = [];
for (const monster of DEX_MONSTERS) {
  const bytes = await readFile(path.join(root, monster.assetKey));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3] >= 128 ? 255 : 0;
  audit.push({ id: monster.id, dexNumber: monster.dexNumber, level: monster.level, name: monster.name, assetKey: monster.assetKey,
    family: evolutionIdentity(monster.id)?.coreId ?? openSourceIdentity(monster.id)?.toolId ?? monster.id,
    rgbaSha256: createHash("sha256").update(data).digest("hex"), alphaSha256: createHash("sha256").update(alpha).digest("hex"), width: info.width, height: info.height });
}
const groups = (key: "rgbaSha256" | "alphaSha256") => [...Map.groupBy(audit, (entry) => entry[key]).values()].filter((entries) => entries.length > 1).map((entries) => entries.map(({ id }) => id));
const exactPixelDuplicates = groups("rgbaSha256"), sameSilhouetteCandidates = groups("alphaSha256");
if (exactPixelDuplicates.length) throw new Error(`Duplicate canonical images: ${JSON.stringify(exactPixelDuplicates)}`);
const numbers = audit.map(({ dexNumber }) => Number(dexNumber));
if (numbers.some((n, index) => n !== index)) throw new Error("Dex numbers are not contiguous");
await writeFile("qa/art/dex-asset-audit.json", JSON.stringify({ count: audit.length, range: [audit[0].dexNumber, audit.at(-1)!.dexNumber], archiveIds: listed, exactPixelDuplicates, sameSilhouetteCandidates, entries: audit }, null, 2) + "\n");

const people = [DEFAULT_JOB, ...JOB_OPTIONS].flatMap((job) => [job.assetKey!, job.guideAssetKey!]);
people.push(...Object.values(PROMOTION_MISSIONS).map(({ guideAssetKey }) => guideAssetKey));
const portraits = [...new Set(people)];
const portraitLayers = [];
for (let i = 0; i < portraits.length; i++) {
  const left = i % 5 * 198, y = Math.floor(i / 5) * 170;
  portraitLayers.push({ input: await sharp(path.join(root, portraits[i])).resize(128, 128, { fit: "contain", kernel: "nearest" }).png().toBuffer(), left: left + 34, top: y });
  portraitLayers.push({ input: label([portraits[i].split("/").at(-2)!, portraits[i].split("/").at(-1)!], 195, 40), left, top: y + 128 });
}
await sharp({ create: { width: 1000, height: Math.ceil(portraits.length / 5) * 170, channels: 4, background: "#302c3b" } }).composite(portraitLayers).png({ palette: true, colours: 128 }).toFile(path.join(root, "characters/career-path/character-collection-guide-v3.png"));
console.log(`Archived ${audit.length} numbered monsters exactly once; ${portraits.length} existing player/guide portraits. Exact pixel duplicates: 0; silhouette candidates: ${sameSilhouetteCandidates.length}.`);
