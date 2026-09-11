import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawGbcBox } from "./gbcBox";
import { MESSAGE_BOX } from "./layout";

/** The cream box holding the question counter, the prompt and a feedback line. */
export class MessagePanel {
  private readonly progress: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Text;
  private readonly feedback: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { x, width, height } = MESSAGE_BOX;
    const left = x - width / 2;
    const top = MESSAGE_BOX.y - height / 2;

    drawGbcBox(scene, MESSAGE_BOX, PALETTE.cream);

    this.progress = scene.add
      .text(left + 18, top + 14, "", {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0);

    // Keep the prompt in its own vertical region so multiline examples never
    // collide with the bottom-anchored feedback line.
    this.prompt = scene.add
      .text(x, top + 40, "", {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
        align: "center",
        wordWrap: { width: width - 90 },
      })
      .setOrigin(0.5, 0);

    this.feedback = scene.add
      .text(x, top + height - 16, "", {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5, 1);
  }

  showQuestion(index: number, total: number, prompt: string) {
    this.progress.setText(`Q${index + 1} / ${total}`);
    this.prompt.setText(prompt);
    this.feedback.setText("");
  }

  say(line: string) {
    this.feedback.setText(line);
  }
}
