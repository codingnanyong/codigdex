import Phaser from "phaser";
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
import { createHomeButton } from "../navigation";
import { describeUnlock } from "../capture/unlockNotice";
import { lt, sceneLocale, t } from "../i18n";
import { readDexState, reconcileCareerDexRegistry, writeDexState, snapshotRegistry, applySaveToRegistry } from "../registryAdapter";
import { nextPlayableCheckpoint, rememberCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { addShade, applyPixelFontToScene } from "../ui";
import { didUnlockPrimaryJobSelection } from "../worldMap/progression";
import { findJob, JOB_REGISTRY_KEY } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor, isCareerPathComplete } from "../worldMap/careerPaths";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { sourceEvents } from "../openSourceEvents";
import type { SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";

export interface CaptureResultData {
  monsterId: string;
  sourceEventId?: string;
  victoryId?: string;
  correctCount: number;
  total: number;
  returnTo?: SourceReturnTarget;
}

/** Settles a finished battle: reaching the pass line registers the card, anything less offers a retry. */
export class CaptureQuizScene extends Phaser.Scene {
  private chapter!: ChapterDefinition;
  private monster!: MonsterDefinition;
  private correctCount = 0;
  private total = 0;
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
    this.sourceEventId = data.sourceEventId;
    this.victoryId = data.victoryId;
    this.beforeCapture = undefined;
    this.nextTarget = data.returnTo ?? { scene: "world-map" };
  }

  create() {
    addShade(this, 0.55);
    createHomeButton(this).setDepth(30);

    if (isSuccessfulCapture(this.correctCount, this.total)) {
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
    const flow = this.sourceEventId ? { careerCleared: false, regionCleared: false, target: this.nextTarget } : resolveCaptureSuccessFlow(
      monster.id,
      isNewEntry,
      this.nextTarget,
      careerCleared
    );
    this.nextTarget = flow.target;

    showCapturedPanel(this, {
      monster,
      title: flow.careerCleared
        ? t(this, "capture.careerCleared", { career: lt(this, selectedJob.name) })
        : flow.regionCleared
          ? t(this, "capture.regionCleared", { region: lt(this, chapter.name) })
          : undefined,
      confirmLabel: flow.careerCleared
        ? t(this, "capture.chooseCareer")
        : flow.regionCleared
          ? t(this, "capture.returnToMap")
          : undefined,
      npcLine: `${lt(this, chapter.npcName)}: ${lt(this, chapter.successLine)}`,
      isNewEntry,
      unlockNotice: isNewEntry ? unlock.notice : undefined,
      // Carry on where the player is headed: the newly opened stage or
      // chapter, or straight back into this chapter after a replay.
      onConfirm: () => {
        const save = snapshotRegistry(this.registry);
        const events = sourceEvents(this.registry);
        if (this.sourceEventId) {
          const target = events.finish(save, this.sourceEventId) ?? this.nextTarget;
          this.scene.start(target.scene, target.data);
          return;
        }
        if (this.beforeCapture) {
          const pending = events.queue(this.beforeCapture, save, monster.id, this.nextTarget, Math.random, this.victoryId);
          if (pending) { this.scene.start("open-source-event"); return; }
        }
        this.scene.start(this.nextTarget.scene, this.nextTarget.data);
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
      }),
      npcLine: `${lt(this, chapter.npcName)}: ${lt(this, chapter.retryLine)}`,
      onRetry: () => this.sourceEventId ? this.scene.start("open-source-event") : this.scene.start(this.nextTarget.scene, this.nextTarget.data),
    });
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
    reconcileCareerDexRegistry(this.registry);
    if (after !== before && !this.sourceEventId) {
      const save = snapshotRegistry(this.registry);
      applySaveToRegistry(this.registry, rememberCheckpoint(save, nextPlayableCheckpoint(save).monster.id));
    }
    return { isNewEntry: after !== before, beforeCaptured, afterCaptured };
  }
}
