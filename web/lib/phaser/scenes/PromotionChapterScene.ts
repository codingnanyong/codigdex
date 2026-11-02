import Phaser from "phaser";
import { promotionMissionFor } from "@codigdex/game-content/domain/promotionChapters";
import { canSelectSecondaryJob, findSecondaryJob, findTertiaryJob, findJob, tertiaryJobsFor } from "@codigdex/game-content/domain/player/jobs";
import { completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { captureIds, canSelectSecondaryCareer, isSecondaryStudyComplete, promotionCheckpoints, selectSecondaryCareer, nextWorkshopPhase, canStartMasterProject, masterCheckpoints, selectTertiaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { masterMissionFor } from "@codigdex/game-content/domain/masterChapters";
import { assetUrl } from "../../assets";
import { applySaveToRegistry, snapshotRegistry } from "../registryAdapter";
import { lt, sceneLocale } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { createHomeButton } from "../navigation";
import { openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";
import { showOpenSourceNotes } from "../openSourceNotes";
import { discoveredSourceIds } from "../openSourceEvents";
import { drawFiveStageRoute } from "../fiveStageRoute";

/** The chapter itself is the promotion confirmation and persistent mission log. */
export class PromotionChapterScene extends Phaser.Scene {
  private jobId = "platform-engineer";
  private selectedId?: string;
  constructor() { super("promotion-chapter"); }
  init(data?: { jobId?: string; monsterId?: string }) {
    this.jobId = data?.jobId ?? "platform-engineer";
    this.selectedId = data?.monsterId;
  }
  preload() {
    const mission = promotionMissionFor(this.jobId) ?? masterMissionFor(this.jobId);
    if (!mission) return;
    const { chapter } = mission;
    const queued = queueImages(this, [
      { key: chapter.arena!.textureKey, url: assetUrl(chapter.arena!.assetKey) },
      { key: `guide-${this.jobId}`, url: assetUrl(mission.guideAssetKey) },
      ...chapter.stages.map(({ textureKey, assetKey }) => ({ key: textureKey, url: assetUrl(assetKey) })),
    ]);
    showLoadingScreen(this, queued, chapter.label);
  }
  create() {
    const mission = promotionMissionFor(this.jobId) ?? masterMissionFor(this.jobId);
    const chapter = mission?.chapter;
    const secondary = findSecondaryJob(this.jobId);
    const tertiary = findTertiaryJob(this.jobId);
    const job = secondary ?? tertiary;
    const save = snapshotRegistry(this.registry);
    const captured = captureIds(save);
    if (!mission || !chapter || !job || !isCommonPathComplete(captured) ||
      (secondary && (!canSelectSecondaryJob(secondary, completedCareerPathIds(captured)) || (!canSelectSecondaryCareer(save, secondary.id) && !isSecondaryStudyComplete(save, secondary.id)))) ||
      (tertiary && !canStartMasterProject(save, tertiary.id))) {
      this.scene.start("job-select"); return;
    }
    const ko = sceneLocale(this) === "ko";
    const equipped = !!tertiary || save.player.secondaryJobId === job.id;
    const reviewOnly = !!secondary && !equipped && !canSelectSecondaryCareer(save, secondary.id);
    if (secondary && equipped) { this.scene.start("secondary-atlas", { jobId: job.id }); return; }
    const checkpoints = reviewOnly ? chapter.stages.map(monster => ({ chapter, monster, status: "cleared" as const })) : equipped ? tertiary ? masterCheckpoints(save) : promotionCheckpoints(save) : [];
    const complete = chapter.stages.every(({ id }) => captured.has(id));
    const selected = checkpoints.find(({ monster, status }) => monster.id === this.selectedId && status !== "locked")
      ?? checkpoints.find(({ status }) => status === "available")
      ?? (secondary ? checkpoints.find(({ monster }) => nextWorkshopPhase(save, monster.id) < 4) : undefined) ?? checkpoints.at(-1);
    const startSelected = () => {
      if (!selected) return;
      if (tertiary && complete && save.player.tertiaryJobId !== tertiary.id) {
        applySaveToRegistry(this.registry, selectTertiaryCareer(snapshotRegistry(this.registry), tertiary.id));
        this.scene.restart({ jobId: job.id }); return;
      }
      if ((secondary && nextWorkshopPhase(save, selected.monster.id) < 4) || (tertiary && !complete)) {
        this.scene.start("career-workshop", { jobId: job.id, monsterId: selected.monster.id }); return;
      }
      this.scene.start("code-battle", { monsterId: selected.monster.id, returnTo: { scene: "promotion-chapter", data: { jobId: job.id } } });
    };
    this.add.image(480, 270, chapter.arena!.textureKey).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, PALETTE.nightBrown, 0.25);
    drawOrnateFrame(this, 480, 51, 760, 68, { fillAlpha: 0.97, radius: 10 });
    this.add.text(480, 31, `${chapter.label} · ${lt(this, chapter.name)}`, { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    this.add.text(480, 61, `${lt(this, job.name)} · ${equipped ? `${captured.size ? chapter.stages.filter(({ id }) => captured.has(id)).length : 0}/5` : (ko ? "전직 확인" : "PROMOTION CONFIRMATION")}`, { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    drawFiveStageRoute(this, equipped || reviewOnly ? checkpoints : chapter.stages.map((monster) => ({ monster, status: "locked" as const })), selected?.monster.id,
      (monsterId) => this.scene.restart({ jobId: job.id, monsterId }), { arena: chapter.arena!.assetKey, onEnter: equipped ? startSelected : undefined,
        enterLabel: tertiary && complete ? (save.player.tertiaryJobId !== tertiary.id ? (ko ? "3차 전직 확정" : "CONFIRM TIER THREE") : (ko ? "선택 단계 다시 검증" : "VERIFY SELECTED STAGE")) : undefined });
    drawOrnateFrame(this, 480, 416, 860, 156, { fillAlpha: 0.98, radius: 12 });
    this.add.image(108, 411, `guide-${this.jobId}`).setDisplaySize(112, 112);
    this.add.text(166, 353, lt(this, chapter.npcName), { ...pixelText("body"), color: PALETTE_HEX.maroon });
    const awarded = !!tertiary && save.player.tertiaryJobId === tertiary.id;
    const body = awarded ? (ko ? "3차 전직을 확정했습니다. 완성한 설계 의뢰는 언제든 다시 검증할 수 있습니다." : "Your tier-three career is confirmed. You can revisit the completed design milestones at any time.") : reviewOnly && selected ? lt(this, selected.monster.briefing) : !equipped ? lt(this, mission.story.intro) : complete && selected?.status === "cleared" ? lt(this, mission.story.ending) : selected ? lt(this, selected.monster.briefing) : lt(this, mission.story.intro);
    const description = this.add.text(166, 379, body, { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 720 }, lineSpacing: 4 });
    fitTextInside(description, 720, 64);
    const discovered = discoveredSourceIds(this.registry, save);
    const tools = selected ? openSourcesForMonster(selected.monster.id).filter(({ id }) => discovered.has(id)) : [];
    if (tools.length) {
      const related = this.add.text(166, 449, `${ko ? "연관 도구" : "RELATED TOOLS"}: ${tools.map(({ name }) => name).join(" · ")} ↗`, { ...pixelText("caption"), color: PALETTE_HEX.maroon }).setInteractive({ useHandCursor: true }).on("pointerup", () => showOpenSourceNotes(tools.map(({ id }) => id)));
      fitTextInside(related, 710, 18);
    }
    if (!equipped && secondary && !canSelectSecondaryCareer(save, secondary.id)) {
      this.add.text(166, 470, ko ? "완료한 직군 열람 중 · 현재 전직 유지" : "COMPLETED CAREER REVIEW · CURRENT CAREER RETAINED", { ...pixelText("caption"), color: PALETTE_HEX.maroon });
    } else if (!equipped) {
      this.add.text(166, 470, secondary!.requires.map((id) => lt(this, findJob(id).name)).join(" + ") + " · MASTER", { ...pixelText("caption"), color: PALETTE_HEX.mutedBrown });
      createButton(this, 742, 509, 320, 34, ko ? "전직하고 의뢰 시작" : "CONFIRM · START MISSION", () => {
        const current = snapshotRegistry(this.registry);
        if (!canSelectSecondaryCareer(current, secondary!.id)) { this.scene.start("job-select"); return; }
        applySaveToRegistry(this.registry, selectSecondaryCareer(current, secondary!.id));
        this.scene.start("secondary-atlas", { jobId: job.id });
      });
    } else if (selected) {
      const phase = secondary ? nextWorkshopPhase(save, selected.monster.id) : 4;
      const needsPractice = !!secondary && phase < 4;
      this.add.text(166, 470, tertiary
        ? (complete ? (ko ? "★ 최종 프로젝트 완료" : "★ FINAL PROJECT COMPLETE") : (ko ? "설계 근거를 읽고 검증하세요." : "Read and verify the design rationale."))
        : `${ko ? "구역 실습" : "REGION PRACTICE"} ${phase}/4${complete ? " · ★ MASTER" : ""}`, { ...pixelText("caption"), color: PALETTE_HEX.maroon });
      const award = !!tertiary && complete && save.player.tertiaryJobId !== tertiary.id;
      createButton(this, 742, 509, 320, 34, award ? (ko ? "3차 전직 확정" : "CONFIRM TIER THREE") : needsPractice ? (ko ? "구역 학습·실습 시작" : "LEARN · PRACTICE") : tertiary && !complete ? (ko ? "설계 자료·프로젝트 검증" : "DESIGN BRIEF · VERIFY") : selected.status === "cleared" ? (ko ? "이 단계 다시 도전" : "REPLAY THIS STAGE") : (ko ? "이 단계 배틀 시작" : "START THIS BATTLE"), startSelected);
      if (secondary && complete && isSecondaryStudyComplete(save, secondary.id)) {
        const next = tertiaryJobsFor(secondary.id)[0];
        createButton(this, 470, 509, 170, 34, ko ? "최종 프로젝트" : "FINAL PROJECT", () => this.scene.restart({ jobId: next.id }));
      }
    }
    createButton(this, 190, 509, 260, 34, ko ? "전직 계보로" : "CAREER LINEAGE", () => this.scene.start("job-select"));
    createHomeButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }
}
