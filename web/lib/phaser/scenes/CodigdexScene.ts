import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { getPixelFontFamily } from "../pixelFont";
import { readDexState } from "../registryAdapter";
import {
  CapturedCard,
  TOTAL_TUTORIAL_MONSTERS,
  TUTORIAL_MONSTER,
} from "@/lib/domain/tutorial/content";

const CREAM = PALETTE_HEX.cream;
const SAND = PALETTE_HEX.sand;
const PANEL_WIDTH = 780;
const PANEL_HEIGHT = 460;
const SCREEN_INSET = 16;
const PREVIEW_SIZE = 176;
const ROW_HEIGHT = 54;

export class CodigdexScene extends Phaser.Scene {
  private detailGroup?: Phaser.GameObjects.Container;
  private detailOverlay?: Phaser.GameObjects.Rectangle;

  constructor() {
    super("codigdex");
  }

  preload() {
    this.load.image(
      "loop-bug",
      "/assets/monsters/loop-bug.png"
    );
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.7)
      .setInteractive();

    const panelX = width / 2;
    const panelY = height / 2;
    const screenWidth = PANEL_WIDTH - SCREEN_INSET * 2;
    const screenHeight = PANEL_HEIGHT - SCREEN_INSET * 2;
    const screenLeft = panelX - screenWidth / 2;
    const screenTop = panelY - screenHeight / 2;

    this.drawBezel(panelX, panelY, screenWidth, screenHeight);

    const headerY = screenTop + 22;
    this.drawHeaderBadges(panelX, headerY);
    this.add
      .text(panelX, headerY, "CODIGDEX 도감", {
        fontFamily: getPixelFontFamily(),
        fontSize: "15px",
        color: CREAM,
      })
      .setOrigin(0.5);

    this.add.rectangle(panelX, screenTop + 42, screenWidth - 24, 1, PALETTE.mutedBrown, 0.6);

    const { cards } = readDexState(this.registry);
    const card = cards.find((c) => c.id === TUTORIAL_MONSTER.id);

    const bodyTop = screenTop + 52;
    const bodyBottom = panelY + PANEL_HEIGHT / 2 - SCREEN_INSET - 40;
    const leftPaneX = screenLeft + 16 + 240 / 2;

    this.renderPreviewPane(leftPaneX, bodyTop, bodyBottom, card);
    this.renderListPane(screenLeft + 16 + 240 + 16, screenLeft + screenWidth - 16, bodyTop, card);

    createButton(this, panelX, panelY + PANEL_HEIGHT / 2 - SCREEN_INSET - 14, 100, 30, "닫기", () =>
      this.close()
    );

