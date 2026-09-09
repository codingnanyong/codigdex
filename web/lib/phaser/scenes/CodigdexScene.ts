import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawGradeMedal, drawOrnateFrame } from "../ui";
import { getPixelFontFamily, whenPixelFontReady } from "../pixelFont";
import { readDexState } from "../registryAdapter";
import { GRADE_LABEL } from "../grade";
import { CapturedCard, TOTAL_TUTORIAL_MONSTERS, TUTORIAL_MASTER_BADGE_ID } from "@/lib/domain/tutorial/content";

const INK = PALETTE_HEX.ink;

export class CodigdexScene extends Phaser.Scene {
  constructor() {
    super("codigdex");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.7)
      .setInteractive();

    const panelX = width / 2;
    const panelY = height / 2;
    drawOrnateFrame(this, panelX, panelY, 720, 440);

    const { cards, badges } = readDexState(this.registry);
    const completion = Math.round((cards.length / TOTAL_TUTORIAL_MONSTERS) * 100);
    const hasBadge = badges.includes(TUTORIAL_MASTER_BADGE_ID);

    const title = this.add
      .text(panelX, panelY - 220 + 30, "Codigdex 도감", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: INK,
      })
      .setOrigin(0.5);
    whenPixelFontReady(() => title.setFontFamily(getPixelFontFamily()).setFontSize(16));

    this.renderProgressBar(panelX, panelY - 220 + 60, completion, cards.length, hasBadge);

    if (cards.length === 0) {
      this.add
        .text(panelX, panelY, "아직 등록된 카드가 없습니다.\n몬스터를 물리치고 캡처 퀴즈를 통과해보세요!", {
          fontFamily: "monospace",
          fontSize: "13px",
          color: PALETTE_HEX.mutedBrown,
          align: "center",
        })
        .setOrigin(0.5);
    } else {
      this.renderCardGrid(cards, panelX - 720 / 2 + 30, panelY - 60);
    }

    createButton(this, panelX, panelY + 220 - 30, 100, 32, "닫기", () => this.close());
  }

  private renderProgressBar(
    centerX: number,
    y: number,
    completion: number,
    cardCount: number,
    hasBadge: boolean
  ) {
    const barWidth = 460;
    const barHeight = 14;
    const left = centerX - barWidth / 2;

    this.add
      .rectangle(centerX, y, barWidth, barHeight, PALETTE.wood, 1)
      .setStrokeStyle(2, PALETTE.ink);

    const fillWidth = Math.max(4, (barWidth - 4) * (completion / 100));
    this.add
      .rectangle(left + 2, y, fillWidth, barHeight - 4, PALETTE.amber, 1)
      .setOrigin(0, 0.5);

    const label = hasBadge
      ? `튜토리얼 완성률 ${completion}% (${cardCount}/${TOTAL_TUTORIAL_MONSTERS})  ·  🏅 튜토리얼 마스터`
      : `튜토리얼 완성률 ${completion}% (${cardCount}/${TOTAL_TUTORIAL_MONSTERS})`;

    this.add
      .text(centerX, y + 20, label, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5, 0);
  }

  private renderCardGrid(cards: CapturedCard[], startX: number, startY: number) {
    const cardWidth = 200;
    const cardHeight = 170;
    const gap = 20;
    const columns = 3;

    cards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + gap) + cardWidth / 2;
      const y = startY + row * (cardHeight + gap) + cardHeight / 2;

      const container = this.add.container(x, y);
      container.setScale(0.8);
      container.setAlpha(0);

      const shadow = this.add.rectangle(3, 5, cardWidth, cardHeight, PALETTE.nightBrown, 0.35);
      const face = this.add
        .rectangle(0, 0, cardWidth, cardHeight, PALETTE.wood, 1)
        .setStrokeStyle(3, PALETTE.ink);

      const name = this.add
        .text(0, -cardHeight / 2 + 16, card.name, {
          fontFamily: "monospace",
          fontSize: "13px",
          color: PALETTE_HEX.cream,
          align: "center",
          wordWrap: { width: cardWidth - 20 },
        })
        .setOrigin(0.5, 0);

      const gradeLabel = this.add
        .text(0, -cardHeight / 2 + 44, GRADE_LABEL[card.grade], {
          fontFamily: "monospace",
          fontSize: "12px",
          color: PALETTE_HEX.sand,
        })
        .setOrigin(0.5, 0);

      const description = this.add
        .text(0, 0, card.description, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: PALETTE_HEX.sand,
          align: "center",
          wordWrap: { width: cardWidth - 20 },
        })
        .setOrigin(0.5, 0);

      const dateLabel = new Date(card.capturedAt).toLocaleDateString("ko-KR");
      const date = this.add
        .text(0, cardHeight / 2 - 16, dateLabel, {
          fontFamily: "monospace",
          fontSize: "9px",
          color: PALETTE_HEX.sand,
        })
        .setOrigin(0.5, 1);

      const medal = drawGradeMedal(this, cardWidth / 2 - 20, -cardHeight / 2 + 20, card.grade, 16);

      container.add([shadow, face, medal, name, gradeLabel, description, date]);

      if (card.grade === "gold") {
        this.tweens.add({
          targets: medal,
          alpha: { from: 0.65, to: 1 },
          duration: 700,
          ease: "Sine.InOut",
          yoyo: true,
          repeat: -1,
        });
      }

      this.tweens.add({
        targets: container,
        scale: 1,
        alpha: 1,
        delay: index * 70,
        duration: 220,
        ease: "Back.Out",
      });
    });
  }

  private close() {
    this.scene.stop();
    this.scene.resume("world-map");
  }
}
