import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawGbcBox } from "./gbcBox";
import { COMMAND_BOX } from "./layout";

const CORRECT_FLASH = 0x4c8c4a;
const INCORRECT_FLASH = 0xb23a2e;
const CELL_IDLE = 0x2a1d14;
const OPTION_LETTERS = ["A", "B", "C", "D"];
const PAD = 28;
const CELL_GAP = 20;

/** The dark command box and its answer cells, laid out two by two. */
export class AnswerGrid {
  private readonly scene: Phaser.Scene;
  private cells: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    drawGbcBox(scene, COMMAND_BOX, PALETTE.ink);
  }

  /** Replaces the current cells with `choices`, reporting a click by its choice index. */
  show(choices: readonly string[], onPick: (index: number) => void) {
    this.clear();

    const { x, y, width, height } = COMMAND_BOX;
    const cellWidth = (width - PAD * 2 - CELL_GAP) / 2;
    const cellHeight = (height - PAD * 2 - CELL_GAP) / 2;
    const gridLeft = x - width / 2 + PAD;
    const gridTop = y - height / 2 + PAD;
    const columns = [gridLeft + cellWidth / 2, gridLeft + cellWidth + CELL_GAP + cellWidth / 2];
    const rows = [gridTop + cellHeight / 2, gridTop + cellHeight + CELL_GAP + cellHeight / 2];

    this.cells = choices.map((choice, index) =>
      this.createCell(
        columns[index % 2],
        rows[Math.floor(index / 2)],
        cellWidth,
        cellHeight,
        `${OPTION_LETTERS[index]}. ${choice}`,
        () => onPick(index)
      )
    );
  }

  /** Flashes the picked cell green or red and stops it taking more clicks. */
  mark(index: number, correct: boolean) {
    const bg = this.cells[index]?.list[0] as Phaser.GameObjects.Rectangle | undefined;
    bg?.disableInteractive();
    bg?.setFillStyle(correct ? CORRECT_FLASH : INCORRECT_FLASH);
  }

  clear() {
    this.cells.forEach((cell) => cell.destroy());
    this.cells = [];
  }

  private createCell(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.scene.add
      .rectangle(0, 0, width, height, CELL_IDLE, 1)
      .setStrokeStyle(1, PALETTE.cream, 0.35)
      .setInteractive({ useHandCursor: true });

    const text = this.scene.add
      .text(0, 0, label, {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
        align: "center",
        wordWrap: { width: width - 20 },
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => bg.setFillStyle(PALETTE.wood));
    bg.on("pointerout", () => bg.setFillStyle(CELL_IDLE));
    bg.on("pointerup", onClick);

    return this.scene.add.container(x, y, [bg, text]);
  }
}
