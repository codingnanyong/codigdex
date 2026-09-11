import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";

export const DEX_PANEL = { width: 780, height: 460, inset: 16 };

export interface DexScreen {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/** The red handheld shell, its dark screen, and the title across the top. Returns the screen's bounds. */
export function drawDexShell(scene: Phaser.Scene): DexScreen {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;
  const screen: DexScreen = {
    width: DEX_PANEL.width - DEX_PANEL.inset * 2,
    height: DEX_PANEL.height - DEX_PANEL.inset * 2,
    left: centerX - (DEX_PANEL.width - DEX_PANEL.inset * 2) / 2,
    top: centerY - (DEX_PANEL.height - DEX_PANEL.inset * 2) / 2,
    centerX,
    centerY,
  };

  const g = scene.add.graphics();
  const bezelLeft = centerX - DEX_PANEL.width / 2;
  const bezelTop = centerY - DEX_PANEL.height / 2;
  g.fillStyle(PALETTE.nightBrown, 0.4);
  g.fillRoundedRect(bezelLeft + 4, bezelTop + 6, DEX_PANEL.width, DEX_PANEL.height, 20);
  g.fillStyle(PALETTE.maroon, 1);
  g.fillRoundedRect(bezelLeft, bezelTop, DEX_PANEL.width, DEX_PANEL.height, 20);
  g.lineStyle(3, PALETTE.ink, 1);
  g.strokeRoundedRect(bezelLeft, bezelTop, DEX_PANEL.width, DEX_PANEL.height, 20);
  g.fillStyle(PALETTE.nightBrown, 1);
  g.fillRoundedRect(screen.left, screen.top, screen.width, screen.height, 12);
  g.lineStyle(2, PALETTE.ink, 1);
  g.strokeRoundedRect(screen.left, screen.top, screen.width, screen.height, 12);

  const headerY = screen.top + 22;
  [-92, 92].forEach((offset) => {
    const badge = scene.add.graphics({ x: centerX + offset, y: headerY });
    badge.fillStyle(PALETTE.amber, 1);
    badge.fillCircle(0, 0, 6);
    badge.lineStyle(1.5, PALETTE.ink, 1);
    badge.strokeCircle(0, 0, 6);
  });
  scene.add
    .text(centerX, headerY, "CODIGDEX 도감", {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.cream,
    })
    .setOrigin(0.5);
  scene.add.rectangle(centerX, screen.top + 42, screen.width - 24, 1, PALETTE.mutedBrown, 0.6);

  return screen;
}
