import { text } from "@codigdex/game-core/i18n/locale";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { quizPackIdFor } from "@codigdex/game-core/domain/dex/quiz";
import { careerQuizProfile } from "./careerMonsterQuizzes";
import { careerMonsterName } from "./careerMonsterNames";

export interface CareerRegionMonster extends MonsterDefinition {
  technologyId: string;
}

const FIRST_CAREER_DEX_NUMBER = 11;
const FIRST_CAREER_CHAPTER_NUMBER = 3;
const MONSTERS_PER_CAREER_CHAPTER = 5;

const CAREER_MONSTER_ASSET_OVERRIDES: Readonly<Record<string, string>> = {
  "portal-wardens": "portal-wardens-lv4-v2.png",
  "script-snake": "script-snake-lv1-v3.png",
  "library-coil": "library-coil-lv2-v3.png",
  "data-coil": "data-coil-lv3-v2.png",
  "automation-engine": "automation-engine-lv4-v2.png",
  "automation-seraph": "automation-seraph-lv5-v2.png",
  "query-mole": "query-mole-lv1-v2.png",
  "table-keeper": "table-keeper-lv2-v3.png",
  "schema-warden": "schema-warden-lv4-v2.png",
  "suite-guardian": "suite-guardian-lv4-v2.png",
  "identity-keeper": "identity-keeper-lv2-v2.png",
  "registry-carrier": "registry-carrier-lv4-v2.png",
  "packet-crab": "packet-crab-lv1-v2.png",
  "router-weaver": "router-weaver-lv2-v2.png",
  "identity-keywarden": "identity-keywarden-lv3-v2.png",
  "access-bastion": "access-bastion-lv4-v2.png",
  "test-relay": "test-relay-lv2-v2.png",
  "pod-cadet": "pod-cadet-lv1-v2.png",
  "cluster-pilot": "cluster-pilot-lv2-v2.png",
  "resource-cloud": "resource-cloud-lv1-v2.png",
  "plan-builder": "plan-builder-lv2-v2.png",
  "infrastructure-architect": "infrastructure-architect-lv4-v2.png",
  "state-sprout": "state-sprout-lv1-v2.png",
  "prop-pair": "prop-pair-lv2-v2.png",
  "component-architect": "component-architect-lv5-v2.png",
  "framework-orchestrator": "framework-orchestrator-lv4-v2.png",
  "service-guardian": "service-guardian-lv5-v2.png",
  "pipeline-conductor": "pipeline-conductor-lv4-v2.png",
  "flow-architect": "flow-architect-lv5-v2.png",
  "schedule-conductor": "schedule-conductor-lv4-v3.png",
  "workflow-maestro": "workflow-maestro-lv5-v2.png",
  "droplet-runner": "droplet-runner-lv1-v2.png",
  "stream-courier": "stream-courier-lv2-v2.png",
  "transform-engineer": "transform-engineer-lv3-v2.png",
  "sample-owl": "sample-owl-lv1-v2.png",
  "probability-reader": "probability-reader-lv2-v2.png",
  "distribution-scholar": "distribution-scholar-lv3-v2.png",
  "variance-oracle": "variance-oracle-lv4-v2.png",
  "inference-guardian": "inference-guardian-lv5-v2.png",
  "bar-chameleon": "bar-chameleon-lv1-v2.png",
  "chart-caster": "chart-caster-lv2-v2.png",
  "plot-artisan": "plot-artisan-lv3-v2.png",
  "dashboard-storyteller": "dashboard-storyteller-lv4-v2.png",
  "insight-prism": "insight-prism-lv5-v2.png",
  "kpi-oracle": "kpi-oracle-lv4-v2.png",
  "decision-guardian": "decision-guardian-lv5-v2.png",
};

const set = (
  chapterNumber: number,
  technologyId: string,
  ids: readonly string[]
): readonly CareerRegionMonster[] => {
  const chapterFolder = `ch${String(chapterNumber).padStart(2, "0")}.${technologyId}`;
  const firstDexNumber =
    FIRST_CAREER_DEX_NUMBER +
    (chapterNumber - FIRST_CAREER_CHAPTER_NUMBER) * MONSTERS_PER_CAREER_CHAPTER;

  return ids.map((id, index) => {
    const name = careerMonsterName(id);
    const profile = careerQuizProfile(technologyId);
    const focus = profile.concepts[index];
    return {
      id,
      dexNumber: String(firstDexNumber + index).padStart(3, "0"),
      name,
      level: index + 1,
      classification: text(`${profile.name.ko} 학습형`, `${profile.name.en} learning type`),
      trait: focus.definition,
      description: text(
        `${name.ko}은(는) ${focus.term.ko} 개념을 지키는 몬스터입니다. ${focus.definition.ko}.`,
        `${name.en} guards the ${focus.term.en} concept. It ${focus.definition.en}.`
      ),
      snippet: focus.term,
      textureKey: `career-region-monster-${chapterFolder}-${id}`,
      assetKey: `monsters/${chapterFolder}/${
        CAREER_MONSTER_ASSET_OVERRIDES[id] ?? `${id}-lv${index + 1}.png`
      }`,
      briefing: text(
        `${name.ko}이(가) 체크포인트를 막고 있어요. ${focus.term.ko} 지식으로 길을 열어 보세요.`,
        `${name.en} blocks the checkpoint. Use your ${focus.term.en} knowledge to open the path.`
      ),
      preBattleLine: text(
        `${focus.term.ko}의 핵심을 떠올리세요!`,
        `Remember the essentials of ${focus.term.en}!`
      ),
      quizPackId: quizPackIdFor(`career:${technologyId}`, id),
      technologyId,
    };
  });
};

