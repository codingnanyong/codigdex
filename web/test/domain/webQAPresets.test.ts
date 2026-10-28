import { describe, expect, it } from "vitest";
import { webQAPresets } from "@/lib/qa/presets";
import { canEnterBattle, resumeCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { parseSave } from "@codigdex/game-core/save/schema";

describe("manual web QA starting states", () => {
  it("provides a fresh start, ten career encounter starts, five earned promotions and the full dex", () => {
    const presets = webQAPresets("ko", "2026-10-27T00:00:00.000Z");
    expect(presets).toHaveLength(17);
    expect(new Set(presets.map(({ id }) => id)).size).toBe(17);
    expect(presets.filter(({ group }) => group === "직무 돌발 의뢰")).toHaveLength(10);
    expect(presets.filter(({ group }) => group === "2차 전직")).toHaveLength(5);
    expect(presets.find(({ id }) => id === "fresh")!.save.progress.captures).toEqual([]);
    for (const preset of presets) {
      const save = parseSave(JSON.stringify(preset.save))!;
      expect(save.ui.locale).toBe("ko");
      const next = resumeCheckpoint(save);
      expect(canEnterBattle(save, next.monster.id)).toBe(true);
      if (preset.id.startsWith("encounter:")) {
        expect(next.chapter.id).not.toMatch(/^open-source:/);
        expect(save.player.secondaryJobId ?? save.player.primaryJobId).toBe(preset.id.slice("encounter:".length));
      }
      if (preset.id.startsWith("promotion:")) {
        expect(next.chapter.id).toBe(preset.id);
        expect(save.player.secondaryJobId).toBe(preset.id.slice(10));
        expect(save.progress.careers.filter(({ masteredAt }) => masteredAt)).toHaveLength(3);
      }
    }
    expect(presets.find(({ id }) => id === "dex")!.save.progress.captures).toHaveLength(DEX_MONSTERS.length);
  });
  it("builds independent English fixtures without mutating other presets", () => {
    const presets = webQAPresets("en");
    expect(presets.every(({ save }) => save.ui.locale === "en")).toBe(true);
    presets[1].save.progress.captures.length = 0;
    expect(presets[2].save.progress.captures).toHaveLength(11);
  });
});
