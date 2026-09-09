import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton } from "../ui";
import { TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";

const INK = PALETTE_HEX.ink;
const HP_SEGMENTS = 5;

interface CodeBattleData {
  monsterId: string;
  npcLine: string;
}

export class CodeBattleScene extends Phaser.Scene {
  private battleData!: CodeBattleData;
  private selection: string[] = [];
  private blockButtons: Phaser.GameObjects.Container[] = [];
  private assemblyText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private hpSegments: Phaser.GameObjects.Rectangle[] = [];
  private monsterSprite!: Phaser.GameObjects.Arc;
  private running = false;

  constructor() {
    super("code-battle");
  }

  init(data: CodeBattleData) {
    this.battleData = data;
    this.selection = [];
    this.blockButtons = [];
    this.hpSegments = [];
    this.running = false;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 20, `${TUTORIAL_MONSTER.npcName}: ${this.battleData.npcLine}`, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: INK,
        backgroundColor: "#f1e4cbcc",
        padding: { x: 10, y: 6 },
        wordWrap: { width: width - 80 },
        align: "center",
      })
      .setOrigin(0.5, 0);

    this.monsterSprite = this.add
      .arc(width / 2, 160, 34, 0, 360, false, 0x6fae5c, 1)
      .setStrokeStyle(3, PALETTE.ink);

    this.add
      .text(width / 2, 160, "슬라임", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: INK,
      })
      .setOrigin(0.5);

    this.createHpBar(width / 2, 210);

    this.add
      .text(width / 2, 250, "블록을 올바른 순서로 눌러 코드를 완성하세요", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.assemblyText = this.add
      .text(width / 2, 285, "> ", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: PALETTE_HEX.ink,
        backgroundColor: "#ffffffaa",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(width / 2, 320, "", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5);

    this.createBlockButtons();

    createButton(this, width / 2, height - 30, 120, 30, "초기화", () =>
      this.resetSelection()
    );
  }

  private createHpBar(centerX: number, y: number) {
    const segmentWidth = 28;
    const gap = 6;
    const totalWidth = HP_SEGMENTS * segmentWidth + (HP_SEGMENTS - 1) * gap;
    const startX = centerX - totalWidth / 2 + segmentWidth / 2;

    for (let i = 0; i < HP_SEGMENTS; i++) {
      const segment = this.add
        .rectangle(startX + i * (segmentWidth + gap), y, segmentWidth, 14, PALETTE.maroon, 1)
        .setStrokeStyle(2, PALETTE.ink);
      this.hpSegments.push(segment);
    }
  }

  private createBlockButtons() {
    const shuffled = Phaser.Utils.Array.Shuffle([...TUTORIAL_MONSTER.codeBlocks]);
    const { width } = this.scale;
    const buttonWidth = 150;
    const gap = 20;
    const totalWidth = shuffled.length * buttonWidth + (shuffled.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

    shuffled.forEach((block, index) => {
      const button = createButton(
        this,
        startX + index * (buttonWidth + gap),
        380,
        buttonWidth,
        44,
        block,
        () => this.onBlockClicked(block)
      );
      this.blockButtons.push(button);
    });
  }

  private onBlockClicked(block: string) {
    if (this.running) return;

    const expectedNext = TUTORIAL_MONSTER.codeBlocks[this.selection.length];
    if (block !== expectedNext) {
      this.feedbackText.setText("순서가 달라요! 다시 시도해보세요.");
      this.resetSelection();
      return;
    }

    this.selection.push(block);
    this.assemblyText.setText(`> ${this.selection.join(" ")}`);
    this.feedbackText.setText("");

    if (this.selection.length === TUTORIAL_MONSTER.codeBlocks.length) {
      this.runCode();
    }
  }

  private resetSelection() {
    this.selection = [];
    this.assemblyText.setText("> ");
  }

  private runCode() {
    this.running = true;
    this.feedbackText.setText("실행 중... 정화의 물을 붓는 중!");

    for (let hit = 0; hit < HP_SEGMENTS; hit++) {
      this.time.delayedCall(300 * (hit + 1), () => {
        const segment = this.hpSegments[hit];
        segment.setFillStyle(PALETTE.sand, 0.5);
        this.tweens.add({
          targets: this.monsterSprite,
          scale: { from: 1, to: 1.15 },
          duration: 120,
          yoyo: true,
        });

        if (hit === HP_SEGMENTS - 1) {
          this.time.delayedCall(400, () => this.onMonsterDefeated());
        }
      });
    }
  }

  private onMonsterDefeated() {
    this.feedbackText.setText("슬라임을 물리쳤어요!");
    this.tweens.add({
      targets: this.monsterSprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start("capture-quiz", { monsterId: this.battleData.monsterId });
      },
    });
  }
}
