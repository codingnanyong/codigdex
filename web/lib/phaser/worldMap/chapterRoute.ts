import Phaser from "phaser";
import type { ChapterDefinition } from "@/lib/domain/chapters/types";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";

export interface RoutePoint {
  x: number;
  y: number;
}

const ROUTES: Partial<Record<ChapterDefinition["id"], readonly RoutePoint[]>> = {
  git: [
    { x: 142, y: 432 },
    { x: 292, y: 374 },
    { x: 464, y: 418 },
    { x: 638, y: 350 },
    { x: 798, y: 300 },
  ],
  linux: [
    { x: 145, y: 410 },
    { x: 302, y: 350 },
    { x: 480, y: 390 },
    { x: 658, y: 340 },
    { x: 812, y: 405 },
  ],
};

export function routePointsFor(chapter: ChapterDefinition): readonly RoutePoint[] | undefined {
  const points = ROUTES[chapter.id];
  return points?.length === chapter.stages.length ? points : undefined;
}

/** Draws progression checkpoints directly over the chapter wallpaper. */
export function drawChapterRoute(
  scene: Phaser.Scene,
  chapter: ChapterDefinition,
  captured: ReadonlySet<string>,
  activeIndex: number,
  onActiveSelect: () => void
) {
  const points = routePointsFor(chapter);
  if (!points) return;

  const path = scene.add.graphics().setDepth(1);
  path.lineStyle(8, PALETTE.nightBrown, 0.52);
  path.beginPath();
  path.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
  path.strokePath();
  path.lineStyle(3, PALETTE.sand, 0.9);
  path.beginPath();
  path.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
  path.strokePath();

  points.forEach((point, index) => {
    const cleared = captured.has(chapter.stages[index].id);
    const active = index === activeIndex;
    const fill = cleared ? PALETTE.sand : active ? PALETTE.maroon : PALETTE.nightBrown;
    const ring = scene.add
      .circle(point.x, point.y, active ? 25 : 20, fill, 0.96)
      .setStrokeStyle(active ? 4 : 3, active ? PALETTE.amber : PALETTE.cream, active ? 1 : 0.72)
      .setDepth(2);
    const glyph = scene.add
      .text(point.x, point.y, cleared ? "✓" : active ? `${index + 1}` : "◆", {
        ...pixelText("caption"),
        color: cleared || active ? PALETTE_HEX.ink : PALETTE_HEX.sand,
      })
      .setOrigin(0.5)
      .setDepth(2);

    if (active) {
      ring.setInteractive({ useHandCursor: true }).on("pointerup", onActiveSelect);
      glyph.setInteractive({ useHandCursor: true }).on("pointerup", onActiveSelect);
      scene.tweens.add({
        targets: [ring, glyph],
        scale: { from: 1, to: 1.12 },
        duration: 650,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
    }
  });
}
