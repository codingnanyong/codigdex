import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "./palette";
import { GRADE_COLOR } from "./grade";
import { getPixelFontFamily, whenPixelFontReady } from "./pixelFont";
import type { CardGrade } from "@/lib/domain/tutorial/content";

/**
 * Re-applies the pixel font to every Text object already in a scene, once
 * the webfont has actually loaded. Text created after that point should
 * just pass `getPixelFontFamily()` directly and never need this — this only
 * catches whatever a scene's `create()` drew before the font was ready.
 */
export function applyPixelFontToScene(scene: Phaser.Scene) {
  whenPixelFontReady(() => {
    const family = getPixelFontFamily();
    const restyle = (child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.setFontFamily(family);
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

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: options.fontFamily ?? getPixelFontFamily(),
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

function starPoints(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points = 5
): Phaser.Math.Vector2[] {
  const step = Math.PI / points;
  const result: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    result.push(new Phaser.Math.Vector2(cx + r * Math.cos(angle), cy + r * Math.sin(angle)));
  }
  return result;
}

/** Grade medal: a shadowed disc with a ring and star, colored by grade. */
export function drawGradeMedal(
  scene: Phaser.Scene,
  x: number,
  y: number,
  grade: CardGrade,
  radius = 24
): Phaser.GameObjects.Graphics {
  const color = GRADE_COLOR[grade];
  const g = scene.add.graphics({ x, y });

  g.fillStyle(PALETTE.nightBrown, 0.3);
  g.fillCircle(2, 3, radius);

  g.fillStyle(PALETTE.cream, 1);
  g.fillCircle(0, 0, radius);
  g.lineStyle(3, color, 1);
  g.strokeCircle(0, 0, radius);
  g.lineStyle(1, PALETTE.ink, 0.6);
  g.strokeCircle(0, 0, radius - 4);

  g.fillStyle(color, 1);
  g.fillPoints(starPoints(0, 0, radius * 0.55, radius * 0.22), true);

  return g;
}
