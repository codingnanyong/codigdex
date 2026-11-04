import Phaser from "phaser";
import { musicRegionForStage } from "@codigdex/game-content/domain/regionMusic";
import { findStage } from "@codigdex/game-content/domain/chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import {
  applyCapture,
  capturedIds,
  isSuccessfulCapture,
  requiredCorrectAnswers,
} from "@codigdex/game-core/domain/dex/capture";
import { showCapturedPanel, showMissedPanel } from "../capture/resultPanels";
import { resolveCaptureSuccessFlow, type CaptureReturnTarget } from "../capture/resultFlow";
import { confirmCaptureTarget, retryCaptureTarget } from "../capture/resultNavigation";
import { createHomeButton } from "../navigation";
import { describeUnlock } from "../capture/unlockNotice";
import { lt, sceneLocale, t } from "../i18n";
import { readDexState, reconcileCareerDexRegistry, writeDexState, snapshotRegistry, applySaveToRegistry } from "../registryAdapter";
import { nextPlayableCheckpoint, rememberCheckpoint, settleFinalProject, settleEvolutionPractice } from "@codigdex/game-content/domain/gameProgress";
import { addShade, applyPixelFontToScene } from "../ui";
import { didUnlockPrimaryJobSelection } from "../worldMap/progression";
import { findJob, JOB_REGISTRY_KEY } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor, isCareerPathComplete } from "../worldMap/careerPaths";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { sourceEvents } from "../openSourceEvents";
import type { SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";
import { openSourceIdentity } from "@codigdex/game-content/domain/openSourceEvolutionIds";
import { openSourceEvolutionCount, nextOpenSourceEvolution } from "@codigdex/game-content/domain/openSourceChapters";
import { assetUrl } from "../../assets";

export interface CaptureResultData {
  monsterId: string;
  sourceEventId?: string;
  victoryId?: string;
  correctCount: number;
  total: number;
  passed?: boolean;
  returnTo?: SourceReturnTarget;
}

/** Settles a finished battle: reaching the pass line registers the card, anything less offers a retry. */
export class CaptureQuizScene extends Phaser.Scene {
  private chapter!: ChapterDefinition;
  private monster!: MonsterDefinition;
  private correctCount = 0;
  private total = 0;
  private passed?: boolean;
  private nextTarget: CaptureReturnTarget = { scene: "world-map" };
  private sourceEventId?: string;
  private beforeCapture?: StoredGameStateV3;
  private victoryId?: string;

  constructor() {
    super("capture-quiz");
  }

  init(data: CaptureResultData) {
    const { chapter, monster } = findStage(data.monsterId);
    this.chapter = chapter;
    this.monster = monster;
    this.correctCount = data.correctCount;
    this.total = data.total;
    this.passed = data.passed;
    this.sourceEventId = data.sourceEventId;
    this.victoryId = data.victoryId;
    this.beforeCapture = undefined;
    this.nextTarget = data.returnTo ?? { scene: "world-map" };
  }

  preload() { if (this.chapter.arena) this.load.image(this.chapter.arena.textureKey, assetUrl(this.chapter.arena.assetKey)); }

  create() {
    this.data.set("musicRegion", musicRegionForStage(this.monster.id, snapshotRegistry(this.registry).player.primaryJobId));
    if (this.chapter.arena) this.add.image(480, 270, this.chapter.arena.textureKey).setDisplaySize(960, 540);
    addShade(this, 0.55);
    createHomeButton(this).setDepth(30);

    if (this.passed !== false && isSuccessfulCapture(this.correctCount, this.total)) {
      this.showCaptured();
    } else {
      this.showMissed();
    }
    applyPixelFontToScene(this);
  }

  private showCaptured() {
    const { chapter, monster } = this;
    const { isNewEntry, beforeCaptured, afterCaptured } = this.registerCapture();
    const selectedJob = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined);
    const careerCleared =
      selectedJob.id !== "junior" &&
      !isCareerPathComplete(careerPathFor(selectedJob.id), beforeCaptured) &&
      isCareerPathComplete(careerPathFor(selectedJob.id), afterCaptured);
    const unlock = describeUnlock(monster.id, sceneLocale(this));
    const flow = resolveCaptureSuccessFlow(
      monster.id,
      isNewEntry,
      this.nextTarget,
      { careerCleared, sourceEventId: this.sourceEventId }
    );
    this.nextTarget = flow.target;
    const tool = this.sourceEventId && openSourceIdentity(monster.id);
    const save = snapshotRegistry(this.registry);
    const count = tool ? openSourceEvolutionCount(save, tool.toolId) : 0;
    const nextForm = tool ? nextOpenSourceEvolution(save, tool.toolId) : undefined;
    // Persist the victory's encounter outcome before HOME, card inspection or reload can leave this result.
    if (!this.sourceEventId && this.beforeCapture) {
      sourceEvents(this.registry).queue(this.beforeCapture, snapshotRegistry(this.registry), monster.id, this.nextTarget, Math.random, this.victoryId);
    }

    showCapturedPanel(this, {
      monster,
      title: flow.careerCleared
        ? t(this, "capture.careerCleared", { career: lt(this, selectedJob.name) })
        : flow.regionCleared
          ? t(this, "capture.regionCleared", { region: lt(this, chapter.name) })
          : undefined,
      confirmLabel: tool ? count === 5 ? (sceneLocale(this) === "ko" ? "5단계 의뢰 완료" : "FINISH REQUEST") : `${sceneLocale(this) === "ko" ? "다음 진화" : "NEXT FORM"} · Lv.${nextForm!.level}` : flow.careerCleared
        ? t(this, "capture.chooseCareer")
        : flow.regionCleared
          ? t(this, "capture.returnToMap")
          : undefined,
      npcLine: `${lt(this, chapter.npcName)}: ${lt(this, chapter.successLine)}`,
      isNewEntry,
      unlockNotice: tool ? `${sceneLocale(this) === "ko" ? "진화 진행" : "EVOLUTION PROGRESS"} · ${count}/5` : isNewEntry ? unlock.notice : undefined,
      onPause: this.sourceEventId && count < 5 ? () => this.pauseRequest() : undefined,
      // Carry on where the player is headed: the newly opened stage or
      // chapter, or straight back into this chapter after a replay.
      onConfirm: () => {
        const target = confirmCaptureTarget({
          save: snapshotRegistry(this.registry), beforeCapture: this.beforeCapture,
          monsterId: monster.id, fallback: this.nextTarget,
          sourceEventId: this.sourceEventId, victoryId: this.victoryId,
        }, sourceEvents(this.registry));
        this.scene.start(target.scene, target.data);
      },
    });
  }

  private showMissed() {
    const { chapter, monster } = this;
    showMissedPanel(this, {
      monster,
      resultLine: t(this, "capture.resultLine", {
        correct: this.correctCount,
        total: this.total,
        required: requiredCorrectAnswers(this.total),
      }) + (monster.id.startsWith("mastery:") ? (sceneLocale(this) === "ko" ? " · 필수 설계 판단도 모두 맞혀야 합니다." : " · All required design checks must also be correct.") : ""),
      npcLine: `${lt(this, chapter.npcName)}: ${lt(this, chapter.retryLine)}`,
      onPause: this.sourceEventId ? () => this.pauseRequest() : undefined,
      onRetry: () => {
        const target = retryCaptureTarget(this.sourceEventId, this.nextTarget);
        this.scene.start(target.scene, target.data);
      },
    });
  }

  private pauseRequest() {
    const target = sourceEvents(this.registry).leave(snapshotRegistry(this.registry), this.sourceEventId!);
    this.scene.start(target?.scene ?? this.nextTarget.scene, target?.data ?? this.nextTarget.data);
  }

  /** Registers the card and exposes the capture transition for milestone checks. */
  private registerCapture() {
    this.beforeCapture = snapshotRegistry(this.registry);
    const before = readDexState(this.registry);
    const after = applyCapture(before, this.monster);
    const beforeCaptured = capturedIds(before);
    const afterCaptured = capturedIds(after);
    if (didUnlockPrimaryJobSelection(beforeCaptured, afterCaptured)) {
      this.nextTarget = { scene: "job-select" };
    }
    writeDexState(this.registry, after);
    const settled = settleFinalProject(settleEvolutionPractice(snapshotRegistry(this.registry), this.monster.id));
    if (settled.progress.projects !== this.beforeCapture.progress.projects) applySaveToRegistry(this.registry, settled);
    reconcileCareerDexRegistry(this.registry);
    if (after !== before && !this.sourceEventId) {
      const save = snapshotRegistry(this.registry);
      applySaveToRegistry(this.registry, rememberCheckpoint(save, nextPlayableCheckpoint(save).monster.id));
    }
    return { isNewEntry: after !== before, beforeCaptured, afterCaptured };
  }
}
