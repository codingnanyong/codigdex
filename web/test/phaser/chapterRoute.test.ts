import { describe, expect, it, vi } from "vitest";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import { TUTORIAL_CHAPTER } from "@/lib/domain/chapters/tutorial";
import {
  routeEntryPointsFor,
  routePointsFor,
  routeTravelPointsFor,
} from "@/lib/phaser/worldMap/chapterRoute";

vi.mock("phaser", () => ({ default: {} }));

describe("chapter wallpaper routes", () => {
  it.each([GIT_CHAPTER, LINUX_CHAPTER])("places $id level five in the central arena", (chapter) => {
    const points = routePointsFor(chapter)!;

    expect(points).toHaveLength(5);
    expect(points[4].x).toBe(480);
    expect(points[4].y).toBeGreaterThanOrEqual(300);
    expect(points[4].y).toBeLessThanOrEqual(320);
  });

  it.each([GIT_CHAPTER, LINUX_CHAPTER])("connects every $id checkpoint with a travel curve", (chapter) => {
    const points = routePointsFor(chapter)!;

    for (let destination = 1; destination < points.length; destination += 1) {
      const travel = routeTravelPointsFor(chapter, destination)!;
      expect(travel[0]).toEqual(points[destination - 1]);
      expect(travel.at(-1)).toEqual(points[destination]);
    }
  });

  it("walks from the tutorial entrance to its only checkpoint", () => {
    const checkpoint = routePointsFor(TUTORIAL_CHAPTER)![0];
    const entry = routeEntryPointsFor(TUTORIAL_CHAPTER)!;

    expect(entry[0].y).toBeGreaterThan(500);
    expect(entry.at(-1)).toEqual(checkpoint);
    expect(checkpoint).toEqual({ x: 480, y: 350 });
  });
});
