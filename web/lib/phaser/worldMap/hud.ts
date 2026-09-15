import Phaser from "phaser";
import { lt, t } from "../i18n";
import { createHomeButton } from "../navigation";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { createSettingsButton } from "../settings/settingsButton";
import { createButton, drawOrnateFrame } from "../ui";
import type { WorldBackdrop } from "./progression";

type WorldMapHudOptions = {
  backdrop: WorldBackdrop;
  tutorialCaptured: boolean;
  careerAtlasVisible: boolean;
  onOpenChapterMap: () => void;
  onOpenCodigdex: () => void;
};

export function createWorldMapHud(
  scene: Phaser.Scene,
  options: WorldMapHudOptions
): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const chapterFrame = drawOrnateFrame(scene, width / 2, 24, 340, 34, { radius: 10 });
  const chapterTitle = scene.add
    .text(width / 2, 24, `📘 ${lt(scene, options.backdrop.title)}  ▾`, {
      ...pixelText("body"),
      color: PALETTE_HEX.ink,
    })
    .setOrigin(0.5);
  const chapterHitArea = scene.add
    .rectangle(width / 2, 24, 340, 34, 0xffffff, 0)
    .setInteractive({ useHandCursor: true });
  chapterHitArea.on("pointerover", () => chapterFrame.setAlpha(0.86));
  chapterHitArea.on("pointerout", () => chapterFrame.setAlpha(1));
  chapterHitArea.on("pointerup", options.onOpenChapterMap);

  const items: Phaser.GameObjects.GameObject[] = [
    chapterFrame,
    chapterTitle,
    chapterHitArea,
    createHomeButton(scene),
    createSettingsButton(scene),
  ];
  if (options.tutorialCaptured) {
    items.push(
      createButton(
        scene,
        options.careerAtlasVisible ? width / 2 : width - 70,
        options.careerAtlasVisible ? height - 24 : 26,
        120,
        32,
        t(scene, "common.codigdex"),
        options.onOpenCodigdex
      )
    );
  }
  return scene.add.container(0, 0, items);
}