    applyPixelFontToScene(this);
  }

  private drawBezel(centerX: number, centerY: number, screenWidth: number, screenHeight: number) {
    const g = this.add.graphics();
    const bezelLeft = centerX - PANEL_WIDTH / 2;
    const bezelTop = centerY - PANEL_HEIGHT / 2;

    g.fillStyle(PALETTE.nightBrown, 0.4);
    g.fillRoundedRect(bezelLeft + 4, bezelTop + 6, PANEL_WIDTH, PANEL_HEIGHT, 20);
    g.fillStyle(PALETTE.maroon, 1);
    g.fillRoundedRect(bezelLeft, bezelTop, PANEL_WIDTH, PANEL_HEIGHT, 20);
    g.lineStyle(3, PALETTE.ink, 1);
    g.strokeRoundedRect(bezelLeft, bezelTop, PANEL_WIDTH, PANEL_HEIGHT, 20);

    const screenLeft = centerX - screenWidth / 2;
    const screenTop = centerY - screenHeight / 2;
    g.fillStyle(PALETTE.nightBrown, 1);
    g.fillRoundedRect(screenLeft, screenTop, screenWidth, screenHeight, 12);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRoundedRect(screenLeft, screenTop, screenWidth, screenHeight, 12);
  }

  private drawHeaderBadges(centerX: number, y: number) {
    [-92, 92].forEach((offset) => {
      const ball = this.add.graphics({ x: centerX + offset, y });
      ball.fillStyle(PALETTE.amber, 1);
      ball.fillCircle(0, 0, 6);
      ball.lineStyle(1.5, PALETTE.ink, 1);
      ball.strokeCircle(0, 0, 6);
    });
  }

  private renderPreviewPane(centerX: number, top: number, bottom: number, card?: CapturedCard) {
    const previewTop = top + 6;
    const previewCenterY = previewTop + PREVIEW_SIZE / 2;

    this.add
      .rectangle(centerX, previewCenterY, PREVIEW_SIZE, PREVIEW_SIZE, PALETTE.ink, 1)
      .setStrokeStyle(2, PALETTE.mutedBrown);

    if (card) {
      this.add
        .image(centerX, previewCenterY - 4, "loop-bug")
        .setDisplaySize(PREVIEW_SIZE - 16, (PREVIEW_SIZE - 16) * (2 / 3));
    } else {
      this.add
        .text(centerX, previewCenterY, "?", {
          fontFamily: getPixelFontFamily(),
          fontSize: "40px",
          color: PALETTE_HEX.mutedBrown,
        })
        .setOrigin(0.5);
    }

    let cursor = previewTop + PREVIEW_SIZE + 16;
    const infoWidth = PREVIEW_SIZE + 40;

    const dexNumber = this.add
      .text(centerX, cursor, `No. ${TUTORIAL_MONSTER.dexNumber}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: SAND,
      })
      .setOrigin(0.5, 0);
    cursor += dexNumber.height + 4;

    const name = this.add
      .text(centerX, cursor, card ? card.name : "???", {
        fontFamily: getPixelFontFamily(),
        fontSize: "15px",
        color: CREAM,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    cursor += name.height + 6;

    if (card) {
      const classification = this.add
        .text(centerX, cursor, card.classification, {
          fontFamily: getPixelFontFamily(),
          fontSize: "11px",
          color: PALETTE_HEX.amber,
        })
        .setOrigin(0.5, 0);
      cursor += classification.height + 6;

      this.add
        .text(centerX, cursor, card.trait, {
          fontFamily: getPixelFontFamily(),
          fontSize: "10px",
          color: SAND,
          align: "center",
          wordWrap: { width: infoWidth },
        })
        .setOrigin(0.5, 0);
    } else {
      this.add
        .text(centerX, cursor, "아직 관찰되지 않았습니다", {
          fontFamily: getPixelFontFamily(),
          fontSize: "10px",
          color: PALETTE_HEX.mutedBrown,
          align: "center",
          wordWrap: { width: infoWidth },
        })
        .setOrigin(0.5, 0);
    }
  }

  private renderListPane(left: number, right: number, top: number, card: CapturedCard | undefined) {
    const width = right - left;
    const centerX = left + width / 2;

    const row = this.add
      .rectangle(centerX, top + ROW_HEIGHT / 2, width, ROW_HEIGHT, PALETTE.ink, 1)
      .setStrokeStyle(2, PALETTE.amber);

    if (card) {
      row.setInteractive({ useHandCursor: true });
      row.on("pointerover", () => row.setFillStyle(PALETTE.wood));
      row.on("pointerout", () => row.setFillStyle(PALETTE.ink));
      row.on("pointerup", () => this.openDetail(card));
    }

    const ballColor = card ? PALETTE.amber : PALETTE.mutedBrown;
    const ball = this.add.graphics({ x: left + 26, y: top + ROW_HEIGHT / 2 });
    ball.fillStyle(ballColor, 1);
    ball.fillCircle(0, 0, 8);
    ball.lineStyle(2, PALETTE.ink, 1);
    ball.strokeCircle(0, 0, 8);

    this.add
      .text(left + 48, top + ROW_HEIGHT / 2, `No.${TUTORIAL_MONSTER.dexNumber}  ${card ? card.name : "???"}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "13px",
        color: card ? CREAM : PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0.5);

    const statsY = top + ROW_HEIGHT + 24;
    this.add
      .text(centerX, statsY, `등록 ${card ? 1 : 0}  ·  전체 ${TOTAL_TUTORIAL_MONSTERS}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: SAND,
      })
      .setOrigin(0.5, 0);
  }

  private openDetail(card: CapturedCard) {
    if (this.detailGroup) return;
    const { width, height } = this.scale;

    const overlay = this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.75)
      .setInteractive()
      .setDepth(20);

    const panelWidth = 560;
    const imageSize = 200;
    const infoWidth = panelWidth - 120;

    const image = this.add
      .image(0, imageSize / 2, "loop-bug")
      .setDisplaySize(imageSize, imageSize * (2 / 3));
    let cursor = imageSize * (2 / 3) + 24;

    const dexNumber = this.add
      .text(0, cursor, `No. ${TUTORIAL_MONSTER.dexNumber}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5, 0);
    cursor += dexNumber.height + 4;

    const name = this.add
      .text(0, cursor, card.name, {
        fontFamily: getPixelFontFamily(),
        fontSize: "18px",
        color: PALETTE_HEX.ink,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    cursor += name.height + 4;

    const classification = this.add
      .text(0, cursor, card.classification, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5, 0);
    cursor += classification.height + 14;

    const description = this.add
      .text(0, cursor, card.description, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.ink,
        align: "center",
        wordWrap: { width: infoWidth },
      })
      .setOrigin(0.5, 0);
    cursor += description.height + 14;

    const snippetBg = this.add
      .rectangle(0, cursor, infoWidth, 46, PALETTE.nightBrown, 0.9)
      .setStrokeStyle(2, PALETTE.ink)
      .setOrigin(0.5, 0);
    const snippetText = this.add
      .text(0, cursor + 8, card.snippet, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.sand,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += 46 + 14;

    const dateLabel = this.add
      .text(0, cursor, new Date(card.capturedAt).toLocaleDateString("ko-KR"), {
        fontFamily: getPixelFontFamily(),
        fontSize: "10px",
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5, 0);
    cursor += dateLabel.height;

    const panelHeight = Math.max(360, cursor + 90);
    const shiftY = -panelHeight / 2 + 16;
    [image, dexNumber, name, classification, description, snippetBg, snippetText, dateLabel].forEach(
      (el) => {
        el.y += shiftY;
      }
    );

    const frame = drawOrnateFrame(this, 0, 0, panelWidth, panelHeight);
    const closeButton = createButton(this, 0, panelHeight / 2 - 32, 100, 32, "닫기", () =>
      this.closeDetail()
    );

    this.detailGroup = this.add
      .container(width / 2, height / 2, [
        frame,
        image,
        dexNumber,
        name,
        classification,
        description,
        snippetBg,
        snippetText,
        dateLabel,
        closeButton,
      ])
      .setDepth(21)
      .setAlpha(0)
      .setScale(0.9);

    this.tweens.add({
      targets: this.detailGroup,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: "Back.Out",
    });

    overlay.on("pointerup", () => this.closeDetail());
    this.detailOverlay = overlay;
    applyPixelFontToScene(this);
  }

  private closeDetail() {
    this.detailOverlay?.destroy();
    this.detailOverlay = undefined;
    this.detailGroup?.destroy(true);
    this.detailGroup = undefined;
  }

  private close() {
    this.scene.stop();
    this.scene.resume("world-map");
  }
}
