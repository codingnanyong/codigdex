import type Phaser from "phaser";
import { describe, expect, it, vi } from "vitest";
import { pauseForOpenSourceNotes, startOpenSourceMission } from "@/lib/phaser/openSourceNotes";

function runtime() {
  const states = new Map<string, string>([["intro", "active"], ["code-battle", "stopped"], ["open-source-chapter", "stopped"]]);
  const scenes = [...states.keys()].map((key) => ({
    sys: { settings: { key }, isActive: () => states.get(key) === "active", isPaused: () => states.get(key) === "paused" },
    // ScenePlugin commands deliberately do not settle immediately in a real frame.
    scene: { pause: vi.fn(), resume: vi.fn(), stop: vi.fn() },
  }));
  const game = {
    input: { enabled: true },
    scene: {
      getScenes: (activeOnly: boolean) => activeOnly ? scenes.filter(({ sys }) => sys.isActive()) : scenes,
      pause: vi.fn((key: string) => states.set(key, "paused")),
      resume: vi.fn((key: string) => states.set(key, "active")),
      stop: vi.fn((key: string) => states.set(key, "stopped")),
      start: vi.fn((key: string) => states.set(key, "active")),
    },
  };
  return { game: game as unknown as Phaser.Game, states, scenes };
}

describe("notes engine boundary", () => {
  it("pauses and restores the same scene immediately and only once", () => {
    const { game, states, scenes } = runtime();
    const resume = pauseForOpenSourceNotes(game);
    expect(game.input.enabled).toBe(false);
    expect(states.get("intro")).toBe("paused");
    expect(scenes[0].scene.pause).not.toHaveBeenCalled();
    resume(); resume();
    expect(game.input.enabled).toBe(true);
    expect(states.get("intro")).toBe("active");
    expect(game.scene.resume).toHaveBeenCalledTimes(1);
  });
  it("stops paused and resumed origins before starting a mission, leaving one active scene", () => {
    for (const closeNotes of [false, true]) {
      const { game, states } = runtime();
      const resume = pauseForOpenSourceNotes(game);
      if (closeNotes) resume();
      const data = { family: "hadoop", monsterId: "open-source:hadoop" };
      startOpenSourceMission(game, data);
      expect(game.scene.stop).toHaveBeenCalledWith("intro");
      expect(game.scene.start).toHaveBeenCalledWith("open-source-chapter", data);
      expect([...states].filter(([, status]) => status === "active")).toEqual([["open-source-chapter", "active"]]);
    }
  });
});
