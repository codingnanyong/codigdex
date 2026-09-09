import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawGradeMedal, drawOrnateFrame } from "../ui";
import { getPixelFontFamily, whenPixelFontReady } from "../pixelFont";
import { readDexState, writeDexState } from "../registryAdapter";
import { GRADE_COLOR_HEX, GRADE_LABEL } from "../grade";
import { NPC_REACTIONS, TUTORIAL_CHAPTER_TITLE, TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
import { applyCapture, gradeFromScore } from "@/lib/domain/tutorial/capture";

const INK = PALETTE_HEX.ink;
const CORRECT_FLASH = 0x4c8c4a;
const INCORRECT_FLASH = 0xb23a2e;
const OPTION_LETTERS = ["A", "B", "C", "D"];

export class CaptureQuizScene extends Phaser.Scene {
  private questionIndex = 0;
  private correctCount = 0;
  private questionGroup?: Phaser.GameObjects.Container;
  private progressDots: Phaser.GameObjects.Arc[] = [];
  private locked = false;

  constructor() {
    super("capture-quiz");
  }

  init() {
    this.questionIndex = 0;
    this.correctCount = 0;
    this.questionGroup = undefined;
    this.progressDots = [];
    this.locked = false;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.55)
      .setDepth(0);

    const title = this.add
      .text(width / 2, 56, "캡처 퀴즈", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5)
      .setDepth(1);
    whenPixelFontReady(() => title.setFontFamily(getPixelFontFamily()).setFontSize(16));

    this.renderProgressDots(width / 2, 92);
    this.showQuestion();
  }

  private renderProgressDots(centerX: number, y: number) {
    const total = TUTORIAL_MONSTER.quiz.length;
    const gap = 22;
    const startX = centerX - ((total - 1) * gap) / 2;
    this.progressDots = Array.from({ length: total }, (_, i) =>
      this.add
        .circle(startX + i * gap, y, 5, PALETTE.wood, 1)
        .setStrokeStyle(2, PALETTE.cream)
        .setDepth(1)
    );
  }

  private updateProgressDots() {
    this.progressDots.forEach((dot, i) => {
      dot.setFillStyle(i < this.questionIndex ? PALETTE.amber : PALETTE.wood, 1);
    });
  }

  private showQuestion() {
    this.questionGroup?.destroy(true);
    this.updateProgressDots();

    const question = TUTORIAL_MONSTER.quiz[this.questionIndex];
    const { width } = this.scale;
    const elements: Phaser.GameObjects.GameObject[] = [];

    elements.push(drawOrnateFrame(this, width / 2, 212, width - 160, 200, { radius: 16 }).setDepth(1));

    elements.push(
      this.add
        .text(width / 2, 130, `Q${this.questionIndex + 1} / ${TUTORIAL_MONSTER.quiz.length}`, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: PALETTE_HEX.mutedBrown,
        })
        .setOrigin(0.5)
        .setDepth(2)
    );

    elements.push(
      this.add
        .text(width / 2, 164, question.prompt, {
          fontFamily: "monospace",
          fontSize: "16px",
          color: INK,
          align: "center",
          wordWrap: { width: width - 240 },
        })
        .setOrigin(0.5, 0)
        .setDepth(2)
    );

    const buttonWidth = 150;
    const gap = 16;
    const totalWidth = question.choices.length * buttonWidth + (question.choices.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

    question.choices.forEach((choice, index) => {
      const button = createButton(
        this,
        startX + index * (buttonWidth + gap),
        262,
        buttonWidth,
        40,
        `${OPTION_LETTERS[index]}. ${choice}`,
        () => this.onAnswer(index === question.answerIndex, button)
      );
      button.setDepth(2);
      elements.push(button);
    });

    this.questionGroup = this.add.container(0, 0, elements);
  }

  private onAnswer(isCorrect: boolean, button: Phaser.GameObjects.Container) {
    if (this.locked) return;
    this.locked = true;
    if (isCorrect) this.correctCount += 1;

    const bg = button.list[0] as Phaser.GameObjects.Rectangle;
    bg.disableInteractive();
    bg.setFillStyle(isCorrect ? CORRECT_FLASH : INCORRECT_FLASH);

    this.time.delayedCall(450, () => {
      this.locked = false;
      this.advance();
    });
  }

  private advance() {
    this.questionIndex += 1;
    if (this.questionIndex < TUTORIAL_MONSTER.quiz.length) {
      this.showQuestion();
    } else {
      this.updateProgressDots();
      this.questionGroup?.destroy(true);
      this.showResult();
    }
  }

  private showResult() {
    const grade = gradeFromScore(this.correctCount, TUTORIAL_MONSTER.quiz.length);
    const { earnedBadge } = this.registerCapture(grade);
    const { width, height } = this.scale;

    const panelWidth = 640;
    const minPanelHeight = 360;
    const topPad = 30;
    const bottomPad = 70;
    const medalRadius = 30;
    const container = this.add.container(width / 2, height / 2).setDepth(1).setAlpha(0).setScale(0.85);

    // Lay content out from an arbitrary top (cursor = 0) first, so panel
    // height can be sized to whatever this monster's copy actually needs,
    // then shift everything down once the final panel geometry is known.
    let cursor = medalRadius;
    const medal = drawGradeMedal(this, 0, cursor, grade, medalRadius);
    cursor += medalRadius + 14;

    const title = this.add
      .text(0, cursor, `"${TUTORIAL_MONSTER.name}" 카드 등록!`, {
        fontFamily: "monospace",
        fontSize: "15px",
        color: INK,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += title.height + 4;

    const gradeText = this.add
      .text(0, cursor, `${GRADE_LABEL[grade]} 등급`, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: GRADE_COLOR_HEX[grade],
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    cursor += gradeText.height + 12;

    const description = this.add
      .text(0, cursor, TUTORIAL_MONSTER.description, {
        fontFamily: "monospace",
        fontSize: "12px",
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
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.sand,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += 46 + 16;

    const npcLine = this.add
      .text(0, cursor, `${TUTORIAL_MONSTER.npcName}: ${NPC_REACTIONS[grade]}`, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.maroon,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: panelWidth - 120 },
      })
      .setOrigin(0.5, 0);
    cursor += npcLine.height + 10;

    const rewards = this.add
      .text(
        0,
        cursor,
        `⚡ EXP +${TUTORIAL_MONSTER.rewards.exp}   🪙 코인 +${TUTORIAL_MONSTER.rewards.coins}`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: PALETTE_HEX.mutedBrown,
        }
      )
      .setOrigin(0.5, 0);
    cursor += rewards.height;

    const shiftable: Array<Phaser.GameObjects.GameObject & { y: number }> = [
      medal,
      title,
      gradeText,
      description,
      snippetBg,
      snippetText,
      npcLine,
      rewards,
    ];

    let badge: Phaser.GameObjects.Text | undefined;
    if (earnedBadge) {
      cursor += 8;
      badge = this.add
        .text(0, cursor, `🏅 튜토리얼 마스터 배지 획득: ${TUTORIAL_CHAPTER_TITLE}`, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: PALETTE_HEX.amber,
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0);
      cursor += badge.height;
      shiftable.push(badge);
    }

    const contentHeight = cursor;
    const panelHeight = Math.max(minPanelHeight, contentHeight + topPad + bottomPad);
    const shiftY = -panelHeight / 2 + topPad;
    shiftable.forEach((el) => {
      el.y += shiftY;
    });

    const frame = drawOrnateFrame(this, 0, 0, panelWidth, panelHeight);

    const elements: Phaser.GameObjects.GameObject[] = [frame, ...shiftable];

    const confirm = createButton(this, 0, panelHeight / 2 - 32, 120, 34, "확인", () => {
      this.scene.start("world-map");
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

    if (grade === "gold") {
      this.tweens.add({
        targets: medal,
        angle: { from: -8, to: 8 },
        duration: 260,
        yoyo: true,
        repeat: 3,
        ease: "Sine.InOut",
      });
    }
  }

  private registerCapture(grade: ReturnType<typeof gradeFromScore>): { earnedBadge: boolean } {
    const { state, earnedBadge } = applyCapture(readDexState(this.registry), grade);
    writeDexState(this.registry, state);
    return { earnedBadge };
  }
}
