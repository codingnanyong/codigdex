import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAREER_REGION_MONSTERS,
  monstersForCareerRegion,
} from "@codigdex/game-content/domain/careerRegionMonsters";
import { findStage, stageStatus } from "@codigdex/game-content/domain/chapters";
import { buildDexEntries } from "@/lib/phaser/dex/entry";
import { applyCapture, EMPTY_DEX_STATE } from "@codigdex/game-core/domain/dex/capture";
import { CAREER_PATHS } from "@/lib/phaser/worldMap/careerPaths";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

describe("career-region monster checkpoints", () => {
  it("matches five ordered monsters to every career map", () => {
    Object.values(CAREER_PATHS).forEach((career) => {
      career.regions.forEach((region) => {
        const monsters = monstersForCareerRegion(region.id);
        expect(monsters, `${career.jobId}/${region.id}`).toHaveLength(5);
        expect(monsters.map((monster) => monster.level)).toEqual([1, 2, 3, 4, 5]);
      });
    });
  });

  it("points every checkpoint at an existing individual monster image", () => {
    Object.values(CAREER_REGION_MONSTERS).flat().forEach((monster) => {
      expect(fs.existsSync(path.join(PUBLIC_DIR, monster.assetPath)), monster.assetPath).toBe(true);
    });
  });

  it("assigns stable, unique dex numbers after the common-path entries", () => {
    const dexNumbers = Object.values(CAREER_REGION_MONSTERS)
      .flat()
      .map(({ dexNumber }) => dexNumber);

    expect(dexNumbers).toEqual(
      Array.from({ length: 100 }, (_, index) => String(index + 11).padStart(3, "0"))
    );
    expect(new Set(dexNumbers)).toHaveLength(100);
  });

  it("maps the frontend testing destination to the shared testing set", () => {
    expect(monstersForCareerRegion("frontend-testing")).toBe(CAREER_REGION_MONSTERS.testing);
  });

  it("gives every monster its own complete bilingual quiz pool", () => {
    const monsters = Object.values(CAREER_REGION_MONSTERS).flat();
    const quizSignatures = new Set<string>();

    monsters.forEach((monster) => {
      expect(monster.name.ko.length).toBeGreaterThan(0);
      expect(monster.name.en.length).toBeGreaterThan(0);
      expect(monster.name.ko).not.toBe(monster.name.en);
      expect(monster.quizPool).toHaveLength(8);
      (["ko", "en"] as const).forEach((locale) => {
        const prompts = monster.quizPool.map((question) => question.prompt[locale]);
        expect(new Set(prompts).size, monster.id).toBe(prompts.length);
      });
      monster.quizPool.forEach((question) => {
        expect(question.choices).toHaveLength(4);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(4);
      });
      quizSignatures.add(monster.quizPool.map((question) => question.prompt.en).join("|"));
    });

    expect(monsters).toHaveLength(100);
    expect(quizSignatures.size).toBe(100);
  });

  it("unlocks career monsters one at a time and exposes them to the standard battle lookup", () => {
    const monsters = CAREER_REGION_MONSTERS.react;
    const chapter = findStage(monsters[0].id).chapter;
    const captured = new Set<string>();

    expect(monsters.map((_, index) => stageStatus(chapter, index, captured))).toEqual([
      "available", "locked", "locked", "locked", "locked",
    ]);
    captured.add(monsters[0].id);
    expect(monsters.map((_, index) => stageStatus(chapter, index, captured))).toEqual([
      "cleared", "available", "locked", "locked", "locked",
    ]);
    expect(findStage(monsters[4].id).monster).toBe(monsters[4]);
  });

  it("registers a captured career monster in the visible dex", () => {
    const monster = CAREER_REGION_MONSTERS["html-css"][0];
    const captured = applyCapture(EMPTY_DEX_STATE, monster);
    const entry = buildDexEntries(captured.cards).find((candidate) => candidate.monster?.id === monster.id);

    expect(entry?.card?.id).toBe(monster.id);
    expect(entry?.planned).toBe(false);
  });
});
