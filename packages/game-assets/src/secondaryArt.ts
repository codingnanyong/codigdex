/** Rendering-only keys, shared by the asset bundler and both clients. */
export const SECONDARY_ART_JOBS = ["platform-engineer", "fullstack-engineer", "ml-developer", "mlops-engineer", "analytics-engineer"] as const;
export const secondaryAtlasArt = (id: string) => `wallpapers/secondary-careers/${id}/atlas-v1.png`;
export const secondaryRegionArt = (id: string, region: number) => `wallpapers/secondary-careers/${id}/region-${region + 1}-v1.png`;
export const secondaryTerrainArt = (id: string, region: number) => `wallpapers/secondary-careers/${id}/terrain-${region + 1}-v1.png`;
export const SECONDARY_MOBILE_ART = SECONDARY_ART_JOBS.flatMap((id) => [secondaryAtlasArt(id), ...Array.from({ length: 5 }, (_, i) => secondaryRegionArt(id, i)), ...Array.from({ length: 5 }, (_, i) => secondaryTerrainArt(id, i))]);
