import Phaser from "phaser";
import { findStage } from "@/lib/domain/chapters";
import type { ChapterDefinition, MonsterDefinition } from "@/lib/domain/chapters/types";
import {
  applyCapture,
  capturedIds,
  isSuccessfulCapture,
  requiredCorrectAnswers,
} from "@/lib/domain/dex/capture";
import { showCapturedPanel, showMissedPanel } from "../capture/resultPanels";
import { createHomeButton } from "../navigation";
import { describeUnlock } from "../capture/unlockNotice";
import { readDexState, writeDexState } from "../registryAdapter";
import { addShade, applyPixelFontToScene } from "../ui";
import { didUnlockPrimaryJobSelection } from "../worldMap/progression";

export interface CaptureResultData {
  monsterId: string;
  correctCount: number;
  total: number;
}

/** Settles a finished battle: a perfect run registers the card, anything less offers a retry. */
export class CaptureQuizScene extends Phaser.Scene {
  private chapter!: ChapterDefinition;
  private monster!: MonsterDefinition;
  private correctCount = 0;
  private total = 0;
  private nextScene: "world-map" | "job-select" = "world-map";

  constructor() {
    super("capture-quiz");
  }

  init(data: CaptureResultData) {
    const { chapter, monster } = findStage(data.monsterId);
    this.chapter = chapter;
    this.monster = monster;
    this.correctCount = data.correctCount;
    this.total = data.total;
    this.nextScene = "world-map";
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
    const unlock = describeUnlock(monster.id);

    showCapturedPanel(this, {
      monster,
      npcLine: `${chapter.npcName}: ${chapter.successLine}`,
      isNewEntry,
      unlockNotice: isNewEntry ? unlock.notice : undefined,
      // Carry on where the player is headed: the newly opened stage or
      // chapter, or straight back into this chapter after a replay.
      onConfirm: () => {
        this.scene.start(this.nextScene);
      },
    });
  }

  private showMissed() {
    const { chapter, monster } = this;
    showMissedPanel(this, {
      monster,
      resultLine: `정답 ${this.correctCount} / ${this.total} · ${requiredCorrectAnswers(this.total)}개 이상 맞히면 포획돼요`,
      npcLine: `${chapter.npcName}: ${chapter.retryLine}`,
      onRetry: () => this.scene.start("world-map"),
    });
  }

  /** Returns whether this was the monster's first capture. */
  private registerCapture(): boolean {
    const before = readDexState(this.registry);
    const after = applyCapture(before, this.monster);
    this.nextScene = didUnlockPrimaryJobSelection(capturedIds(before), capturedIds(after))
      ? "job-select"
      : "world-map";
    writeDexState(this.registry, after);
    return after !== before;
  }
}
