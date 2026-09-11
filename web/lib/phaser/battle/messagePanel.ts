import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { addSnippetBlock } from "../ui";
import { drawGbcBox } from "./gbcBox";
import { MESSAGE_BOX } from "./layout";
import { formatPrompt } from "./promptFormat";

const INSET = 18;
const HEADER_TOP = 12;
const PROMPT_TOP = 34;
const PROMPT_BOTTOM_PAD = 10;
const SNIPPET_WIDTH = 360;

export interface QuestionView {
  index: number;
  total: number;
  correct: number;
  required: number;
  prompt: string;
}

/** The cream box: a progress row carrying the pass line and feedback, then the prompt with any code set apart. */
export class MessagePanel {
  private readonly scene: Phaser.Scene;
  private readonly progress: Phaser.GameObjects.Text;
  private readonly feedback: Phaser.GameObjects.Text;
  private prompt?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { x, width, height } = MESSAGE_BOX;
    const left = x - width / 2;
    const top = MESSAGE_BOX.y - height / 2;

    drawGbcBox(scene, MESSAGE_BOX, PALETTE.cream);

    this.progress = scene.add
      .text(left + INSET, top + HEADER_TOP, "", {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0);

    // Feedback shares the progress row, so a tall prompt never runs into it.
    this.feedback = scene.add
      .text(left + width - INSET, top + HEADER_TOP, "", {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(1, 0);
  }

  showQuestion({ index, total, correct, required, prompt }: QuestionView) {
    this.progress.setText(`Q${index + 1} / ${total}  ·  정답 ${correct}  ·  목표 ${required}개`);
    this.feedback.setText("");
    this.prompt?.destroy();

    const { x, width, height } = MESSAGE_BOX;
    const { code, text } = formatPrompt(prompt);
    const parts: Phaser.GameObjects.GameObject[] = [];
    let cursor = 0;

    if (code.length > 0) {
      const snippet = addSnippetBlock(this.scene, cursor, SNIPPET_WIDTH, code.join("\n"), { align: "left" });
      parts.push(snippet.plate, snippet.text);
      cursor += snippet.height + 6;
    }

    const question = this.scene.add
      .text(0, cursor, text, {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
        align: "center",
        wordWrap: { width: width - 90 },
      })
      .setOrigin(0.5, 0);
    parts.push(question);
    cursor += question.height;

    // Center the prompt block in the space under the progress row.
    const areaTop = MESSAGE_BOX.y - height / 2 + PROMPT_TOP;
    const areaHeight = height - PROMPT_TOP - PROMPT_BOTTOM_PAD;
    this.prompt = this.scene.add.container(x, Math.round(areaTop + Math.max(0, (areaHeight - cursor) / 2)), parts);
  }

  say(line: string) {
    this.feedback.setText(line);
  }
}
