import { describe, expect, it } from "vitest";
import { OPEN_SOURCE_CATALOG, OPEN_SOURCE_FAMILIES, filterOpenSources, findOpenSource, openSourcesForRegion } from "@codigdex/game-content/domain/openSourceCatalog";
import { PROMOTION_OPEN_SOURCE_IDS, openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";
import { PROMOTION_CHAPTERS } from "@codigdex/game-content/domain/promotionChapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";

describe("open-source learning notes", () => {
  it("covers the requested first-wave data tools with original bilingual creature concepts and official sources", () => {
    const required = ["hadoop", "hdfs", "yarn", "mapreduce", "hive", "airflow", "kafka", "spark", "flink", "debezium", "iceberg", "trino"];
    expect(required.every((id) => findOpenSource(id)?.priority === 1)).toBe(true);
    expect(new Set(OPEN_SOURCE_CATALOG.map(({ id }) => id)).size).toBe(OPEN_SOURCE_CATALOG.length);
    const regions = new Set(Object.values(CAREER_PATHS).flatMap(({ regions }) => regions.map(({ id }) => id)));
    for (const entry of OPEN_SOURCE_CATALOG) {
      expect(Object.hasOwn(OPEN_SOURCE_FAMILIES, entry.family)).toBe(true);
      expect(new URL(entry.officialUrl).protocol).toBe("https:");
      expect(entry.paths.every((id) => JOB_OPTIONS.some((job) => job.id === id))).toBe(true);
      expect(entry.regions.every((id) => regions.has(id))).toBe(true);
      for (const copy of [entry.role, entry.character.name, entry.character.motif]) {
        expect(copy.ko.length).toBeGreaterThan(2);
        expect(copy.en.length).toBeGreaterThan(2);
        expect(copy.ko).not.toBe(copy.en);
      }
      expect(entry.learning.ko.length).toBeGreaterThan(2);
      expect(entry.learning.en.length).toBeGreaterThan(2);
      expect(entry.character.artStatus).toBe("ready");
      expect(entry.character.assetKey).toBe(`characters/open-source/${entry.id}-v1.png`);
    }
  });
  it("distinguishes actual subcomponents from independently related projects without parent cycles", () => {
    for (const id of ["hdfs", "yarn", "mapreduce"]) {
      expect(findOpenSource(id)).toMatchObject({ kind: "component", parentId: "hadoop" });
    }
    expect(findOpenSource("kafka-connect")).toMatchObject({ kind: "component", parentId: "kafka" });
    for (const id of ["hive", "hbase", "spark", "flink", "airflow", "kafka"]) expect(findOpenSource(id)?.parentId).toBeUndefined();
    for (const entry of OPEN_SOURCE_CATALOG) {
      const seen = new Set([entry.id]);
      let parent = entry.parentId;
      while (parent) {
        expect(seen.has(parent)).toBe(false);
        seen.add(parent);
        expect(findOpenSource(parent)).toBeDefined();
        parent = findOpenSource(parent)?.parentId;
      }
    }
  });
  it("searches Korean and English roles with combined ecosystem, path and related-tool filters", () => {
    expect(filterOpenSources({ query: "  ＣＤＣ  " }).map(({ id }) => id)).toEqual(["debezium"]);
    expect(filterOpenSources({ query: "카프카" }).map(({ id }) => id)).toEqual(["kafka"]);
    expect(filterOpenSources({ query: "계보", family: "quality" }).map(({ id }) => id)).toEqual(expect.arrayContaining(["openlineage", "marquez"]));
    expect(filterOpenSources({ family: "streaming", jobId: "backend" }).map(({ id }) => id)).toEqual(["kafka", "debezium"]);
    expect(filterOpenSources({ ids: ["airflow", "kafka"], query: "kafka" }).map(({ id }) => id)).toEqual(["kafka"]);
    expect(filterOpenSources({ ids: [] })).toEqual([]);
    expect(filterOpenSources({ query: "no-such-tool-xyz" })).toEqual([]);
  });
  it("links all promotion stages to known tools and primary regions to relevant paths", () => {
    const stages = PROMOTION_CHAPTERS.flatMap(({ stages }) => stages);
    expect(Object.keys(PROMOTION_OPEN_SOURCE_IDS).sort()).toEqual(stages.map(({ id }) => id).sort());
    for (const stage of stages) {
      const ids = PROMOTION_OPEN_SOURCE_IDS[stage.id];
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
      expect(openSourcesForMonster(stage.id).map(({ id }) => id)).toEqual(ids);
    }
    expect(openSourcesForMonster("unreleased-monster")).toEqual([]);
    expect(openSourcesForRegion("orchestration", "data-engineer").map(({ id }) => id)).toContain("airflow");
    expect(openSourcesForRegion("data-pipeline", "data-engineer").map(({ id }) => id)).toContain("kafka");
    expect(openSourcesForRegion("orchestration", "frontend")).toEqual([]);
  });
});