/** The five evolution checkpoints shown inside each career-region map. */
export const CAREER_REGION_MONSTERS = {
  "html-css": set(3, "html-css", [
    "structure-sprout",
    "style-shell",
    "cascade-weaver",
    "breakpoint-knight",
    "responsive-layout-paladin",
  ]),
  javascript: set(4, "javascript", [
    "script-spark",
    "callback-fox",
    "event-spark",
    "promise-seer",
    "async-oracle",
  ]),
  "http-api": set(5, "http-api", [
    "message-pair",
    "endpoint-messengers",
    "request-courier",
    "portal-wardens",
    "gateway-guardian",
  ]),
  python: set(6, "python", [
    "script-snake",
    "library-coil",
    "data-coil",
    "automation-engine",
    "automation-seraph",
  ]),
  sql: set(7, "sql", [
    "query-mole",
    "table-keeper",
    "join-mason",
    "schema-warden",
    "transaction-archivist",
  ]),
  network: set(8, "network", [
    "packet-crab",
    "router-weaver",
    "packet-relay",
    "network-orchestrator",
    "protocol-nexus",
  ]),
  testing: set(9, "testing", [
    "check-scout",
    "case-inspector",
    "assertion-hound",
    "suite-guardian",
    "regression-sentinel",
  ]),
  "security-auth": set(10, "security-auth", [
    "key-scale",
    "identity-keeper",
    "identity-keywarden",
    "access-bastion",
    "zero-trust-bastion",
  ]),
  docker: set(11, "docker", [
    "image-whale",
    "container-tug",
    "container-carrier",
    "registry-carrier",
    "harbor-leviathan",
  ]),
  cicd: set(12, "cicd", [
    "build-runner",
    "test-relay",
    "pipeline-relay",
    "deployment-conductor",
    "release-conductor",
  ]),
  kubernetes: set(13, "kubernetes", [
    "pod-cadet",
    "cluster-pilot",
    "pod-helmsman",
    "fleet-commander",
    "cluster-admiral",
  ]),
  "cloud-iac": set(14, "cloud-iac", [
    "resource-cloud",
    "plan-builder",
    "blueprint-builder",
    "infrastructure-architect",
    "infrastructure-titan",
  ]),
  monitoring: set(15, "monitoring", [
    "signal-owlet",
    "alert-scout",
    "metric-watcher",
    "telemetry-seer",
    "observability-oracle",
  ]),
  react: set(16, "react", [
    "state-sprout",
    "prop-pair",
    "component-weaver",
    "hook-conductor",
    "component-architect",
  ]),
  "server-framework": set(17, "server-framework", [
    "route-scout",
    "middleware-pair",
    "controller-warden",
    "framework-orchestrator",
    "service-guardian",
  ]),
  "data-pipeline": set(18, "data-pipeline", [
    "droplet-runner",
    "stream-courier",
    "transform-engineer",
    "pipeline-conductor",
    "flow-architect",
  ]),
  orchestration: set(19, "orchestration", [
    "task-spinner",
    "dependency-linker",
    "retry-weaver",
    "schedule-conductor",
    "workflow-maestro",
  ]),
  statistics: set(20, "statistics", [
    "sample-owl",
    "probability-reader",
    "distribution-scholar",
    "variance-oracle",
    "inference-guardian",
  ]),
  visualization: set(21, "visualization", [
    "bar-chameleon",
    "chart-caster",
    "plot-artisan",
    "dashboard-storyteller",
    "insight-prism",
  ]),
  "bi-tools": set(22, "bi-tools", [
    "metric-firefly",
    "report-scout",
    "dashboard-keeper",
    "kpi-oracle",
    "decision-guardian",
  ]),
} as const satisfies Record<string, readonly CareerRegionMonster[]>;

export type MonsterRegionId = keyof typeof CAREER_REGION_MONSTERS;

const REGION_ALIASES: Readonly<Record<string, MonsterRegionId>> = {
  "frontend-testing": "testing",
};

export function monstersForCareerRegion(regionId: string): readonly CareerRegionMonster[] {
  const monsterRegionId = REGION_ALIASES[regionId] ?? regionId;
  return CAREER_REGION_MONSTERS[monsterRegionId as MonsterRegionId] ?? [];
}
