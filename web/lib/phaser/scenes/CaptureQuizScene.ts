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
import { createHomeButton } from "../navigation";
import { describeUnlock } from "../capture/unlockNotice";
import { lt, sceneLocale, t } from "../i18n";
import { readDexState, writeDexState } from "../registryAdapter";
import { addShade, applyPixelFontToScene } from "../ui";
import { didUnlockPrimaryJobSelection } from "../worldMap/progression";

export interface CaptureResultData {
  monsterId: string;
  correctCount: number;
  total: number;
  returnTo?: { scene: "world-map" | "career-region"; data?: Record<string, unknown> };
}

/** Settles a finished battle: reaching the pass line registers the card, anything less offers a retry. */
export class CaptureQuizScene extends Phaser.Scene {
  private chapter!: ChapterDefinition;
  private monster!: MonsterDefinition;
  private correctCount = 0;
  private total = 0;
  private nextTarget: { scene: "world-map" | "job-select" | "career-region"; data?: Record<string, unknown> } = { scene: "world-map" };

  constructor() {
    super("capture-quiz");
  }

  init(data: CaptureResultData) {
    const { chapter, monster } = findStage(data.monsterId);
    this.chapter = chapter;
    this.monster = monster;
    this.correctCount = data.correctCount;
    this.total = data.total;
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
    const isNewEntry = this.registerCapture();
    const unlock = describeUnlock(monster.id, sceneLocale(this));

    showCapturedPanel(this, {
      monster,
      npcLine: `${lt(this, chapter.npcName)}: ${lt(this, chapter.successLine)}`,
      isNewEntry,
      unlockNotice: isNewEntry ? unlock.notice : undefined,
      // Carry on where the player is headed: the newly opened stage or
      // chapter, or straight back into this chapter after a replay.
      onConfirm: () => {
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
      onRetry: () => this.scene.start(this.nextTarget.scene, this.nextTarget.data),
    });
  }

  /** Returns whether this was the monster's first capture. */
  private registerCapture(): boolean {
    const before = readDexState(this.registry);
    const after = applyCapture(before, this.monster);
    if (didUnlockPrimaryJobSelection(capturedIds(before), capturedIds(after))) {
      this.nextTarget = { scene: "job-select" };
    }
    writeDexState(this.registry, after);
    return after !== before;
  }
}
