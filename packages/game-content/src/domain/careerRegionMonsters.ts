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
  files: readonly string[]
): readonly CareerRegionMonster[] => {
  const chapterFolder = `ch${String(chapterNumber).padStart(2, "0")}.${technologyId}`;
  const firstDexNumber =
    FIRST_CAREER_DEX_NUMBER +
    (chapterNumber - FIRST_CAREER_CHAPTER_NUMBER) * MONSTERS_PER_CAREER_CHAPTER;

  return files.map((file, index) => {
    const id = file.replace(/-lv\d+\.png$/, "");
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
      assetPath: `/assets/monsters/${chapterFolder}/${file}`,
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
    "structure-sprout-lv1.png",
    "style-shell-lv2.png",
    "cascade-weaver-lv3.png",
    "breakpoint-knight-lv4.png",
    "responsive-layout-paladin-lv5.png",
  ]),
  javascript: set(4, "javascript", [
    "script-spark-lv1.png",
    "callback-fox-lv2.png",
    "event-spark-lv3.png",
    "promise-seer-lv4.png",
    "async-oracle-lv5.png",
  ]),
  "http-api": set(5, "http-api", [
    "message-pair-lv1.png",
    "endpoint-messengers-lv2.png",
    "request-courier-lv3.png",
    "portal-wardens-lv4.png",
    "gateway-guardian-lv5.png",
  ]),
  python: set(6, "python", [
    "script-snake-lv1.png",
    "library-coil-lv2.png",
    "data-coil-lv3.png",
    "automation-engine-lv4.png",
    "automation-seraph-lv5.png",
  ]),
  sql: set(7, "sql", [
    "query-mole-lv1.png",
    "table-keeper-lv2.png",
    "join-mason-lv3.png",
    "schema-warden-lv4.png",
    "transaction-archivist-lv5.png",
  ]),
  network: set(8, "network", [
    "packet-crab-lv1.png",
    "router-weaver-lv2.png",
    "packet-relay-lv3.png",
    "network-orchestrator-lv4.png",
    "protocol-nexus-lv5.png",
  ]),
  testing: set(9, "testing", [
    "check-scout-lv1.png",
    "case-inspector-lv2.png",
    "assertion-hound-lv3.png",
    "suite-guardian-lv4.png",
    "regression-sentinel-lv5.png",
  ]),
  "security-auth": set(10, "security-auth", [
    "key-scale-lv1.png",
    "identity-keeper-lv2.png",
    "identity-keywarden-lv3.png",
    "access-bastion-lv4.png",
    "zero-trust-bastion-lv5.png",
  ]),
  docker: set(11, "docker", [
    "image-whale-lv1.png",
    "container-tug-lv2.png",
    "container-carrier-lv3.png",
    "registry-carrier-lv4.png",
    "harbor-leviathan-lv5.png",
  ]),
  cicd: set(12, "cicd", [
    "build-runner-lv1.png",
    "test-relay-lv2.png",
    "pipeline-relay-lv3.png",
    "deployment-conductor-lv4.png",
    "release-conductor-lv5.png",
  ]),
  kubernetes: set(13, "kubernetes", [
    "pod-cadet-lv1.png",
    "cluster-pilot-lv2.png",
    "pod-helmsman-lv3.png",
    "fleet-commander-lv4.png",
    "cluster-admiral-lv5.png",
  ]),
  "cloud-iac": set(14, "cloud-iac", [
    "resource-cloud-lv1.png",
    "plan-builder-lv2.png",
    "blueprint-builder-lv3.png",
    "infrastructure-architect-lv4.png",
    "infrastructure-titan-lv5.png",
  ]),
  monitoring: set(15, "monitoring", [
    "signal-owlet-lv1.png",
    "alert-scout-lv2.png",
    "metric-watcher-lv3.png",
    "telemetry-seer-lv4.png",
    "observability-oracle-lv5.png",
  ]),
  react: set(16, "react", [
    "state-sprout-lv1.png",
    "prop-pair-lv2.png",
    "component-weaver-lv3.png",
    "hook-conductor-lv4.png",
    "component-architect-lv5.png",
  ]),
  "server-framework": set(17, "server-framework", [
    "route-scout-lv1.png",
    "middleware-pair-lv2.png",
    "controller-warden-lv3.png",
    "framework-orchestrator-lv4.png",
    "service-guardian-lv5.png",
  ]),
  "data-pipeline": set(18, "data-pipeline", [
    "droplet-runner-lv1.png",
    "stream-courier-lv2.png",
    "transform-engineer-lv3.png",
    "pipeline-conductor-lv4.png",
    "flow-architect-lv5.png",
  ]),
  orchestration: set(19, "orchestration", [
    "task-spinner-lv1.png",
    "dependency-linker-lv2.png",
    "retry-weaver-lv3.png",
    "schedule-conductor-lv4.png",
    "workflow-maestro-lv5.png",
  ]),
  statistics: set(20, "statistics", [
    "sample-owl-lv1.png",
    "probability-reader-lv2.png",
    "distribution-scholar-lv3.png",
    "variance-oracle-lv4.png",
    "inference-guardian-lv5.png",
  ]),
  visualization: set(21, "visualization", [
    "bar-chameleon-lv1.png",
    "chart-caster-lv2.png",
    "plot-artisan-lv3.png",
    "dashboard-storyteller-lv4.png",
    "insight-prism-lv5.png",
  ]),
  "bi-tools": set(22, "bi-tools", [
    "metric-firefly-lv1.png",
    "report-scout-lv2.png",
    "dashboard-keeper-lv3.png",
    "kpi-oracle-lv4.png",
    "decision-guardian-lv5.png",
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
