import type Phaser from "phaser";
import type { CapturedCard, MonsterDefinition } from "@/lib/domain/chapters/types";
import { fitTexture } from "../monsterArt";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import {
  addShade,
  addSnippetBlock,
  applyPixelFontToScene,
  createButton,
  drawOrnateFrame,
  popIn,
} from "../ui";

const PANEL_WIDTH = 600;
const MIN_PANEL_HEIGHT = 360;
const ART_BOX = { width: 200, height: 120 };

type Positioned = Phaser.GameObjects.GameObject & { y: number };

/** The full card for a captured entry, over the dimmed dex. Clicking outside closes it too. */
export class DetailCard {
  private readonly scene: Phaser.Scene;
  private shade?: Phaser.GameObjects.Rectangle;
  private group?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  open(monster: MonsterDefinition, card: CapturedCard) {
    if (this.group) return;
    const { scene } = this;
    const { width, height } = scene.scale;
    const infoWidth = PANEL_WIDTH - 120;

    this.shade = addShade(scene, 0.75, 20);
    this.shade.on("pointerup", () => this.close());

    const fit = fitTexture(scene, monster.textureKey, ART_BOX.width, ART_BOX.height);
    const art = scene.add.image(0, ART_BOX.height / 2, monster.textureKey).setScale(fit.scale);
    const content: Positioned[] = [art];

    let cursor = ART_BOX.height + 20;
    const addLine = (text: string, style: Phaser.Types.GameObjects.Text.TextStyle, gap: number) => {
      const line = scene.add.text(0, cursor, text, style).setOrigin(0.5, 0);
      content.push(line);
      cursor += line.height + gap;
    };

    addLine(`No. ${card.dexNumber}`, { ...pixelText("body"), color: PALETTE_HEX.mutedBrown }, 4);
    addLine(card.name, { ...pixelText("subtitle"), color: PALETTE_HEX.ink, fontStyle: "bold" }, 4);
    addLine(card.classification, { ...pixelText("body"), color: PALETTE_HEX.maroon }, 12);
    addLine(
      card.description,
      { ...pixelText("body"), color: PALETTE_HEX.ink, align: "center", wordWrap: { width: infoWidth } },
      12
    );

    const snippet = addSnippetBlock(scene, cursor, infoWidth, card.snippet);
    content.push(snippet.plate, snippet.text);
    cursor += snippet.height + 12;

    addLine(new Date(card.capturedAt).toLocaleDateString("ko-KR"), {
      ...pixelText("caption"),
      color: PALETTE_HEX.mutedBrown,
    }, 0);

    const panelHeight = Math.max(MIN_PANEL_HEIGHT, cursor + 90);
    const shiftY = -panelHeight / 2 + 16;
    content.forEach((element) => {
      element.y += shiftY;
    });

    const frame = drawOrnateFrame(scene, 0, 0, PANEL_WIDTH, panelHeight);
    const closeButton = createButton(scene, 0, panelHeight / 2 - 32, 100, 32, "닫기", () => this.close());

    this.group = scene.add
      .container(width / 2, height / 2, [frame, ...content, closeButton])
      .setDepth(21);
    popIn(scene, this.group);
    applyPixelFontToScene(scene);
  }

  close() {
    this.shade?.destroy();
    this.shade = undefined;
    this.group?.destroy(true);
    this.group = undefined;
  }
}
