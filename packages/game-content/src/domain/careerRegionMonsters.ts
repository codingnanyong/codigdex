import { text } from "@codigdex/game-core/i18n/locale";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { buildCareerMonsterQuiz, careerQuizProfile } from "./careerMonsterQuizzes";
import { careerMonsterName } from "./careerMonsterNames";

export interface CareerRegionMonster extends MonsterDefinition {
  technologyId: string;
}

const FIRST_CAREER_DEX_NUMBER = 11;
const FIRST_CAREER_CHAPTER_NUMBER = 3;
const MONSTERS_PER_CAREER_CHAPTER = 5;

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
      assetKey: `monsters/${chapterFolder}/${id}-lv${index + 1}.png`,
      briefing: text(
        `${name.ko}이(가) 체크포인트를 막고 있어요. ${focus.term.ko} 지식으로 길을 열어 보세요.`,
        `${name.en} blocks the checkpoint. Use your ${focus.term.en} knowledge to open the path.`
      ),
      preBattleLine: text(
        `${focus.term.ko}의 핵심을 떠올리세요!`,
        `Remember the essentials of ${focus.term.en}!`
      ),
      quizPool: buildCareerMonsterQuiz(technologyId, index, name.en),
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
