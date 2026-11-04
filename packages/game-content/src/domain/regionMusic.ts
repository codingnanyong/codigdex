import { CAREER_PATHS, careerChapterWallpaperAssetKey } from "./careerPaths";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { SECONDARY_REGIONS } from "./secondaryExploration";
import { PROMOTION_CHAPTERS } from "./promotionChapters";
import { MASTER_CHAPTERS } from "./masterChapters";
import { OPEN_SOURCE_FAMILIES, findOpenSource } from "./openSourceCatalog";
import { openSourceIdentity } from "./openSourceEvolutionIds";
import { evolutionIdentity } from "./secondaryEvolutionIds";
import { findStage } from "./chapters";

const primary = Object.values(CAREER_PATHS).flatMap(path => path.regions.map(region => ({
  id: `career:${path.jobId}:${region.id}`, asset: careerChapterWallpaperAssetKey(path, region),
  career: path.jobId, stages: monstersForCareerRegion(region.id).map(m => m.id),
})));
export const REGION_MUSIC_ARTWORK = new Map<string, string>([
  ...primary.map(({ id, asset }): [string,string] => [asset,id]),
  ...SECONDARY_REGIONS.map(r => [r.chapter.arena!.assetKey, `secondary:${r.jobId}:${r.id}`] as [string,string]),
  ...PROMOTION_CHAPTERS.map(c => [c.arena!.assetKey,c.id] as [string,string]),
  ...MASTER_CHAPTERS.map(c => [c.arena!.assetKey,c.id] as [string,string]),
  ...Object.keys(OPEN_SOURCE_FAMILIES).map(f => [`wallpapers/open-source/${f}-arena-v1.png`,`source:${f}`] as [string,string]),
  ["wallpapers/tutorial-loop-forest-v1.png", "common:tutorial"],
  ["wallpapers/git-battle-arena-v1.png", "common:git"],
  ["wallpapers/linux-battle-arena-v1.png", "common:linux"],
]);
export function musicRegionForView(scene: string, artwork?: string): string | undefined {
  if (scene === "intro") return "hub:title";
  if (scene === "codigdex") return "hub:dex";
  if (["job-select", "secondary-atlas"].includes(scene)) return "hub:career";
  if (["world-map", "path-map"].includes(scene)) return "hub:world";
  if (scene === "settings") return undefined; // Keep the underlying region playing.
  if (!artwork) return undefined; // Loading should not restart the previous track.
  return REGION_MUSIC_ARTWORK.get(artwork);
}
export function musicRegionForStage(stageId: string | undefined, career: string): string {
  if (!stageId) return "hub:world";
  const source = openSourceIdentity(stageId);
  if (source) return findOpenSource(source.toolId) ? `source:${findOpenSource(source.toolId)!.family}` : "hub:world";
  const secondary = evolutionIdentity(stageId);
  if (secondary) return `secondary:${secondary.jobId}:${secondary.coreId}`;
  if (stageId.startsWith("mastery:")) return stageId.split(":").slice(0,2).join(":");
  const region = primary.find(r => r.career === career && r.stages.includes(stageId));
  if (region) return region.id;
  try {
    const chapter = findStage(stageId).chapter.id;
    if (["tutorial", "git", "linux"].includes(chapter)) return `common:${chapter}`;
  } catch { /* Older saves can contain a removed checkpoint. */ }
  return "hub:world";
}
