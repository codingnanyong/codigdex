import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "./palette";

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  options: { fontSize?: string; fontFamily?: string } = {}
): Phaser.GameObjects.Container {
  const bg = scene.add
    .rectangle(0, 0, width, height, PALETTE.wood, 1)
    .setStrokeStyle(2, PALETTE.ink)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: options.fontFamily ?? "monospace",
      fontSize: options.fontSize ?? "13px",
      color: PALETTE_HEX.cream,
      align: "center",
      wordWrap: { width: width - 16 },
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [bg, text]);

  bg.on("pointerover", () => bg.setFillStyle(PALETTE.maroon));
  bg.on("pointerout", () => bg.setFillStyle(PALETTE.wood));
  bg.on("pointerdown", () => bg.setFillStyle(PALETTE.amber));
  bg.on("pointerup", () => {
    bg.setFillStyle(PALETTE.maroon);
    onClick();
  });

  return container;
}
