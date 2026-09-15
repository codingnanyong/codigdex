import { describe, expect, it, vi } from "vitest";
import {
  clampMapPosition,
  DEFAULT_MAP_MOVEMENT_BOUNDS,
} from "@/lib/phaser/worldMap/playerMovement";

vi.mock("phaser", () => ({ default: {} }));

describe("world map player movement", () => {
  it("keeps free movement inside the visible map controls", () => {
    expect(clampMapPosition({ x: -20, y: 900 })).toEqual({
      x: DEFAULT_MAP_MOVEMENT_BOUNDS.left,
      y: DEFAULT_MAP_MOVEMENT_BOUNDS.bottom,
    });
  });

  it("does not change a position already inside the map", () => {
    expect(clampMapPosition({ x: 480, y: 350 })).toEqual({ x: 480, y: 350 });
  });
});
