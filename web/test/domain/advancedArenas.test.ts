import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { MASTER_CHAPTERS } from "@codigdex/game-content/domain/masterChapters";
import { SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourceEvolutionFor } from "@codigdex/game-content/domain/openSourceChapters";
import { findStage } from "@codigdex/game-content/domain/chapters";

const root = path.resolve(import.meta.dirname, "../../../packages/game-assets/files");
const png = (key: string) => readFileSync(path.join(root, key));
const dimensions = (bytes: Buffer) => [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];

it("gives all five tertiary careers unique source/runtime/native backgrounds and five real stages", () => {
  const hashes = new Set<string>();
  for (const chapter of MASTER_CHAPTERS) {
    const key = chapter.arena!.assetKey;
    expect(chapter.stages.map(({ level }) => level)).toEqual([1, 2, 3, 4, 5]);
    expect(key).toBe(`wallpapers/mastery/${chapter.id.slice(8)}-arena-v1.png`);
    const bytes = png(key);
    expect(dimensions(bytes)).toEqual([320, 180]);
    expect(dimensions(png(`wallpapers/mobile/${key.replaceAll("/", "--")}`))).toEqual([640, 360]);
    expect(png(key.replace("-arena-v1.png", "-source-v1.png").replace("mastery/", "mastery/source/")).length).toBeGreaterThan(bytes.length);
    hashes.add(createHash("sha256").update(bytes).digest("hex"));
    for (const stage of chapter.stages) expect(findStage(stage.id).chapter.arena).toEqual(chapter.arena);
  }
  expect(hashes.size).toBe(5);
});

it("resolves all 125 secondary and 190 open-source stages to their family arena", () => {
  for (const region of SECONDARY_REGIONS) {
    expect(region.chapter.stages.map(({ level }) => level)).toEqual([1, 2, 3, 4, 5]);
    expect(dimensions(png(region.chapter.arena!.assetKey))).toEqual([960, 540]);
    for (const stage of region.chapter.stages) expect(findStage(stage.id).chapter.arena).toEqual(region.chapter.arena);
  }
  for (const entry of OPEN_SOURCE_CATALOG) for (const stage of openSourceEvolutionFor(entry.id)) {
    expect(findStage(stage.id).chapter.arena?.assetKey).toBe(`wallpapers/open-source/${entry.family}-arena-v1.png`);
  }
});
