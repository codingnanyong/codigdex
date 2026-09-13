import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/lib/domain/chapters";
import { TECHNOLOGY_SPECIMENS } from "@/lib/domain/technologySpecimens";
import { JOB_OPTIONS } from "@/lib/domain/player/jobs";
import { WORLD_BACKDROPS } from "@/lib/phaser/worldMap/progression";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

/**
 * Art gets reorganized outside the code (folders renamed, files moved), and a
 * stale path only shows up as a 404 once someone reaches that scene. Every
 * asset path the domain hands to Phaser has to exist under public/.
 */
const referencedAssets = [
  "/assets/npcs/lupi-guide-v1.png",
  ...JOB_OPTIONS.flatMap((job) => [job.assetPath, job.guideAssetPath]),
  ...Object.values(TECHNOLOGY_SPECIMENS).map((specimen) => specimen.assetPath),
  ...WORLD_BACKDROPS.map((backdrop) => backdrop.assetPath),
  ...CHAPTERS.flatMap((chapter) => [
    ...chapter.stages.map((monster) => monster.assetPath),
    ...(chapter.arena ? [chapter.arena.assetPath] : []),
  ]),
];

describe("referenced art", () => {
  it.each([...new Set(referencedAssets)])("%s exists under public/", (assetPath) => {
    expect(existsSync(path.join(PUBLIC_DIR, assetPath))).toBe(true);
  });

  it("keeps every non-tutorial monster family complete from specimen through Lv.5", () => {
    const monsterRoot = path.join(PUBLIC_DIR, "assets/monsters");
    const chapterFolders = readdirSync(monsterRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^ch(?:0[1-9]|1\d|2[0-2])\./.test(entry.name))
      .map((entry) => entry.name);

    expect(chapterFolders).toHaveLength(22);
    chapterFolders.forEach((folder) => {
      const files = readdirSync(path.join(monsterRoot, folder));
      expect(files.some((file) => file.includes("specimen")), `${folder} specimen`).toBe(true);
      for (let level = 1; level <= 5; level += 1) {
        expect(files.some((file) => file.endsWith(`-lv${level}.png`)), `${folder} Lv.${level}`).toBe(true);
      }
    });
  });
});
