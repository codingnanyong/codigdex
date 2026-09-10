import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { applyPixelFontToScene } from "../ui";
import { getPixelFontFamily } from "../pixelFont";
import { TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";

const INK = PALETTE_HEX.ink;
const CORRECT_FLASH = 0x4c8c4a;
const INCORRECT_FLASH = 0xb23a2e;
const CELL_IDLE = 0x2a1d14;
const HP_GREEN = 0x4c8c4a;
const HP_YELLOW = 0xd9a441;
const HP_RED = 0xb23a2e;
const OPTION_LETTERS = ["A", "B", "C", "D"];
const HP_SEGMENTS = TUTORIAL_MONSTER.quiz.length;
const HP_BAR_WIDTH = 150;
const HP_BAR_HEIGHT = 10;

function hpColorFor(ratio: number): number {
  if (ratio > 0.5) return HP_GREEN;
  if (ratio > 0.2) return HP_YELLOW;
  return HP_RED;
}

const STATUS_BOX = { x: 200, y: 118, width: 280, height: 76 };
const MESSAGE_BOX = { x: 480, y: 280, width: 860, height: 110 };
const COMMAND_BOX = { x: 480, y: 440, width: 860, height: 150 };

interface CodeBattleData {
  monsterId: string;
  npcLine: string;
}

export class CodeBattleScene extends Phaser.Scene {
  private battleData!: CodeBattleData;
  private questionIndex = 0;
  private correctCount = 0;
  private locked = false;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private answerCells: Phaser.GameObjects.Container[] = [];
  private questionText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private monsterSprite!: Phaser.GameObjects.Image;
  private monsterBaseScale = 1;

  constructor() {
    super("code-battle");
  }

  init(data: CodeBattleData) {
    this.battleData = data;
    this.questionIndex = 0;
    this.correctCount = 0;
    this.locked = false;
    this.answerCells = [];
  }

  preload() {
    this.load.image("loop-bug", "/assets/monsters/loop-bug.png");
  }

  create() {
    const { width } = this.scale;

    this.add
      .text(width / 2, 12, `${TUTORIAL_MONSTER.npcName}: ${this.battleData.npcLine}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: INK,
        backgroundColor: "#f1e4cbcc",
        padding: { x: 10, y: 5 },
        wordWrap: { width: width - 80 },
        align: "center",
      })
      .setOrigin(0.5, 0);

    this.drawStatusBox();

    this.monsterSprite = this.add
      .image(700, 148, "loop-bug")
      .setDisplaySize(190, 127);
    this.monsterBaseScale = this.monsterSprite.scale;

    this.drawMessageBox();
    this.drawCommandBox();

    this.showQuestion();
    applyPixelFontToScene(this);
  }

  /**
   * Authentic Game Boy battle-screen boxes are crisp rectangles with a thin
   * flat border — no rounded corners, no rivets. That's a deliberately
   * different frame language from the parchment `drawOrnateFrame` used on
   * the overworld/dex screens; battle stays true to the GBC reference.
   */
  private drawGbcBox(x: number, y: number, width: number, height: number, fill: number) {
    const left = x - width / 2;
    const top = y - height / 2;

    const g = this.add.graphics();
    g.fillStyle(PALETTE.nightBrown, 0.3);
    g.fillRect(left + 3, top + 4, width, height);
    g.fillStyle(fill, 1);
    g.fillRect(left, top, width, height);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRect(left, top, width, height);
    return g;
  }

  private drawStatusBox() {
    const { x, y, width, height } = STATUS_BOX;
    const left = x - width / 2;
    const top = y - height / 2;

    this.drawGbcBox(x, y, width, height, PALETTE.cream);

    this.add
      .text(left + 16, top + 12, `${TUTORIAL_MONSTER.name}  Lv.${TUTORIAL_MONSTER.level}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: INK,
      })
      .setOrigin(0, 0);

    this.add
      .text(left + 16, top + 42, "HP", {
        fontFamily: getPixelFontFamily(),
        fontSize: "10px",
        color: INK,
        fontStyle: "italic",
      })
      .setOrigin(0, 0.5);

    this.createHpBar(left + 44, top + 42);
  }

  private createHpBar(barLeft: number, y: number) {
    this.add
      .rectangle(barLeft, y, HP_BAR_WIDTH, HP_BAR_HEIGHT, PALETTE.ink, 1)
      .setOrigin(0, 0.5);

    this.hpBarFill = this.add
      .rectangle(barLeft + 1, y, HP_BAR_WIDTH - 2, HP_BAR_HEIGHT - 2, hpColorFor(1), 1)
      .setOrigin(0, 0.5);
  }

  private drawMessageBox() {
    const { x, y, width, height } = MESSAGE_BOX;
    const left = x - width / 2;
    const top = y - height / 2;

    this.drawGbcBox(x, y, width, height, PALETTE.cream);

    this.progressText = this.add
      .text(left + 18, top + 14, "", {
        fontFamily: getPixelFontFamily(),
        fontSize: "10px",
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0);

    this.questionText = this.add
      .text(x, top + 34, "", {
        fontFamily: getPixelFontFamily(),
        fontSize: "14px",
        color: INK,
        align: "center",
        wordWrap: { width: width - 90 },
      })
      .setOrigin(0.5, 0);

    this.feedbackText = this.add
      .text(x, top + height - 16, "", {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5, 1);
  }

  private drawCommandBox() {
    const { x, y, width, height } = COMMAND_BOX;
    this.drawGbcBox(x, y, width, height, PALETTE.ink);
  }

  private showQuestion() {
    this.answerCells.forEach((cell) => cell.destroy());
    this.answerCells = [];
    this.feedbackText.setText("");

    const question = TUTORIAL_MONSTER.quiz[this.questionIndex];
    this.progressText.setText(`Q${this.questionIndex + 1} / ${TUTORIAL_MONSTER.quiz.length}`);
    this.questionText.setText(question.prompt);

    const { x, y, width, height } = COMMAND_BOX;
    const pad = 28;
    const cellGap = 20;
    const cellWidth = (width - pad * 2 - cellGap) / 2;
    const cellHeight = (height - pad * 2 - cellGap) / 2;
    const gridLeft = x - width / 2 + pad;
    const gridTop = y - height / 2 + pad;
    const colX = [gridLeft + cellWidth / 2, gridLeft + cellWidth + cellGap + cellWidth / 2];
    const rowY = [gridTop + cellHeight / 2, gridTop + cellHeight + cellGap + cellHeight / 2];

    question.choices.forEach((choice, index) => {
      const cx = colX[index % 2];
      const cy = rowY[Math.floor(index / 2)];
      const cell = this.createAnswerCell(
        cx,
        cy,
        cellWidth,
        cellHeight,
        `${OPTION_LETTERS[index]}. ${choice}`,
        () => this.onAnswer(index === question.answerIndex, cell)
      );
      this.answerCells.push(cell);
    });
  }

  private createAnswerCell(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add
      .rectangle(0, 0, width, height, CELL_IDLE, 1)
      .setStrokeStyle(1, PALETTE.cream, 0.35)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [bg, text]);

    bg.on("pointerover", () => bg.setFillStyle(PALETTE.wood));
    bg.on("pointerout", () => bg.setFillStyle(CELL_IDLE));
    bg.on("pointerup", onClick);

    return container;
  }

  private onAnswer(isCorrect: boolean, cell: Phaser.GameObjects.Container) {
    if (this.locked) return;
    this.locked = true;

    const bg = cell.list[0] as Phaser.GameObjects.Rectangle;
    bg.disableInteractive();
    bg.setFillStyle(isCorrect ? CORRECT_FLASH : INCORRECT_FLASH);

    if (isCorrect) {
      this.correctCount += 1;
      this.feedbackText.setText("명중! 타격을 줬어요.");
      this.damageMonster();
    } else {
      this.feedbackText.setText("안 통했어요!");
    }

    this.time.delayedCall(650, () => {
      this.locked = false;
      this.advance();
    });
  }

  private damageMonster() {
    const remainingRatio = (HP_SEGMENTS - this.correctCount) / HP_SEGMENTS;
    this.hpBarFill.setFillStyle(hpColorFor(remainingRatio));
    this.tweens.add({
      targets: this.hpBarFill,
      scaleX: remainingRatio,
      duration: 260,
      ease: "Cubic.Out",
    });
    this.tweens.add({
      targets: this.monsterSprite,
      scale: this.monsterBaseScale * 1.15,
      duration: 120,
      yoyo: true,
    });
  }

  private advance() {
    this.questionIndex += 1;
    if (this.questionIndex < TUTORIAL_MONSTER.quiz.length) {
      this.showQuestion();
      return;
    }

    this.answerCells.forEach((cell) => cell.destroy());
    this.answerCells = [];

    if (this.correctCount === HP_SEGMENTS) {
      this.feedbackText.setText("무한루프 버그를 물리쳤어요!");
      this.tweens.add({
        targets: this.monsterSprite,
        alpha: 0,
        duration: 500,
        onComplete: () => this.finishBattle(),
      });
    } else {
      this.feedbackText.setText("전투 종료! 도감에 결과를 등록할게요.");
      this.time.delayedCall(700, () => this.finishBattle());
    }
  }

  private finishBattle() {
    this.scene.start("capture-quiz", {
      monsterId: this.battleData.monsterId,
      correctCount: this.correctCount,
    });
  }
}
