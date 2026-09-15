import Phaser from "phaser";
import type { ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { PALETTE } from "../palette";

export interface RoutePoint {
  x: number;
  y: number;
}

interface ChapterRouteDefinition {
  points: readonly RoutePoint[];
  /** Optional first walk from the wallpaper entrance to its first checkpoint. */
  entry?: readonly RoutePoint[];
  /** One terrain-following curve from checkpoint n to checkpoint n + 1. */
  segments: readonly (readonly RoutePoint[])[];
}

const ROUTES: Partial<Record<ChapterDefinition["id"], ChapterRouteDefinition>> = {
  tutorial: {
    points: [{ x: 480, y: 350 }],
    entry: [
      { x: 480, y: 525 },
      { x: 625, y: 500 },
      { x: 745, y: 430 },
      { x: 700, y: 365 },
      { x: 585, y: 340 },
      { x: 480, y: 350 },
    ],
    segments: [],
  },
  git: {
    // Four lessons circle the clearing; the fifth is the central mastery encounter.
    points: [
      { x: 145, y: 430 },
      { x: 810, y: 420 },
      { x: 805, y: 275 },
      { x: 155, y: 270 },
      { x: 480, y: 310 },
    ],
    segments: [
      [{ x: 145, y: 430 }, { x: 310, y: 482 }, { x: 610, y: 480 }, { x: 810, y: 420 }],
      [{ x: 810, y: 420 }, { x: 865, y: 365 }, { x: 862, y: 310 }, { x: 805, y: 275 }],
      [{ x: 805, y: 275 }, { x: 760, y: 145 }, { x: 610, y: 115 }, { x: 350, y: 115 }, { x: 190, y: 150 }, { x: 155, y: 270 }],
      [{ x: 155, y: 270 }, { x: 235, y: 335 }, { x: 350, y: 350 }, { x: 480, y: 310 }],
    ],
  },
  linux: {
    points: [
      { x: 145, y: 420 },
      { x: 815, y: 420 },
      { x: 820, y: 245 },
      { x: 140, y: 245 },
      { x: 480, y: 315 },
    ],
    segments: [
      [{ x: 145, y: 420 }, { x: 330, y: 470 }, { x: 630, y: 470 }, { x: 815, y: 420 }],
      [{ x: 815, y: 420 }, { x: 870, y: 350 }, { x: 865, y: 285 }, { x: 820, y: 245 }],
      [{ x: 820, y: 245 }, { x: 690, y: 175 }, { x: 480, y: 155 }, { x: 270, y: 175 }, { x: 140, y: 245 }],
      [{ x: 140, y: 245 }, { x: 245, y: 330 }, { x: 360, y: 350 }, { x: 480, y: 315 }],
    ],
  },
};

export function routePointsFor(chapter: ChapterDefinition): readonly RoutePoint[] | undefined {
  const points = ROUTES[chapter.id]?.points;
  return points?.length === chapter.stages.length ? points : undefined;
}

export function routeTravelPointsFor(
  chapter: ChapterDefinition,
  destinationIndex: number
): readonly RoutePoint[] | undefined {
  if (destinationIndex <= 0) return undefined;
  return ROUTES[chapter.id]?.segments[destinationIndex - 1];
}

export function routeEntryPointsFor(
  chapter: ChapterDefinition
): readonly RoutePoint[] | undefined {
  return ROUTES[chapter.id]?.entry;
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
  const curves = ROUTES[chapter.id]?.segments.map(
    (segment) => new Phaser.Curves.Spline(segment.map((point) => new Phaser.Math.Vector2(point.x, point.y)))
  ) ?? [];
  curves.forEach((curve, index) => {
    const reached = index < activeIndex;
    const current = index === activeIndex;
    path.lineStyle(5, PALETTE.nightBrown, current ? 0.5 : 0.28);
    path.strokePoints(curve.getPoints(32), false);
    path.lineStyle(
      2,
      current ? PALETTE.amber : reached ? PALETTE.sand : PALETTE.mutedBrown,
      current ? 0.92 : reached ? 0.62 : 0.3
    );
    path.strokePoints(curve.getPoints(32), false);
  });

  points.forEach((point, index) => {
    const cleared = captured.has(chapter.stages[index].id);
    const active = index === activeIndex;
    const marker = scene.add
      .circle(
        point.x,
        point.y,
        active ? 17 : cleared ? 13 : 11,
        active ? PALETTE.maroon : cleared ? PALETTE.sand : PALETTE.nightBrown,
        active ? 0.92 : cleared ? 0.8 : 0.58
      )
      .setStrokeStyle(active ? 3 : 2, active ? PALETTE.amber : PALETTE.mutedBrown, active ? 1 : 0.62)
      .setDepth(2);
    const core = scene.add
      .circle(point.x, point.y, active ? 6 : 4, active ? PALETTE.cream : cleared ? PALETTE.amber : PALETTE.wood, 1)
      .setDepth(2);

    if (active) {
      const halo = scene.add
        .circle(point.x, point.y, 24, PALETTE.amber, 0.08)
        .setStrokeStyle(3, PALETTE.amber, 0.9)
        .setDepth(2);
      const hitArea = scene.add
        .circle(point.x, point.y, 30, 0xffffff, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);
      hitArea.on("pointerup", onActiveSelect);
      scene.tweens.add({
        targets: halo,
        scale: { from: 0.8, to: 1.38 },
        alpha: { from: 0.9, to: 0 },
        duration: 900,
        ease: "Cubic.Out",
        repeat: -1,
      });
      scene.tweens.add({
        targets: [marker, core],
        scale: { from: 1, to: 1.08 },
        duration: 520,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
    }
  });
}
