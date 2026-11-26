import type Phaser from "phaser";
import { beforeEach, expect, it, vi } from "vitest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { showCapturedPanel } from "@/lib/phaser/capture/resultPanels";
import { addSnippetBlock, createButton } from "@/lib/phaser/ui";

const actions = vi.hoisted(() => new Map<string, () => void>());
vi.mock("@/lib/phaser/i18n", () => ({
  lt: (_scene: unknown, copy: { en: string }) => copy.en,
  sceneLocale: () => "en", t: (_scene: unknown, key: string) => key,
}));
vi.mock("@/lib/phaser/ui", () => ({
  addSnippetBlock: vi.fn(() => ({ height: 50, plate: { y: 0 }, text: { y: 0 } })),
  createButton: vi.fn((_scene, _x, _y, _w, _h, label: string, action: () => void) => { actions.set(label, action); return { setDepth() { return this; } }; }),
  drawOrnateFrame: vi.fn(() => ({})), fitTextInside: vi.fn(), popIn: vi.fn(),
}));
beforeEach(() => { actions.clear(); vi.clearAllMocks(); });

it("keeps learning details optional without confirming twice or duplicating pause controls", () => {
  const text = vi.fn((_x: number, y: number, copy: string) => ({ y, copy, height: 24, setOrigin() { return this; } }));
  const destroyed = vi.fn();
  const scene = {
    add: { text, container: vi.fn(() => ({ setDepth() { return this; }, setName() { return this; }, destroy: destroyed })) },
    tweens: { killTweensOf: vi.fn() },
  } as unknown as Phaser.Scene;
  const onConfirm = vi.fn(), onPause = vi.fn();
  const monster = CHAPTERS[0].stages[0];
  showCapturedPanel(scene, { monster, npcLine: "Success", isNewEntry: true, unlockNotice: "Next stage unlocked", onConfirm, onPause });
  expect(addSnippetBlock).not.toHaveBeenCalled();
  expect(text.mock.calls.map(call => call[2])).toContain("Next stage unlocked");
  actions.get("DETAILS · CODE EXAMPLE")!();
  expect(addSnippetBlock).toHaveBeenCalledOnce();
  expect(text.mock.calls.map(call => call[2])).toContain(monster.description.en);
  expect(onConfirm).not.toHaveBeenCalled();
  actions.get("HIDE DETAILS")!();
  expect(destroyed).toHaveBeenCalledTimes(2);
  expect(vi.mocked(createButton).mock.calls.filter(call => call[5] === "PAUSE")).toHaveLength(1);
  actions.get("common.confirm")!();
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(onPause).not.toHaveBeenCalled();
});
