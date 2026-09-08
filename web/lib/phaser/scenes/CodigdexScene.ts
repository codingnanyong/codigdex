import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton } from "../ui";
import { readDexState } from "../registryAdapter";
import { CH01_MASTER_BADGE_ID, CapturedCard, TOTAL_CH01_MONSTERS } from "@/lib/domain/ch01/content";

const INK = PALETTE_HEX.ink;
const GRADE_COLOR: Record<CapturedCard["grade"], number> = {
  gold: 0xe6b325,
  silver: 0xb9bfc4,
  bronze: 0xa8703f,
};
const GRADE_LABEL: Record<CapturedCard["grade"], string> = {
  gold: "골드",
  silver: "실버",
  bronze: "브론즈",
};

export class CodigdexScene extends Phaser.Scene {
  constructor() {
    super("codigdex");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.7)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 720, 440, PALETTE.cream, 0.98)
      .setStrokeStyle(3, PALETTE.ink);

    const { cards, badges } = readDexState(this.registry);
    const completion = Math.round((cards.length / TOTAL_CH01_MONSTERS) * 100);

    this.add
      .text(panel.x, panel.y - panel.height / 2 + 26, "Codigdex 도감", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: INK,
      })
      .setOrigin(0.5);

    this.add
      .text(
        panel.x,
        panel.y - panel.height / 2 + 52,
        `CH.01 완성률 ${completion}% (${cards.length}/${TOTAL_CH01_MONSTERS})${
          badges.includes(CH01_MASTER_BADGE_ID) ? "  ·  🏅 챕터 마스터" : ""
        }`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: PALETTE_HEX.mutedBrown,
        }
      )
      .setOrigin(0.5);

    if (cards.length === 0) {
      this.add
        .text(panel.x, panel.y, "아직 등록된 카드가 없습니다.\n몬스터를 물리치고 캡처 퀴즈를 통과해보세요!", {
          fontFamily: "monospace",
          fontSize: "13px",
          color: PALETTE_HEX.mutedBrown,
          align: "center",
        })
        .setOrigin(0.5);
    } else {
      this.renderCardGrid(cards, panel.x - panel.width / 2 + 30, panel.y - 60);
    }

    createButton(this, panel.x, panel.y + panel.height / 2 - 30, 100, 32, "닫기", () =>
      this.close()
    );
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

      this.add
        .rectangle(x, y, cardWidth, cardHeight, PALETTE.wood, 1)
        .setStrokeStyle(3, GRADE_COLOR[card.grade]);

      this.add
        .text(x, y - cardHeight / 2 + 16, card.name, {
          fontFamily: "monospace",
          fontSize: "13px",
          color: PALETTE_HEX.cream,
          align: "center",
          wordWrap: { width: cardWidth - 20 },
        })
        .setOrigin(0.5, 0);

      this.add
        .text(x, y - cardHeight / 2 + 44, GRADE_LABEL[card.grade], {
          fontFamily: "monospace",
          fontSize: "12px",
          color: `#${GRADE_COLOR[card.grade].toString(16).padStart(6, "0")}`,
        })
        .setOrigin(0.5, 0);

      this.add
        .text(x, y - 4, card.description, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: PALETTE_HEX.sand,
          align: "center",
          wordWrap: { width: cardWidth - 20 },
        })
        .setOrigin(0.5, 0);

      const dateLabel = new Date(card.capturedAt).toLocaleDateString("ko-KR");
      this.add
        .text(x, y + cardHeight / 2 - 16, dateLabel, {
          fontFamily: "monospace",
          fontSize: "9px",
          color: PALETTE_HEX.sand,
        })
        .setOrigin(0.5, 1);
    });
  }

  private close() {
    this.scene.stop();
    this.scene.resume("world-map");
  }
}
