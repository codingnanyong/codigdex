import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { describe, expect, it } from "vitest";
import { canEnterCheckpoint, checkpoints, nextCheckpoint, selectedCheckpoint } from "./progression";

describe("mobile common-path navigation", () => {
  it("unlocks each checkpoint in tutorial → Git → Linux order", () => {
    const captured = new Set<string>();
    const monsters = CHAPTERS.flatMap(({ stages }) => stages);
    for (const [index, monster] of monsters.entries()) {
      expect(nextCheckpoint(captured).monster.id).toBe(monster.id);
      expect(checkpoints(captured).filter(({ status }) => status === "available")).toHaveLength(1);
      for (const [otherIndex, other] of monsters.entries()) {
        expect(canEnterCheckpoint(captured, other.id)).toBe(otherIndex <= index);
      }
      captured.add(monster.id);
    }
    expect(checkpoints(captured).every(({ status }) => status === "cleared")).toBe(true);
    expect(nextCheckpoint(captured).monster.id).toBe(monsters.at(-1)!.id);
  });

  it("preserves captured replays without allowing out-of-order records to unlock later stages", () => {
    const git = CHAPTERS[1].stages;
    const captured = new Set([git[1].id, "unknown-id"]);
    expect(canEnterCheckpoint(captured, git[1].id)).toBe(true);
    expect(canEnterCheckpoint(captured, git[2].id)).toBe(false);
    expect(canEnterCheckpoint(captured, "unknown-id")).toBe(false);
    expect(nextCheckpoint(captured).chapter.id).toBe("tutorial");
    expect(selectedCheckpoint(captured, "removed-monster")).toEqual(nextCheckpoint(captured));
  });

  it("keeps region inspection separate from battle access and falls back safely after a reset", () => {
    const captured = new Set<string>();
    const selected = selectedCheckpoint(captured, CHAPTERS[2].stages[0].id);
    expect(selected.chapter.id).toBe("linux");
    expect(selected.status).toBe("locked");
    expect(canEnterCheckpoint(captured, selected.monster.id)).toBe(false);
  });
});
