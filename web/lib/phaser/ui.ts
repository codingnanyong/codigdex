import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "./palette";
import { pixelText, whenPixelFontReady } from "./pixelFont";

/**
 * Re-rasterizes every Text object already in a scene once the webfont has
 * actually loaded — text drawn before that point bakes the fallback face
 * into its texture and never refreshes on its own. Setting each object's
 * own family back on itself is just the public way to make Phaser redraw
 * that texture; the family string itself doesn't change.
 */
export function applyPixelFontToScene(scene: Phaser.Scene) {
  whenPixelFontReady(() => {
    const restyle = (child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.setFontFamily(child.style.fontFamily);
      } else if (child instanceof Phaser.GameObjects.Container) {
        child.list.forEach(restyle);
      }
    };
    scene.children.list.forEach(restyle);
  });
}

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

  const body = pixelText("body");
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: options.fontFamily ?? body.fontFamily,
      fontSize: options.fontSize ?? body.fontSize,
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

/**
 * Rounded parchment panel with a double border and corner rivets — the
 * shared frame language for the Codigdex and capture-quiz panels.
 */
export function drawOrnateFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { fill?: number; fillAlpha?: number; radius?: number } = {}
): Phaser.GameObjects.Graphics {
  const radius = options.radius ?? 14;
  const fill = options.fill ?? PALETTE.cream;
  const fillAlpha = options.fillAlpha ?? 0.98;
  const left = x - width / 2;
  const top = y - height / 2;

  const g = scene.add.graphics();

  g.fillStyle(PALETTE.nightBrown, 0.35);
  g.fillRoundedRect(left + 4, top + 6, width, height, radius);

  g.fillStyle(fill, fillAlpha);
  g.fillRoundedRect(left, top, width, height, radius);
  g.lineStyle(3, PALETTE.ink, 1);
  g.strokeRoundedRect(left, top, width, height, radius);
  g.lineStyle(1, PALETTE.amber, 0.85);
  g.strokeRoundedRect(left + 7, top + 7, width - 14, height - 14, Math.max(radius - 5, 2));

  g.fillStyle(PALETTE.amber, 1);
  [
    [left + 12, top + 12],
    [left + width - 12, top + 12],
    [left + 12, top + height - 12],
    [left + width - 12, top + height - 12],
  ].forEach(([cx, cy]) => g.fillCircle(cx, cy, 3.5));

  return g;
}

