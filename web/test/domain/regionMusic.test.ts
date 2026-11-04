import { describe, expect, it } from "vitest";
import { ASSET_KEYS } from "@codigdex/game-assets/manifest";
import { MUSIC_TRACKS, musicTrack } from "@codigdex/game-assets/music";
import { MUSIC_SCORES } from "@codigdex/game-assets/music-scores";
import { CAREER_PATHS, careerChapterWallpaperAssetKey } from "@codigdex/game-content/domain/careerPaths";
import { SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { MASTER_CHAPTERS } from "@codigdex/game-content/domain/masterChapters";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { musicRegionForStage, musicRegionForView } from "@codigdex/game-content/domain/regionMusic";
import { parseMusicPreferences } from "@codigdex/game-core/domain/musicPreferences";

describe("regional soundtrack coverage", () => {
  it("assigns an original melody and file to every one of the 79 destinations", () => {
    expect(MUSIC_TRACKS).toHaveLength(79);
    expect(new Set(MUSIC_TRACKS.map(t => t.region)).size).toBe(79);
    expect(new Set(MUSIC_TRACKS.map(t => t.assetKey)).size).toBe(79);
    const signatures = MUSIC_SCORES.map(s => JSON.stringify([s.motif.map(n => n - s.motif[0]), s.rhythm.map(n => n / s.rhythm.reduce((a,b) => a+b,0))]));
    expect(new Set(signatures).size).toBe(79);
    for (const track of MUSIC_TRACKS) { expect(ASSET_KEYS).toContain(track.assetKey); expect(track.duration).toBeGreaterThan(20); }
    for (const path of Object.values(CAREER_PATHS)) for (const region of path.regions) {
      expect(musicRegionForView("career-region", careerChapterWallpaperAssetKey(path, region))).toBe(`career:${path.jobId}:${region.id}`);
      expect(musicTrack(`career:${path.jobId}:${region.id}`)).toBeDefined();
    }
    for (const region of SECONDARY_REGIONS) for (const stage of region.chapter.stages) {
      expect(musicRegionForStage(stage.id, "junior")).toBe(`secondary:${region.jobId}:${region.id}`);
      expect(musicTrack(musicRegionForStage(stage.id, "junior"))).toBeDefined();
    }
    for (const chapter of MASTER_CHAPTERS) for (const stage of chapter.stages) expect(musicRegionForStage(stage.id, "junior")).toBe(chapter.id);
    for (const tool of OPEN_SOURCE_CATALOG) expect(musicRegionForStage(`open-source:${tool.id}:lv1`, "junior")).toBe(`source:${tool.family}`);
  });
  it("keeps a region's music in battle while separating shared technology across careers", () => {
    expect(musicRegionForStage("packet-crab", "backend")).toBe("career:backend:network");
    expect(musicRegionForStage("packet-crab", "devops")).toBe("career:devops:network");
    expect(musicRegionForView("settings")).toBeUndefined();
    expect(musicRegionForView("intro")).toBe("hub:title");
    expect(musicRegionForView("world-map")).toBe("hub:world");
    expect(musicRegionForStage("open-source:removed-tool", "junior")).toBe("hub:world");
    expect(musicRegionForStage("removed-checkpoint", "junior")).toBe("hub:world");
  });
  it("recovers malformed preferences and clamps stored volume", () => {
    expect(parseMusicPreferences("broken")).toEqual({ enabled: true, volume: .3 });
    expect(parseMusicPreferences('{"enabled":false,"volume":200}')).toEqual({ enabled: false, volume: 1 });
    expect(parseMusicPreferences('{"volume":-3}').volume).toBe(0);
  });
});
