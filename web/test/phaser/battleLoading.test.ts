import { afterEach, describe, expect, it, vi } from "vitest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { CodeBattleScene } from "@/lib/phaser/scenes/CodeBattleScene";

vi.mock("phaser", () => ({ default: { Scene: class {} } }));
vi.mock("@codigdex/quiz-content", () => ({ loadMixedQuizPack: vi.fn() }));
vi.mock("@/lib/phaser/battle/banner", () => ({ drawNpcBanner: vi.fn() }));
vi.mock("@/lib/phaser/battle/statusPanel", () => ({ StatusPanel: class {} }));
vi.mock("@/lib/phaser/battle/opponent", () => ({ Opponent: class {} }));
vi.mock("@/lib/phaser/battle/mixedControls", () => ({ MixedControls: class {} }));
vi.mock("@/lib/phaser/ui", () => ({ applyPixelFontToScene: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

function pendingLoad(paused = true) {
  const chapter = CHAPTERS[0];
  const scene = {
    chapter, monster: chapter.stages[0], loadGeneration: 7,
    registry: { get: () => "en" },
    sys: { isActive: () => false, isPaused: () => paused },
    scene: { restart: vi.fn() }, showQuestion: vi.fn(),
  };
  const loading = { destroy: vi.fn(), setText: vi.fn(), setInteractive: vi.fn(), once: vi.fn() };
  loading.setInteractive.mockReturnValue(loading);
  let resolve!: (pack: Awaited<ReturnType<typeof loadMixedQuizPack>>) => void;
  let reject!: (error: Error) => void;
  vi.mocked(loadMixedQuizPack).mockReturnValue(new Promise((yes, no) => { resolve = yes; reject = no; }));
  const completed = Reflect.get(CodeBattleScene.prototype, "createBattleUi").call(scene, 7, loading);
  return { scene, loading, resolve, reject, completed };
}

describe("quiz load completing while field notes pause the battle", () => {
  it("initializes a paused live scene so its questions are ready on resume", async () => {
    const actual = await vi.importActual<typeof import("@codigdex/quiz-content")>("@codigdex/quiz-content");
    const pack = await actual.loadMixedQuizPack(CHAPTERS[0].stages[0].quizPackId);
    const pending = pendingLoad();
    pending.resolve(pack);
    await pending.completed;
    expect(pending.loading.destroy).toHaveBeenCalledOnce();
    expect(pending.scene.showQuestion).toHaveBeenCalledOnce();
  });

  it("keeps load failure retryable when the pack rejects while paused", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const pending = pendingLoad();
    pending.reject(new Error("offline"));
    await pending.completed;
    expect(pending.loading.setText).toHaveBeenCalledOnce();
    expect(pending.loading.once).toHaveBeenCalledWith("pointerup", expect.any(Function));
    pending.loading.once.mock.calls[0][1]();
    expect(pending.scene.scene.restart).toHaveBeenCalledWith(expect.objectContaining({ monsterId: pending.scene.monster.id }));
  });

  it.each(["stopped", "superseded"])("does not initialize a %s scene", async (state) => {
    const actual = await vi.importActual<typeof import("@codigdex/quiz-content")>("@codigdex/quiz-content");
    const pack = await actual.loadMixedQuizPack(CHAPTERS[0].stages[0].quizPackId);
    const pending = pendingLoad(state !== "stopped");
    if (state === "superseded") pending.scene.loadGeneration++;
    pending.resolve(pack);
    await pending.completed;
    expect(pending.loading.destroy).not.toHaveBeenCalled();
    expect(pending.scene.showQuestion).not.toHaveBeenCalled();
  });
});
