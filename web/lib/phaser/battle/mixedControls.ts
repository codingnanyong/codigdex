import type Phaser from "phaser";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import type { QuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";

/** Native browser controls keep IME composition, keyboard access and text selection intact. */
export class MixedControls {
  private readonly root = document.createElement("section");
  private composing = false;

  constructor(scene: Phaser.Scene) {
    this.root.className = "battle-controls";
    this.root.setAttribute("aria-label", "Quiz / 퀴즈");
    const canvas = scene.game.canvas;
    const parent = canvas.parentElement!;
    parent.append(this.root);
    this.root.style.position = "absolute";
    this.root.style.transformOrigin = "top left";
    const position = () => {
      const bounds = canvas.getBoundingClientRect();
      const container = parent.getBoundingClientRect();
      const scale = bounds.width / 960;
      this.root.style.left = `${bounds.left - container.left + 50 * scale}px`;
      this.root.style.top = `${bounds.top - container.top + 215 * scale}px`;
      this.root.style.transform = `scale(${scale})`;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(canvas);
    scene.scale.on("resize", position);
    // Phaser keyboard capture would otherwise consume space/arrows inside TextInput.
    const keyboard = scene.input.keyboard;
    const previous = keyboard?.enabled;
    if (keyboard) keyboard.enabled = false;
    scene.events.once("shutdown", () => {
      observer.disconnect();
      scene.scale.off("resize", position);
      this.root.remove();
      if (keyboard && previous !== undefined) keyboard.enabled = previous;
    });
  }

  show(battle: BattleState, locale: Locale, handlers: { answer(index: number, answer: QuizAnswer): void; hint(index: number): void; next(): void }, feedback?: BattleState) {
    const ko = locale === "ko";
    const question = battle.questions[battle.questionIndex];
    const draft = this.root.querySelector("input")?.value ?? "";
    this.root.replaceChildren();
    this.composing = false;
    const progress = document.createElement("p");
    progress.className = "battle-progress";
    const total = battle.questions.length;
    const current = feedback ?? battle;
    const required = Math.ceil(total * 0.6);
    const allowed = total - required;
    const mistakes = current.attempts.filter(({ correct }) => !correct).length;
    progress.textContent = `${battle.questionIndex + 1}/${total} · ${current.correctCount}/${required} ${ko ? "정답" : "correct"} · ${ko ? "플레이어 HP" : "PLAYER HP"} ${Math.max(0, allowed - mistakes + 1)}/${allowed + 1}`;
    const prompt = document.createElement("p");
    prompt.className = "battle-prompt";
    prompt.textContent = localize(question.prompt, locale);
    this.root.append(progress, prompt);
    for (const hint of (question.hints ?? []).slice(0, feedback ? feedback.attempts.at(-1)!.hintsUsed : battle.hintsUsed)) {
      const line = document.createElement("p");
      line.className = "battle-hint";
      line.textContent = localize(hint, locale);
      this.root.append(line);
    }
    const button = (label: string, action: () => void) => {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = label;
      element.addEventListener("click", action);
      return element;
    };
    if (feedback) {
      const attempt = feedback.attempts.at(-1)!;
      const line = document.createElement("div");
      line.className = "battle-feedback";
      line.setAttribute("role", "status");
      const answer = question.type === "freeText" ? question.acceptedAnswers[0] : localize(question.choices[question.answerIndex], locale);
      line.textContent = `${attempt.correct ? (ko ? "정답!" : "Correct!") : (ko ? "오답" : "Incorrect")} · ${ko ? "정답" : "Answer"}: ${answer}\n${question.explanation ? localize(question.explanation, locale) : ""}\n${ko ? "공격 위력" : "Attack strength"}: ${attempt.damage}`;
      const next = button(feedback.status === "active" ? (ko ? "다음 문제" : "NEXT QUESTION") : (ko ? "결과 확인" : "SHOW RESULT"), handlers.next);
      this.root.append(line, next);
      next.focus({ preventScroll: true });
      return;
    }
    if (question.type === "freeText") {
      const form = document.createElement("form");
      form.className = "battle-answer-form";
      const input = document.createElement("input");
      input.type = "text";
      input.value = draft;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.setAttribute("aria-label", ko ? "단답 답안" : "Short answer");
      input.placeholder = ko ? "명령어 또는 키워드를 입력하세요" : "Type a command or keyword";
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = ko ? "제출" : "SUBMIT";
      submit.disabled = !input.value.trim();
      input.addEventListener("input", () => { submit.disabled = !input.value.trim() || this.composing; });
      input.addEventListener("compositionstart", () => { this.composing = true; submit.disabled = true; });
      input.addEventListener("compositionend", () => { this.composing = false; submit.disabled = !input.value.trim(); });
      input.addEventListener("keydown", (event) => { if (event.key === "Enter" && (event.isComposing || this.composing || event.keyCode === 229)) event.preventDefault(); });
      form.addEventListener("submit", (event) => { event.preventDefault(); if (!this.composing && input.value.trim()) handlers.answer(battle.questionIndex, input.value); });
      form.append(input, submit);
      this.root.append(form);
    } else {
      const choices = document.createElement("div");
      choices.className = "battle-choices";
      question.choices.forEach((choice, index) => choices.append(button(`${String.fromCharCode(65 + index)}. ${localize(choice, locale)}`, () => handlers.answer(battle.questionIndex, index))));
      this.root.append(choices);
    }
    if ((question.hints?.length ?? 0) > 0) {
      const hint = button(`${ko ? "힌트" : "HINT"} ${battle.hintsUsed}/${Math.min(2, question.hints!.length)} · ${ko ? "공격 위력" : "Attack"} ${[100, 75, 50][battle.hintsUsed]}`, () => handlers.hint(battle.questionIndex));
      hint.disabled = battle.hintsUsed >= Math.min(2, question.hints!.length);
      this.root.append(hint);
    }
  }
}
