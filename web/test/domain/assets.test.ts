import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/lib/domain/chapters";
import { CAREER_EMBLEMS } from "@/lib/domain/careerDex";
import { TECHNOLOGY_SPECIMENS } from "@/lib/domain/technologySpecimens";
import {
  CAREER_CHARACTER_GUIDE_ASSET_PATH,
  DEFAULT_JOB,
  JOB_OPTIONS,
  OVERWORLD_PLAYER_ASSET_PATH,
} from "@/lib/domain/player/jobs";
import { WORLD_BACKDROPS } from "@/lib/phaser/worldMap/progression";
import {
  CAREER_PATHS,
  careerTerrainAssetPath,
} from "@/lib/phaser/worldMap/careerPaths";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

/**
 * Art gets reorganized outside the code (folders renamed, files moved), and a
 * stale path only shows up as a 404 once someone reaches that scene. Every
 * asset path the domain hands to Phaser has to exist under public/.
 */
const referencedAssets = [
  DEFAULT_JOB.assetPath!,
  DEFAULT_JOB.guideAssetPath!,
  CAREER_CHARACTER_GUIDE_ASSET_PATH,
  OVERWORLD_PLAYER_ASSET_PATH,
  ...Object.values(CAREER_EMBLEMS),
  ...JOB_OPTIONS.flatMap((job) => [job.assetPath, job.guideAssetPath]),
  ...Object.values(TECHNOLOGY_SPECIMENS).map((specimen) => specimen.assetPath),
  ...WORLD_BACKDROPS.map((backdrop) => backdrop.assetPath),
  ...Object.values(CAREER_PATHS).flatMap((careerPath) =>
    careerPath.regions.map((region) => careerTerrainAssetPath(careerPath, region))
  ),
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

  it("keeps each career player and guide together in its character folder", () => {
    expect(DEFAULT_JOB.assetPath).toBe(
      "/assets/characters/career-path/junior/player-v2.png"
    );
    expect(DEFAULT_JOB.guideAssetPath).toBe(
      "/assets/characters/career-path/junior/guide-v1.png"
    );
    expect(DEFAULT_JOB.assetPath).not.toBe(DEFAULT_JOB.guideAssetPath);
    JOB_OPTIONS.forEach((job) => {
      expect(job.assetPath).toBe(`/assets/characters/career-path/${job.id}/player-v2.png`);
      expect(job.guideAssetPath).toBe(`/assets/characters/career-path/${job.id}/guide-v1.png`);
    });
  });
});
