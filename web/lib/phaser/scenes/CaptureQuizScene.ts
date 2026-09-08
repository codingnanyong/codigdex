import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton } from "../ui";
import { readDexState, writeDexState } from "../registryAdapter";
import { CH01_MONSTER, NPC_REACTIONS } from "@/lib/domain/ch01/content";
import { applyCapture, gradeFromScore } from "@/lib/domain/ch01/capture";

const INK = PALETTE_HEX.ink;

export class CaptureQuizScene extends Phaser.Scene {
  private questionIndex = 0;
  private correctCount = 0;
  private questionGroup?: Phaser.GameObjects.Container;

  constructor() {
    super("capture-quiz");
  }

  init() {
    this.questionIndex = 0;
    this.correctCount = 0;
    this.questionGroup = undefined;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.55)
      .setDepth(0);

    this.add
      .text(width / 2, 70, "캡처 퀴즈", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5)
      .setDepth(1);

    this.showQuestion();
  }

  private showQuestion() {
    this.questionGroup?.destroy(true);

    const question = CH01_MONSTER.quiz[this.questionIndex];
    const { width } = this.scale;
    const elements: Phaser.GameObjects.GameObject[] = [];

    const counter = this.add
      .text(width / 2, 120, `Q${this.questionIndex + 1} / ${CH01_MONSTER.quiz.length}`, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.sand,
      })
      .setOrigin(0.5)
      .setDepth(1);
    elements.push(counter);

    const prompt = this.add
      .text(width / 2, 160, question.prompt, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14cc",
        padding: { x: 12, y: 8 },
        wordWrap: { width: width - 160 },
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1);
    elements.push(prompt);

    const buttonWidth = 130;
    const gap = 16;
    const totalWidth = question.choices.length * buttonWidth + (question.choices.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

    question.choices.forEach((choice, index) => {
      const button = createButton(
        this,
        startX + index * (buttonWidth + gap),
        230,
        buttonWidth,
        40,
        choice,
        () => this.onAnswer(index === question.answerIndex)
      );
      button.setDepth(1);
      elements.push(button);
    });

    this.questionGroup = this.add.container(0, 0, elements);
  }

  private onAnswer(isCorrect: boolean) {
    if (isCorrect) this.correctCount += 1;

    this.questionIndex += 1;
    if (this.questionIndex < CH01_MONSTER.quiz.length) {
      this.showQuestion();
    } else {
      this.questionGroup?.destroy(true);
      this.showResult();
    }
  }

  private showResult() {
    const grade = gradeFromScore(this.correctCount, CH01_MONSTER.quiz.length);
    const { earnedBadge } = this.registerCapture(grade);
    const { width, height } = this.scale;

    const gradeLabel = { gold: "골드", silver: "실버", bronze: "브론즈" }[grade];

    const lines = [
      `"${CH01_MONSTER.name}" 카드를 ${gradeLabel} 등급으로 등록했습니다!`,
      "",
      // Broken at the sentence boundary so each rendered line already fits
      // the panel width — Phaser's wordWrap does not reserve extra vertical
      // space for a line it wraps internally, which caused text below it to
      // overlap the wrapped second half.
      CH01_MONSTER.description.replace(". ", ".\n"),
      "",
      CH01_MONSTER.snippet,
      "",
      `${CH01_MONSTER.npcName}: ${NPC_REACTIONS[grade]}`,
      "",
      `EXP +${CH01_MONSTER.rewards.exp} · 코인 +${CH01_MONSTER.rewards.coins}`,
    ];

    if (earnedBadge) {
      lines.push("", "🏅 챕터 마스터 배지 획득: CH.01 반복문의 숲");
    }

    this.add
      .rectangle(width / 2, height / 2, 640, 340, PALETTE.cream, 0.98)
      .setStrokeStyle(3, PALETTE.ink)
      .setDepth(1);

    this.add
      .text(width / 2, height / 2 - 130, lines.join("\n"), {
        fontFamily: "monospace",
        fontSize: "13px",
        color: INK,
        align: "center",
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    createButton(this, width / 2, height / 2 + 150, 120, 34, "확인", () => {
      this.scene.start("world-map");
    }).setDepth(2);
  }

  private registerCapture(grade: ReturnType<typeof gradeFromScore>): { earnedBadge: boolean } {
    const { state, earnedBadge } = applyCapture(readDexState(this.registry), grade);
    writeDexState(this.registry, state);
    return { earnedBadge };
  }
}
