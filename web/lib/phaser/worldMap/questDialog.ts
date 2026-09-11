import type Phaser from "phaser";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame } from "../ui";

const BOX = { width: 560, height: 150 };

export interface QuestDialogOptions {
  speaker: string;
  message: string;
  onStart: () => void;
  onClose: () => void;
}

/** The guide's quest pitch along the bottom of the map, with start and close buttons. */
export function showQuestDialog(scene: Phaser.Scene, options: QuestDialogOptions): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const centerY = height - 110;
  const left = width / 2 - BOX.width / 2;
  const top = centerY - BOX.height / 2;
  const buttonY = centerY + BOX.height / 2 - 24;

  const frame = drawOrnateFrame(scene, width / 2, centerY, BOX.width, BOX.height, { radius: 14 });
  const speaker = scene.add.text(left + 20, top + 16, options.speaker, {
    ...pixelText("body"),
    color: PALETTE_HEX.maroon,
  });
  const body = scene.add.text(left + 20, top + 40, options.message, {
    ...pixelText("body"),
    color: PALETTE_HEX.ink,
    wordWrap: { width: BOX.width - 40 },
  });
  const startButton = createButton(scene, width / 2 + BOX.width / 2 - 90, buttonY, 140, 32, "코드 배틀 시작", options.onStart);
  const closeButton = createButton(scene, left + 60, buttonY, 80, 32, "닫기", options.onClose);

  const dialog = scene.add.container(0, 0, [frame, speaker, body, startButton, closeButton]).setDepth(10);
  applyPixelFontToScene(scene);
  return dialog;
}
