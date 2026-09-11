import type Phaser from "phaser";
import { chapterTitle, currentStageIndex, stageStatus } from "@/lib/domain/chapters";
import type { ChapterDefinition } from "@/lib/domain/chapters/types";
import { quizCountForLevel } from "@/lib/domain/dex/quiz";
import { fitTexture } from "../monsterArt";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import {
  addShade,
  applyPixelFontToScene,
  createButton,
  drawOrnateFrame,
  popIn,
  setButtonEnabled,
} from "../ui";

const PANEL = { width: 640, height: 340 };
const SLOT_RADIUS = 32;
const SLOT_SPACING = 104;
const START_WIDTH = 160;
const CLOSE_WIDTH = 100;

export interface StagePanelOptions {
  onStart: (monsterId: string) => void;
  onClose: () => void;
}

/**
 * A chapter's stage select: every stage's portrait in a row (dimmed while
 * locked, marked once cleared), the selected stage described underneath,
 * and a button to fight it. It opens on the first stage not yet captured.
 */
export class StagePanel {
  private readonly scene: Phaser.Scene;
  private readonly chapter: ChapterDefinition;
  private readonly captured: ReadonlySet<string>;
  private readonly shade: Phaser.GameObjects.Rectangle;
  private readonly group: Phaser.GameObjects.Container;
  private readonly slotXs: number[];
  private readonly stripY: number;
  private readonly selectionRing: Phaser.GameObjects.Arc;
  private readonly title: Phaser.GameObjects.Text;
  private readonly briefing: Phaser.GameObjects.Text;
  private readonly rule: Phaser.GameObjects.Text;
  private readonly startButton: Phaser.GameObjects.Container;
  private selectedMonsterId?: string;

  constructor(
    scene: Phaser.Scene,
    chapter: ChapterDefinition,
    captured: ReadonlySet<string>,
    options: StagePanelOptions
  ) {
    this.scene = scene;
    this.chapter = chapter;
    this.captured = captured;

    const { width, height } = scene.scale;
    const top = -PANEL.height / 2;
    const left = -PANEL.width / 2 + 36;
    const stageCount = chapter.stages.length;
    const capturedCount = chapter.stages.filter((stage) => captured.has(stage.id)).length;

    this.shade = addShade(scene, 0.72, 20);
    this.shade.on("pointerup", options.onClose);

    const frame = drawOrnateFrame(scene, 0, 0, PANEL.width, PANEL.height);
    const heading = scene.add
      .text(left, top + 28, `${chapter.label} · ${chapterTitle(chapter)}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0, 0.5);
    const progress = scene.add
      .text(-left, top + 28, `포획 ${capturedCount} / ${stageCount}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(1, 0.5);

    this.stripY = top + 88;
    this.slotXs = chapter.stages.map((_, index) => (index - (stageCount - 1) / 2) * SLOT_SPACING);
    this.selectionRing = scene.add.circle(0, this.stripY, SLOT_RADIUS + 6);
    this.selectionRing.setStrokeStyle(3, PALETTE.maroon, 1);
    const slots = chapter.stages.flatMap((_, index) => this.drawSlot(index));

    const divider = scene.add.rectangle(0, top + 172, PANEL.width - 72, 1, PALETTE.sand, 1);
    this.title = scene.add
      .text(left, top + 186, "", { ...pixelText("subtitle"), color: PALETTE_HEX.ink })
      .setOrigin(0, 0);
    this.briefing = scene.add
      .text(left, top + 220, "", {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
        wordWrap: { width: PANEL.width - 72 },
        lineSpacing: 4,
      })
      .setOrigin(0, 0);
    this.rule = scene.add
      .text(left, top + 266, "", { ...pixelText("body"), color: PALETTE_HEX.mutedBrown })
      .setOrigin(0, 0);

    const buttonY = PANEL.height / 2 - 32;
    const startX = PANEL.width / 2 - 30 - START_WIDTH / 2;
    this.startButton = createButton(scene, startX, buttonY, START_WIDTH, 34, "코드 배틀 시작", () => {
      if (this.selectedMonsterId) options.onStart(this.selectedMonsterId);
    });
    const closeButton = createButton(
      scene,
      startX - START_WIDTH / 2 - 12 - CLOSE_WIDTH / 2,
      buttonY,
      CLOSE_WIDTH,
      34,
      "닫기",
      options.onClose
    );

    this.group = scene.add
      .container(width / 2, height / 2, [
        frame,
        heading,
        progress,
        ...slots,
        this.selectionRing,
        divider,
        this.title,
        this.briefing,
        this.rule,
        this.startButton,
        closeButton,
      ])
      .setDepth(21);

    this.select(currentStageIndex(chapter, captured));
    popIn(scene, this.group, 0.92);
    applyPixelFontToScene(scene);
  }

  destroy() {
    this.shade.destroy();
    this.group.destroy(true);
  }

  private drawSlot(index: number): Phaser.GameObjects.GameObject[] {
    const monster = this.chapter.stages[index];
    const status = stageStatus(this.chapter, index, this.captured);
    const locked = status === "locked";
    const x = this.slotXs[index];

    const ring = this.scene.add
      .circle(x, this.stripY, SLOT_RADIUS, PALETTE.nightBrown, 1)
      .setStrokeStyle(2, locked ? PALETTE.mutedBrown : PALETTE.amber, 1)
      .setInteractive({ useHandCursor: true });
    ring.on("pointerup", () => this.select(index));

    const fit = fitTexture(this.scene, monster.textureKey, SLOT_RADIUS * 1.75, SLOT_RADIUS * 1.75);
    const art = this.scene.add
      .image(x, this.stripY + 1, monster.textureKey)
      .setScale(fit.scale)
      .setAlpha(locked ? 0.2 : 1);
    const level = this.scene.add
      .text(x, this.stripY + SLOT_RADIUS + 18, `Lv.${monster.level}`, {
        ...pixelText("body"),
        color: locked ? PALETTE_HEX.mutedBrown : PALETTE_HEX.ink,
      })
      .setOrigin(0.5);

    const items: Phaser.GameObjects.GameObject[] = [ring, art, level];
    if (status === "cleared") {
      items.push(
        this.scene.add
          .text(x, this.stripY + SLOT_RADIUS + 34, "CLEAR", {
            ...pixelText("caption"),
            color: PALETTE_HEX.maroon,
          })
          .setOrigin(0.5)
      );
    }
    return items;
  }

  private select(index: number) {
    const monster = this.chapter.stages[index];
    const status = stageStatus(this.chapter, index, this.captured);
    const locked = status === "locked";

    this.selectedMonsterId = locked ? undefined : monster.id;
    this.selectionRing.setPosition(this.slotXs[index], this.stripY);
    this.title.setText(`${locked ? "???" : monster.name}  Lv.${monster.level}`);
    this.briefing.setText(
      locked ? "앞 단계를 먼저 포획하면 모습을 드러내요." : `${this.chapter.npcName}: ${monster.briefing}`
    );
    this.rule.setText(
      locked
        ? ""
        : `문제 ${quizCountForLevel(monster.level)}개 · 전부 맞히면 도감 등록${status === "cleared" ? " · 복습" : ""}`
    );
    setButtonEnabled(this.startButton, !locked);
  }
}
