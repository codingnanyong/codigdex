import type Phaser from "phaser";
import { describe, expect, it, vi } from "vitest";
import { goHome } from "@/lib/phaser/navigation";

vi.mock("@/lib/phaser/ui", () => ({ createButton: vi.fn() }));

describe("goHome", () => {
  it("stops every other play scene before starting the title", () => {
    const stop = vi.fn();
    const start = vi.fn();
    const scene = {
      scene: { key: "codigdex", stop, start },
    } as unknown as Phaser.Scene;

    goHome(scene);

    expect(stop).toHaveBeenCalledWith("world-map");
    expect(stop).toHaveBeenCalledWith("code-battle");
    expect(stop).not.toHaveBeenCalledWith("codigdex");
    expect(start).toHaveBeenCalledWith("intro");
  });
});
