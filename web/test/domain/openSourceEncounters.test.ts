import { describe, expect, it } from "vitest";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { CHAPTERS, DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { SECONDARY_JOB_OPTIONS, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { SOURCE_CAREERS, activeSourceCareer, emptyEncounterHistory, encounterTools, planSourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";

const at = "2026-10-28T00:00:00.000Z";
const target = { scene: "world-map" as const };
export function encounterFixture(job: JobId = "frontend") {
  const save = createEmptySave("en");
  save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: at }));
  save.player.primaryJobId = job;
  const stages = CAREER_PATHS[job].regions.flatMap(({ id }) => monstersForCareerRegion(id));
  return { save, stages };
}

describe("career-integrated open-source encounters", () => {
  it("covers five primary and five earned secondary careers without changing tool identities", () => {
    expect(SOURCE_CAREERS).toHaveLength(10);
    const covered = new Set<string>();
    for (const career of SOURCE_CAREERS) {
      const tools = encounterTools(career.id);
      expect(tools[0].id).toBe(career.firstTool);
      expect(new Set(tools.map(({ id }) => id)).size).toBe(tools.length);
      expect(career.workplace.ko).not.toBe(career.workplace.en);
      for (const tool of tools) { expect(OPEN_SOURCE_CATALOG).toContain(tool); covered.add(tool.id); }
    }
    expect(covered.size).toBe(OPEN_SOURCE_CATALOG.length);
    expect(encounterTools("frontend").map(({ id }) => id)).toEqual(["tanstack-query", "zod", "playwright"]);
  });

  it("guarantees the first request for the selected role only after a new career victory", () => {
    const { save, stages } = encounterFixture();
    const after = { ...save, progress: { ...save.progress, captures: [...save.progress.captures, { id: stages[0].id, capturedAt: at }] } };
    const history = planSourceEncounter(save, after, stages[0].id, target, emptyEncounterHistory(), () => 1);
    expect(history.pending).toMatchObject({ careerId: "frontend", toolId: "tanstack-query", state: "offered", returnTo: target });
    expect(planSourceEncounter(after, after, stages[0].id, target, emptyEncounterHistory())).toEqual(emptyEncounterHistory());
    expect(planSourceEncounter(save, save, stages[0].id, target, emptyEncounterHistory())).toEqual(emptyEncounterHistory());
    expect(planSourceEncounter(createEmptySave(), save, CHAPTERS[2].stages.at(-1)!.id, target, emptyEncounterHistory())).toEqual(emptyEncounterHistory());
  });

  it("uses cooldown and chance after the first event, and never rerolls a processed capture", () => {
    const fixture = encounterFixture();
    let save = fixture.save;
    let history = emptyEncounterHistory();
    for (let index = 0; index < 4; index++) {
      const after = { ...save, progress: { ...save.progress, captures: [...save.progress.captures, { id: fixture.stages[index].id, capturedAt: at }] } };
      const next = planSourceEncounter(save, after, fixture.stages[index].id, target, history, () => 0);
      expect(!!next.pending).toBe(index === 0 || index === 3);
      expect(planSourceEncounter(save, after, fixture.stages[index].id, target, { ...next, pending: undefined }, () => 0).pending).toBeUndefined();
      history = { ...next, pending: undefined };
      save = after;
    }
  });

  it("does not offer already captured tools or open-source victories as new triggers", () => {
    const { save, stages } = encounterFixture();
    save.progress.captures.push(...encounterTools("frontend").map(({ id }) => ({ id: `open-source:${id}`, capturedAt: at })));
    const after = { ...save, progress: { ...save.progress, captures: [...save.progress.captures, { id: stages[0].id, capturedAt: at }] } };
    expect(planSourceEncounter(save, after, stages[0].id, target, emptyEncounterHistory()).pending).toBeUndefined();
    expect(planSourceEncounter(save, after, "open-source:zod", target, emptyEncounterHistory()).pending).toBeUndefined();
    expect(DEX_MONSTERS).toHaveLength(174);
  });

  it("allows practice victories after mastery and guarantees a new offer by the sixth eligible win", () => {
    const { save, stages } = encounterFixture();
    save.progress.captures.push({ id: stages[0].id, capturedAt: at });
    let history = planSourceEncounter(save, save, stages[0].id, target, emptyEncounterHistory(), () => 1, "first-battle");
    expect(history.pending).toBeDefined();
    history = { ...history, pending: undefined };
    expect(planSourceEncounter(save, save, stages[0].id, target, history, () => 0, "first-battle").pending).toBeUndefined();
    for (let index = 1; index <= 6; index++) {
      history = planSourceEncounter(save, save, stages[0].id, target, history, () => 1, `practice-${index}`);
      expect(!!history.pending).toBe(index === 6);
    }
  });

  it("has no junior encounters and prefers only legitimately earned secondary roles", () => {
    expect(activeSourceCareer(createEmptySave())).toBeUndefined();
    const { save } = encounterFixture("backend");
    save.player.secondaryJobId = "platform-engineer";
    expect(activeSourceCareer(save)).toBe("backend");
    for (const job of SECONDARY_JOB_OPTIONS) {
      const seed = encounterFixture(job.requires[0]).save;
      seed.progress.captures.push(...job.requires.flatMap((id) => CAREER_PATHS[id].regions.flatMap(({ id }) => monstersForCareerRegion(id))).map(({ id }) => ({ id, capturedAt: at })));
      const selected = selectSecondaryCareer(seed, job.id);
      const trigger = promotionChapterFor(job.id)!.stages[0].id;
      const after = { ...selected, progress: { ...selected.progress, captures: [...selected.progress.captures, { id: trigger, capturedAt: at }] } };
      expect(planSourceEncounter(selected, after, trigger, { scene: "promotion-chapter", data: { jobId: job.id } }, emptyEncounterHistory()).pending?.careerId).toBe(job.id);
    }
  });
});
