import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { findJob, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "../../assets";
import type { ImageAsset } from "../assetLoader";
import {
  careerChapterWallpaperAssetKey,
  careerChapterWallpaperTextureKey,
  careerPathFor,
} from "./careerPaths";

/**
 * Assets for one career region.
 *
 * All five checkpoint monsters are cached on the first visit. Their files are
 * small, and doing this once prevents the region loading screen from appearing
 * again after every successful level 1-4 battle.
 */
export function careerRegionAssets(
  careerId: JobId,
  regionId: string
): readonly ImageAsset[] {
  const path = careerPathFor(careerId);
  const job = findJob(careerId);
  const region = path.regions.find((candidate) => candidate.id === regionId) ?? path.regions[0];
  const monsters = monstersForCareerRegion(region.id);
  const assets: ImageAsset[] = [
    {
      key: careerChapterWallpaperTextureKey(path, region),
      url: assetUrl(careerChapterWallpaperAssetKey(path, region)),
    },
    ...monsters.map((monster) => ({
      key: monster.textureKey,
      url: assetUrl(monster.assetKey),
    })),
  ];
  if (job.textureKey && job.assetKey) {
    assets.push({ key: job.textureKey, url: assetUrl(job.assetKey) });
  }
  if (job.guideTextureKey && job.guideAssetKey) {
    assets.push({ key: job.guideTextureKey, url: assetUrl(job.guideAssetKey) });
  }
  return assets;
}
