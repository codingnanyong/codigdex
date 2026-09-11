import type Phaser from "phaser";
import { fitTexture } from "../monsterArt";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene } from "../ui";
import type { DexEntry } from "./entry";

const PREVIEW_SIZE = 176;

/** The left side of the dex: the selected entry's portrait and summary, or "???" before capture. */
export class PreviewPane {
  private readonly scene: Phaser.Scene;
  private readonly centerX: number;
  private readonly top: number;
  private group?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, centerX: number, top: number) {
    this.scene = scene;
    this.centerX = centerX;
    this.top = top;
  }

  /** Rebuilds the pane for `entry`, replacing whatever it showed before. */
  show({ monster, card }: DexEntry) {
    this.group?.destroy(true);
    const { scene, centerX } = this;
    const previewTop = this.top + 6;
    const previewCenterY = previewTop + PREVIEW_SIZE / 2;
    const infoWidth = PREVIEW_SIZE + 40;

    const items: Phaser.GameObjects.GameObject[] = [
      scene.add
        .rectangle(centerX, previewCenterY, PREVIEW_SIZE, PREVIEW_SIZE, PALETTE.ink, 1)
        .setStrokeStyle(2, PALETTE.mutedBrown),
    ];

    if (card) {
      const fit = fitTexture(scene, monster.textureKey, PREVIEW_SIZE - 16, PREVIEW_SIZE - 16);
      items.push(scene.add.image(centerX, previewCenterY, monster.textureKey).setScale(fit.scale));
    } else {
      items.push(
        scene.add
          .text(centerX, previewCenterY, "?", { ...pixelText("hero"), color: PALETTE_HEX.mutedBrown })
          .setOrigin(0.5)
      );
    }

    let cursor = previewTop + PREVIEW_SIZE + 16;
    const addLine = (text: string, style: Phaser.Types.GameObjects.Text.TextStyle, gap: number) => {
      const line = scene.add.text(centerX, cursor, text, style).setOrigin(0.5, 0);
      items.push(line);
      cursor += line.height + gap;
    };

    addLine(`No. ${monster.dexNumber}`, { ...pixelText("body"), color: PALETTE_HEX.sand }, 4);
    addLine(card ? card.name : "???", { ...pixelText("subtitle"), color: PALETTE_HEX.cream, fontStyle: "bold" }, 6);
    if (card) {
      addLine(card.classification, { ...pixelText("body"), color: PALETTE_HEX.amber }, 6);
      addLine(card.trait, { ...pixelText("body"), color: PALETTE_HEX.sand, align: "center", wordWrap: { width: infoWidth } }, 0);
    } else {
      addLine(
        "아직 관찰되지 않았습니다",
        { ...pixelText("body"), color: PALETTE_HEX.mutedBrown, align: "center", wordWrap: { width: infoWidth } },
        0
      );
    }

    this.group = scene.add.container(0, 0, items);
    applyPixelFontToScene(scene);
  }
}
