import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { ASSET_KEYS, isAssetKey } from "@codigdex/game-assets/manifest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_EMBLEMS } from "@codigdex/game-content/domain/careerDex";
import { TECHNOLOGY_SPECIMENS } from "@codigdex/game-content/domain/technologySpecimens";
import {
  CAREER_CHARACTER_GUIDE_ASSET_KEY,
  DEFAULT_JOB,
  JOB_OPTIONS,
  OVERWORLD_PLAYER_ASSET_KEY,
} from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "@/lib/assets";
import { WORLD_BACKDROPS } from "@/lib/phaser/worldMap/progression";
import {
  CAREER_PATHS,
  careerChapterWallpaperAssetKey,
  careerTerrainAssetKey,
} from "@/lib/phaser/worldMap/careerPaths";

const require = createRequire(import.meta.url);
const ASSET_ROOT = path.join(
  path.dirname(require.resolve("@codigdex/game-assets/package.json")),
  "files"
);

const pngDimensions = (assetKey: string) => {
  const png = readFileSync(path.join(ASSET_ROOT, assetKey));
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};

/**
 * Art gets reorganized outside the code (folders renamed, files moved), and a
 * stale key only shows up as a 404 once someone reaches that scene. Every
 * asset key the domain hands to a renderer has to be in the game-assets
 * manifest, which `typecheck` keeps in sync with the files on disk.
 */
const referencedAssets = [
  DEFAULT_JOB.assetKey!,
  DEFAULT_JOB.guideAssetKey!,
  DEFAULT_JOB.overworldAssetKey,
  CAREER_CHARACTER_GUIDE_ASSET_KEY,
  OVERWORLD_PLAYER_ASSET_KEY,
  ...Object.values(CAREER_EMBLEMS),
  ...JOB_OPTIONS.flatMap((job) => [job.assetKey, job.guideAssetKey, job.overworldAssetKey]),
  ...Object.values(TECHNOLOGY_SPECIMENS).map((specimen) => specimen.assetKey),
  ...WORLD_BACKDROPS.map((backdrop) => backdrop.assetKey),
  ...Object.values(CAREER_PATHS).flatMap((careerPath) =>
    careerPath.regions.flatMap((region) => [
      careerTerrainAssetKey(careerPath, region),
      careerChapterWallpaperAssetKey(careerPath, region),
    ])
  ),
  ...CHAPTERS.flatMap((chapter) => [
    ...chapter.stages.map((monster) => monster.assetKey),
    ...(chapter.arena ? [chapter.arena.assetKey] : []),
  ]),
];

describe("referenced art", () => {
  it.each([...new Set(referencedAssets)])("%s is a game-assets key", (assetKey) => {
    expect(isAssetKey(assetKey)).toBe(true);
  });

  it("serves asset keys from the synced public/assets folder", () => {
    expect(assetUrl("icons/codigdex-main-icon.png")).toBe("/assets/icons/codigdex-main-icon.png");
  });

  it("keeps every non-tutorial monster family complete from specimen through Lv.5", () => {
    const monsterKeys = ASSET_KEYS.filter((key) => key.startsWith("monsters/"));
    const chapterFolders = [...new Set(monsterKeys.map((key) => key.split("/")[1]))].filter((folder) =>
      /^ch(?:0[1-9]|1\d|2[0-2])\./.test(folder)
    );

    expect(chapterFolders).toHaveLength(22);
    chapterFolders.forEach((folder) => {
      const files = monsterKeys.filter((key) => key.startsWith(`monsters/${folder}/`));
      expect(files.some((file) => file.includes("specimen")), `${folder} specimen`).toBe(true);
      for (let level = 1; level <= 5; level += 1) {
        expect(files.some((file) => file.endsWith(`-lv${level}.png`)), `${folder} Lv.${level}`).toBe(true);
      }
    });
  });

  it("keeps career monster portraits tightly normalized for dex rendering", () => {
    const portraits = ASSET_KEYS.filter((key) =>
      /^monsters\/ch(?:0[3-9]|1\d|2[0-2])\..+-lv[1-5]\.png$/.test(key)
    );

    expect(portraits).toHaveLength(100);
    portraits.forEach((assetKey) => {
      expect(pngDimensions(assetKey), assetKey).toEqual({ width: 192, height: 192 });
    });
  });

  it("keeps portraits in career folders and movable sprites in the player folder", () => {
    expect(DEFAULT_JOB.assetKey).toBe("characters/career-path/junior/player-v2.png");
    expect(DEFAULT_JOB.guideAssetKey).toBe("characters/career-path/junior/guide-v1.png");
    expect(DEFAULT_JOB.assetKey).not.toBe(DEFAULT_JOB.guideAssetKey);
    JOB_OPTIONS.forEach((job) => {
      expect(job.assetKey).toBe(`characters/career-path/${job.id}/player-v2.png`);
      expect(job.guideAssetKey).toBe(`characters/career-path/${job.id}/guide-v1.png`);
      expect(job.overworldAssetKey).toBe(`characters/player/overworld-player-${job.id}-v1.png`);
    });
  });

  it("keeps the README career-emblem archive in the published assets", () => {
    expect(isAssetKey("career-emblems/career-emblem-archive-v1.png")).toBe(true);
  });

  it("gives every primary-career chapter its own wallpaper", () => {
    const wallpapers = Object.values(CAREER_PATHS).flatMap((careerPath) =>
      careerPath.regions.map((region) =>
        careerChapterWallpaperAssetKey(careerPath, region)
      )
    );

    expect(wallpapers).toHaveLength(28);
    expect(new Set(wallpapers)).toHaveLength(28);
  });
});
