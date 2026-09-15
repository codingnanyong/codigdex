import Phaser from "phaser";
import { guideDisplayName, type PrimaryJobOption } from "@/lib/domain/player/jobs";
import { lt, t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import {
  addShade,
  applyPixelFontToScene,
  createButton,
  drawOrnateFrame,
  fitTextInside,
} from "../ui";
import { createDialogPortrait } from "../worldMap/dialogPortrait";

type PromotionDialogOptions = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function createPromotionDialog(
  scene: Phaser.Scene,
  job: PrimaryJobOption,
  options: PromotionDialogOptions
): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const shade = addShade(scene, 0.62, 20);
  const frame = drawOrnateFrame(scene, width / 2, height / 2, 690, 310, { radius: 14 });
  const title = scene.add
    .text(width / 2, height / 2 - 126, t(scene, "jobs.confirmTitle", { career: lt(scene, job.name) }), {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.ink,
    })
    .setOrigin(0.5);
  fitTextInside(title, 620, 24);

  const playerX = width / 2 - 248;
  const guideX = width / 2 + 248;
  const roleY = height / 2 - 16;
  const playerFrame = drawOrnateFrame(scene, playerX, roleY, 150, 190, {
    fill: PALETTE.cream,
    radius: 10,
  });
  const guideFrame = drawOrnateFrame(scene, guideX, roleY, 150, 190, {
    fill: PALETTE.wood,
    radius: 10,
  });
  const player = scene.add.image(playerX, roleY - 9, job.textureKey!).setDisplaySize(132, 150);
  const guidePortrait = createDialogPortrait(
    scene,
    job.guideTextureKey ?? job.textureKey!,
    guideX,
    roleY - 10,
    130,
    148
  );
  const playerLabel = scene.add
    .text(playerX, roleY + 76, t(scene, "jobs.myCharacter"), {
      ...pixelText("caption"),
      color: PALETTE_HEX.cream,
      backgroundColor: PALETTE_HEX.maroon,
      padding: { x: 7, y: 4 },
    })
    .setOrigin(0.5);
  const guideLabel = scene.add
    .text(guideX, roleY + 76, `GUIDE NPC · ${lt(scene, guideDisplayName(job))}`, {
      ...pixelText("caption"),
      color: PALETTE_HEX.cream,
      backgroundColor: PALETTE_HEX.ink,
      padding: { x: 7, y: 4 },
    })
    .setOrigin(0.5);
  fitTextInside(guideLabel, 140, 15);
  const body = scene.add
    .text(width / 2, height / 2 - 35, t(scene, "jobs.confirmBody"), {
      ...pixelText("body"),
      color: PALETTE_HEX.mutedBrown,
      align: "center",
      lineSpacing: 8,
    })
    .setOrigin(0.5);
  const cancel = createButton(
    scene,
    width / 2 - 88,
    height / 2 + 123,
    128,
    34,
    t(scene, "common.cancel"),
    options.onCancel
  );
  const confirm = createButton(
    scene,
    width / 2 + 88,
    height / 2 + 123,
    128,
    34,
    t(scene, "jobs.promote"),
    options.onConfirm
  );

  const dialog = scene.add
    .container(0, 0, [
      shade,
      frame,
      title,
      playerFrame,
      guideFrame,
      player,
      ...guidePortrait,
      playerLabel,
      guideLabel,
      body,
      cancel,
      confirm,
    ])
    .setDepth(20)
    .setAlpha(0);
  scene.tweens.add({
    targets: dialog,
    alpha: 1,
    duration: 180,
    ease: "Quad.Out",
  });
  applyPixelFontToScene(scene);
  return dialog;
}
