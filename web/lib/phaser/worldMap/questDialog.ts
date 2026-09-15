import type Phaser from "phaser";
import { t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton } from "../ui";
import { createDialogPortrait } from "./dialogPortrait";

const BOX_HEIGHT = 132;

export interface QuestDialogOptions {
  speaker: string;
  message: string;
  portraitTextureKey?: string;
  onStart: () => void;
  onClose: () => void;
}

/** A cinematic bottom dialog bar for the guide's quest pitch. */
export function showQuestDialog(
  scene: Phaser.Scene,
  options: QuestDialogOptions
): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const centerY = height - BOX_HEIGHT / 2;
  const top = height - BOX_HEIGHT;
  const textLeft = options.portraitTextureKey ? 270 : 30;
  const buttonY = height - 24;

  const shadow = scene.add.rectangle(
    width / 2,
    centerY - 5,
    width,
    BOX_HEIGHT + 10,
    PALETTE.ink,
    0.45
  );
  const frame = scene.add
    .rectangle(width / 2, centerY, width, BOX_HEIGHT, PALETTE.nightBrown, 0.94)
    .setStrokeStyle(3, PALETTE.ink);
  const topLine = scene.add.rectangle(width / 2, top + 2, width, 3, PALETTE.amber, 0.9);
  const portrait = options.portraitTextureKey
    ? createDialogPortrait(scene, options.portraitTextureKey, 130, height - 108, 194, 204)
    : [];
  const namePlate = options.portraitTextureKey
    ? scene.add
        .rectangle(142, height - 27, 184, 32, PALETTE.maroon, 0.98)
        .setStrokeStyle(2, PALETTE.amber, 0.9)
    : undefined;
  const speaker = scene.add
    .text(
      options.portraitTextureKey ? 142 : textLeft,
      options.portraitTextureKey ? height - 27 : top + 18,
      options.speaker,
      {
        ...pixelText("body"),
        color: options.portraitTextureKey ? PALETTE_HEX.cream : PALETTE_HEX.amber,
      }
    )
    .setOrigin(options.portraitTextureKey ? 0.5 : 0, options.portraitTextureKey ? 0.5 : 0);
  const body = scene.add.text(textLeft, top + 25, options.message, {
    ...pixelText("body"),
    color: PALETTE_HEX.cream,
    wordWrap: { width: width - textLeft - 28 },
    lineSpacing: 5,
  });
  const startButton = createButton(
    scene,
    width - 88,
    buttonY,
    152,
    30,
    t(scene, "world.startBattle"),
    options.onStart
  );
  const closeButton = createButton(scene, width - 218, buttonY, 88, 30, t(scene, "common.close"), options.onClose);

  const items: Phaser.GameObjects.GameObject[] = [shadow, frame, topLine, ...portrait];
  if (namePlate) items.push(namePlate);
  items.push(speaker, body, startButton, closeButton);

  const dialog = scene.add.container(0, 0, items).setDepth(10);
  applyPixelFontToScene(scene);
  return dialog;
}
