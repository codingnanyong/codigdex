import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { pixelText } from "../pixelFont";
import { readDexState, writeDexState } from "../registryAdapter";
import { NPC_RETRY_LINE, NPC_SUCCESS_LINE, TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
import { applyCapture, isSuccessfulCapture } from "@/lib/domain/tutorial/capture";

const INK = PALETTE_HEX.ink;

interface CaptureResultData {
  monsterId: string;
  correctCount: number;
}

export class CaptureQuizScene extends Phaser.Scene {
  private correctCount = 0;

  constructor() {
    super("capture-quiz");
  }

  init(data: CaptureResultData) {
    this.correctCount = data.correctCount;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.55)
      .setDepth(0);

    if (isSuccessfulCapture(this.correctCount, TUTORIAL_MONSTER.quiz.length)) {
      this.registerCapture();
      this.showSuccess();
    } else {
      this.showFailure();
    }
    applyPixelFontToScene(this);
  }

  private showSuccess() {
    const { width, height } = this.scale;

    const panelWidth = 640;
    const minPanelHeight = 360;
    const topPad = 30;
    const bottomPad = 70;
    const container = this.add.container(width / 2, height / 2).setDepth(1).setAlpha(0).setScale(0.85);

    // Lay content out from an arbitrary top (cursor = 0) first, so panel
    // height can be sized to whatever this monster's copy actually needs,
    // then shift everything down once the final panel geometry is known.
    let cursor = 0;
    const title = this.add
      .text(0, cursor, `"${TUTORIAL_MONSTER.name}" 도감 등록 완료!`, {
        ...pixelText("subtitle"),
        color: INK,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += title.height + 14;

    const description = this.add
      .text(0, cursor, TUTORIAL_MONSTER.description, {
        ...pixelText("body"),
        color: INK,
        align: "center",
        wordWrap: { width: panelWidth - 120 },
      })
      .setOrigin(0.5, 0);
    cursor += description.height + 14;

    const snippetY = cursor;
    const snippetBg = this.add
      .rectangle(0, snippetY, panelWidth - 140, 46, PALETTE.nightBrown, 0.9)
      .setStrokeStyle(2, PALETTE.ink)
      .setOrigin(0.5, 0);
    const snippetText = this.add
      .text(0, snippetY + 8, TUTORIAL_MONSTER.snippet, {
        ...pixelText("body"),
        color: PALETTE_HEX.sand,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += 46 + 16;

    const npcLine = this.add
      .text(0, cursor, `${TUTORIAL_MONSTER.npcName}: ${NPC_SUCCESS_LINE}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: panelWidth - 120 },
      })
      .setOrigin(0.5, 0);
    cursor += npcLine.height;

    const shiftable: Array<Phaser.GameObjects.GameObject & { y: number }> = [
      title,
      description,
      snippetBg,
      snippetText,
      npcLine,
    ];

    const contentHeight = cursor;
    const panelHeight = Math.max(minPanelHeight, contentHeight + topPad + bottomPad);
    const shiftY = -panelHeight / 2 + topPad;
    shiftable.forEach((el) => {
      el.y += shiftY;
    });

    const frame = drawOrnateFrame(this, 0, 0, panelWidth, panelHeight);
    const elements: Phaser.GameObjects.GameObject[] = [frame, ...shiftable];

    const confirm = createButton(this, 0, panelHeight / 2 - 32, 120, 34, "확인", () => {
      this.scene.start("path-map");
    });
    elements.push(confirm);

    container.add(elements);

    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 260,
      ease: "Back.Out",
    });
  }

  private showFailure() {
    const { width, height } = this.scale;

    const panelWidth = 560;
    const panelHeight = 240;
    const container = this.add.container(width / 2, height / 2).setDepth(1).setAlpha(0).setScale(0.85);

    const frame = drawOrnateFrame(this, 0, 0, panelWidth, panelHeight);

    const title = this.add
      .text(0, -panelHeight / 2 + 40, `"${TUTORIAL_MONSTER.name}"를 놓쳤어요!`, {
        ...pixelText("subtitle"),
        color: INK,
        align: "center",
      })
      .setOrigin(0.5);

    const npcLine = this.add
      .text(0, -20, `${TUTORIAL_MONSTER.npcName}: ${NPC_RETRY_LINE}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: panelWidth - 120 },
      })
      .setOrigin(0.5, 0);

    const retry = createButton(this, 0, panelHeight / 2 - 32, 140, 34, "재도전", () => {
      this.scene.start("world-map");
    });

    container.add([frame, title, npcLine, retry]);

    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 260,
      ease: "Back.Out",
    });
  }

  private registerCapture() {
    const state = applyCapture(readDexState(this.registry));
    writeDexState(this.registry, state);
  }
}
