// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { MixedControls } from "@/lib/phaser/battle/mixedControls";

function host() {
  let shutdown = () => {};
  const keyboard = { enabled: true };
  const canvas = document.createElement("canvas");
  document.body.append(canvas);
  const scene = { game: { canvas }, scale: { on() {}, off() {} }, input: { keyboard }, events: { once(_event: string, callback: () => void) { shutdown = callback; } } } as unknown as Phaser.Scene;
  return { controls: new MixedControls(scene), keyboard, shutdown: () => shutdown() };
}
beforeEach(() => document.body.replaceChildren());
describe("Web mixed battle controls", () => {
  it("preserves native IME input, blocks blanks/composition and releases keyboard capture on exit", () => {
    const state = createBattleState([{ type: "freeText", prompt: same("Command?"), acceptedAnswers: ["git status"], normalization: "trim-collapse-case", hints: [same("inspect changes")], explanation: same("Shows changes") }]);
    const view = host();
    const answers: unknown[] = [];
    view.controls.show(state, "en", { answer: (...value) => answers.push(value), hint() {}, next() {} });
    expect(view.keyboard.enabled).toBe(false);
    const input = document.querySelector("input")!;
    const form = document.querySelector("form")!;
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(answers).toEqual([]);
    input.value = "git status";
    input.dispatchEvent(new Event("compositionstart"));
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(answers).toEqual([]);
    input.dispatchEvent(new Event("compositionend"));
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(answers).toEqual([[0, "git status"]]);
    view.shutdown();
    expect(document.querySelector("input")).toBeNull();
    expect(view.keyboard.enabled).toBe(true);
  });
  it("shows graded explanation until the explicit next/result button is pressed", () => {
    const state = createBattleState([{ prompt: same("Pick"), choices: [same("Yes"), same("No")], answerIndex: 0, explanation: same("Because yes") }]);
    const feedback = submitBattleAnswer(state, 0, 0);
    let advanced = false;
    host().controls.show(state, "ko", { answer() {}, hint() {}, next() { advanced = true; } }, feedback);
    expect(document.querySelector("[role=status]")?.textContent).toContain("Because yes");
    expect(document.querySelectorAll("button")).toHaveLength(1);
    expect(advanced).toBe(false);
    document.querySelector("button")!.click();
    expect(advanced).toBe(true);
  });
});
