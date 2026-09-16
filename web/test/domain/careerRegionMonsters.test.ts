import { describe, expect, it } from "vitest";
import { isAssetKey } from "@codigdex/game-assets/manifest";
import {
  CAREER_REGION_MONSTERS,
  monstersForCareerRegion,
} from "@codigdex/game-content/domain/careerRegionMonsters";
import { findStage, stageStatus } from "@codigdex/game-content/domain/chapters";
import { buildDexEntries } from "@/lib/phaser/dex/entry";
import { applyCapture, EMPTY_DEX_STATE } from "@codigdex/game-core/domain/dex/capture";
import { CAREER_PATHS } from "@/lib/phaser/worldMap/careerPaths";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { QUIZ_PACK_MANIFEST } from "@codigdex/quiz-content/manifest";

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
      expect(isAssetKey(monster.assetKey), monster.assetKey).toBe(true);
    });
  });

  it("uses corrected sprites for reported visual defects", () => {
    const byDexNumber = new Map(
      Object.values(CAREER_REGION_MONSTERS)
        .flat()
        .map((monster) => [monster.dexNumber, monster.assetKey])
    );
    const corrected = {
      "024": "monsters/ch05.http-api/portal-wardens-lv4-v2.png",
      "026": "monsters/ch06.python/script-snake-lv1-v3.png",
      "027": "monsters/ch06.python/library-coil-lv2-v3.png",
      "028": "monsters/ch06.python/data-coil-lv3-v2.png",
      "029": "monsters/ch06.python/automation-engine-lv4-v2.png",
      "030": "monsters/ch06.python/automation-seraph-lv5-v2.png",
      "031": "monsters/ch07.sql/query-mole-lv1-v2.png",
      "032": "monsters/ch07.sql/table-keeper-lv2-v3.png",
      "034": "monsters/ch07.sql/schema-warden-lv4-v2.png",
      "036": "monsters/ch08.network/packet-crab-lv1-v2.png",
      "037": "monsters/ch08.network/router-weaver-lv2-v2.png",
      "044": "monsters/ch09.testing/suite-guardian-lv4-v2.png",
      "047": "monsters/ch10.security-auth/identity-keeper-lv2-v2.png",
      "048": "monsters/ch10.security-auth/identity-keywarden-lv3-v2.png",
      "049": "monsters/ch10.security-auth/access-bastion-lv4-v2.png",
      "054": "monsters/ch11.docker/registry-carrier-lv4-v2.png",
      "057": "monsters/ch12.cicd/test-relay-lv2-v2.png",
      "061": "monsters/ch13.kubernetes/pod-cadet-lv1-v2.png",
      "062": "monsters/ch13.kubernetes/cluster-pilot-lv2-v2.png",
      "066": "monsters/ch14.cloud-iac/resource-cloud-lv1-v2.png",
      "067": "monsters/ch14.cloud-iac/plan-builder-lv2-v2.png",
      "069": "monsters/ch14.cloud-iac/infrastructure-architect-lv4-v2.png",
      "076": "monsters/ch16.react/state-sprout-lv1-v2.png",
      "077": "monsters/ch16.react/prop-pair-lv2-v2.png",
      "086": "monsters/ch18.data-pipeline/droplet-runner-lv1-v2.png",
      "087": "monsters/ch18.data-pipeline/stream-courier-lv2-v2.png",
      "088": "monsters/ch18.data-pipeline/transform-engineer-lv3-v2.png",
      "094": "monsters/ch19.orchestration/schedule-conductor-lv4-v3.png",
      "096": "monsters/ch20.statistics/sample-owl-lv1-v2.png",
      "097": "monsters/ch20.statistics/probability-reader-lv2-v2.png",
      "098": "monsters/ch20.statistics/distribution-scholar-lv3-v2.png",
      "101": "monsters/ch21.visualization/bar-chameleon-lv1-v2.png",
      "102": "monsters/ch21.visualization/chart-caster-lv2-v2.png",
      "103": "monsters/ch21.visualization/plot-artisan-lv3-v2.png",
    } as const;

    Object.entries(corrected).forEach(([dexNumber, assetKey]) => {
      expect(byDexNumber.get(dexNumber), dexNumber).toBe(assetKey);
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

  it("gives every monster its own complete bilingual quiz pool", async () => {
    const monsters = Object.values(CAREER_REGION_MONSTERS).flat();
    const quizSignatures = new Set<string>();

    for (const monster of monsters) {
      const pool = (await loadQuizPack(monster.quizPackId)).questions;
      expect(monster.name.ko.length).toBeGreaterThan(0);
      expect(monster.name.en.length).toBeGreaterThan(0);
      expect(monster.name.ko).not.toBe(monster.name.en);
      expect(pool).toHaveLength(QUIZ_PACK_MANIFEST[monster.quizPackId].questionCount);
      (["ko", "en"] as const).forEach((locale) => {
        const prompts = pool.map((question) => question.prompt[locale]);
        expect(new Set(prompts).size, monster.id).toBe(prompts.length);
      });
      pool.forEach((question) => {
        expect(question.choices).toHaveLength(4);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(4);
      });
      // Hand-authored pools follow the repo convention of writing the right
      // answer first; drawQuizQuestions shuffles the choices on every draw, so
      // the stored position never reaches a player.
      expect(new Set(pool.map((question) => question.answerIndex)).size).toBeGreaterThan(0);
      const choiceSets = pool.map((question) =>
        question.choices
          .map((choice) => choice.en)
          .sort()
          .join("|")
      );
      expect(new Set(choiceSets).size, `${monster.id} distractor sets`).toBeGreaterThan(1);
      quizSignatures.add(pool.map((question) => question.prompt.en).join("|"));
    }

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
