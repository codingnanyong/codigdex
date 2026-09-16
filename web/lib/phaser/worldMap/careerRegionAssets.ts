import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { findJob, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "../../assets";
import type { ImageAsset } from "../assetLoader";
import {
  careerChapterWallpaperAssetKey,
  careerChapterWallpaperTextureKey,
  careerPathFor,
} from "./careerPaths";

/** The smallest useful bundle for opening one career region. */
export function careerRegionAssets(
  careerId: JobId,
  regionId: string,
  captured: ReadonlySet<string>
): readonly ImageAsset[] {
  const path = careerPathFor(careerId);
  const job = findJob(careerId);
  const region = path.regions.find((candidate) => candidate.id === regionId) ?? path.regions[0];
  const monsters = monstersForCareerRegion(region.id);
  const firstUncaptured = monsters.findIndex((monster) => !captured.has(monster.id));
  const activeIndex = firstUncaptured === -1 ? monsters.length - 1 : firstUncaptured;
  const visibleMonsters = monsters.filter(
    (monster, index) => captured.has(monster.id) || index === activeIndex
  );
  const assets: ImageAsset[] = [
    {
      key: careerChapterWallpaperTextureKey(path, region),
      url: assetUrl(careerChapterWallpaperAssetKey(path, region)),
    },
    { key: job.textureKey!, url: assetUrl(job.assetKey!) },
    ...visibleMonsters.map((monster) => ({
      key: monster.textureKey,
      url: assetUrl(monster.assetKey),
    })),
  ];
  if (job.guideTextureKey && job.guideAssetKey) {
    assets.push({ key: job.guideTextureKey, url: assetUrl(job.guideAssetKey) });
  }
  return assets;
}
