import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { describe, expect, it } from "vitest";
import { clearCapturedMonsters, createDemoSave } from "./demoSave";

describe("mobile demo save", () => {
  it("adds three deterministic sample captures and preserves locale", () => {
    const demo = createDemoSave(createEmptySave("en"));

    expect(demo.ui.locale).toBe("en");
    expect(demo.progress.captures.map(({ id }) => id)).toEqual(
      DEX_MONSTERS.slice(0, 3).map(({ id }) => id)
    );
    expect(demo.progress.captures.every(({ capturedAt }) => capturedAt === "2026-01-01T00:00:00.000Z")).toBe(true);
  });

  it("does not duplicate an existing capture", () => {
    const initial = createEmptySave();
    initial.progress.captures.push({ id: DEX_MONSTERS[0].id, capturedAt: "2025-12-31T00:00:00.000Z" });

    const demo = createDemoSave(initial);

    expect(demo.progress.captures).toHaveLength(3);
    expect(demo.progress.captures[0].capturedAt).toBe("2025-12-31T00:00:00.000Z");
  });

  it("clears captures without changing the remaining save", () => {
    const demo = createDemoSave(createEmptySave("ko"));
    const cleared = clearCapturedMonsters(demo);

    expect(cleared.progress.captures).toEqual([]);
    expect(cleared.ui.locale).toBe("ko");
    expect(cleared.player).toEqual(demo.player);
  });
});
