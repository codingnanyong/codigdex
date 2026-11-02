import Phaser from "phaser";
import { findStage } from "@codigdex/game-content/domain/chapters";
import { masterLessonFor } from "@codigdex/game-content/domain/masterChapters";
import { PROMOTION_WORKSHOPS, WORKSHOP_PHASES } from "@codigdex/game-content/domain/promotionWorkshops";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { canStartMasterProject, completeWorkshopPractice, nextWorkshopPhase, promotionCheckpoints, secondaryExplorationCheckpoints, masterCheckpoints, rememberCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { evolutionIdentity } from "@codigdex/game-content/domain/secondaryEvolutionIds";
import { EVOLUTION_LESSON_PHASES } from "@codigdex/game-content/domain/secondaryExploration";
import { findTertiaryJob, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { createBattleState, submitBattleAnswer, type BattleState } from "@codigdex/game-core/domain/dex/battle";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { applySaveToRegistry, snapshotRegistry } from "../registryAdapter";
import { sceneLocale } from "../i18n";
import { assetUrl } from "../../assets";

/** Scrollable, keyboard-accessible reading and practice, with explicit answer feedback. */
export class CareerWorkshopScene extends Phaser.Scene {
  private jobId = "";
  private monsterId = "";
  private evolutionId?: string;
  private root?: HTMLElement;
  constructor() { super("career-workshop"); }
  init(data: { jobId: string; monsterId: string; evolutionId?: string }) { this.jobId = data.jobId; this.monsterId = data.monsterId; this.evolutionId = data.evolutionId; }
  create() {
    const root = document.createElement("section");
    root.className = "career-workshop";
    root.setAttribute("aria-label", sceneLocale(this) === "ko" ? "전직 실습 공방" : "Career workshop");
    const canvas = this.game.canvas;
    canvas.parentElement!.append(root);
    this.root = root;
    const keyboard = this.input.keyboard;
    const wasEnabled = keyboard?.enabled;
    if (keyboard) keyboard.enabled = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { root.remove(); this.root = undefined; if (keyboard) keyboard.enabled = wasEnabled ?? true; });
    this.loadWorkshop();
  }
  private loadWorkshop() {
    const root = this.root!;
    void this.show().catch(() => {
      if (!root.isConnected) return;
      root.replaceChildren();
      this.line("p", sceneLocale(this) === "ko" ? "학습 자료를 불러오지 못했습니다." : "Could not load learning material.");
      this.button(sceneLocale(this) === "ko" ? "다시 시도" : "RETRY", () => this.loadWorkshop());
      this.back();
    });
  }
  private line(tag: string, copy: string) { const node = document.createElement(tag); node.textContent = copy; this.root!.append(node); return node; }
  private button(copy: string, action: () => void) { const node = document.createElement("button"); node.textContent = copy; node.onclick = action; this.root!.append(node); return node; }
  private back() { this.button(sceneLocale(this) === "ko" ? "의뢰 지도로 돌아가기" : "BACK TO MISSION MAP", () => this.scene.start(this.evolutionId ? "secondary-region" : "promotion-chapter", { jobId: this.jobId, regionId: evolutionIdentity(this.monsterId)?.coreId, monsterId: this.monsterId })); }
  private async show() {
    const root = this.root!;
    root.replaceChildren();
    const save = snapshotRegistry(this.registry);
    const tertiary = findTertiaryJob(this.jobId);
    const path = tertiary ? masterCheckpoints(save) : this.evolutionId ? secondaryExplorationCheckpoints(save) : promotionCheckpoints(save);
    const checkpoint = path.find(({ monster }) => monster.id === this.monsterId);
    if (!checkpoint || checkpoint.status === "locked" || (tertiary && !canStartMasterProject(save, tertiary.id))) {
      this.scene.start("job-select"); return;
    }
    applySaveToRegistry(this.registry, rememberCheckpoint(save, this.monsterId));
    const ko = sceneLocale(this) === "ko";
    const locale = ko ? "ko" : "en";
    const { monster, chapter } = findStage(this.monsterId);
    const identity = evolutionIdentity(this.monsterId);
    const index = identity?.regionIndex ?? promotionChapterFor(this.jobId)?.stages.findIndex(({ id }) => id === this.monsterId) ?? -1;
    const master = masterLessonFor(this.monsterId);
    const lesson = master ?? PROMOTION_WORKSHOPS[this.jobId as SecondaryJobId]?.[index];
    if (!lesson) throw new Error("Unknown lesson");
    this.line("h2", monster.classification[locale]);
    if (chapter.arena) {
      const figure = document.createElement("figure"); figure.className = "workshop-stage";
      figure.dataset.arena = chapter.arena.assetKey;
      const backdrop = document.createElement("img"); backdrop.className = "workshop-backdrop";
      backdrop.src = assetUrl(chapter.arena.assetKey); backdrop.alt = "";
      const portrait = document.createElement("img"); portrait.className = "workshop-monster";
      portrait.src = assetUrl(monster.assetKey); portrait.alt = monster.name[locale];
      const caption = document.createElement("figcaption");
      caption.textContent = `${ko ? "단계" : "STAGE"} ${monster.level}/5 · No.${monster.dexNumber} · ${monster.name[locale]}`;
      figure.append(backdrop, portrait, caption); root.append(figure);
    }
    this.line("p", monster.briefing[locale]);
    this.line("pre", lesson.example);
    this.line("p", "reasoning" in lesson ? lesson.reasoning[locale] : lesson.explanation[locale]);
    const link = this.line("a", ko ? "공식 참고 자료 ↗" : "OFFICIAL REFERENCE ↗") as HTMLAnchorElement;
    link.href = lesson.source; link.target = "_blank"; link.rel = "noopener noreferrer";
    if (this.evolutionId && identity) {
      this.line("h3", `No.${monster.dexNumber} · Lv.${identity.level} · ${EVOLUTION_LESSON_PHASES[identity.level - 1][locale]}`);
      this.line("p", ko ? "앞 네 단계의 진화형을 포획하면 구역 실습이 함께 저장됩니다. Lv.5는 배운 내용을 통합하는 수호자입니다." : "Capturing each of the first four forms also saves its regional practice checkpoint. The Lv.5 guardian integrates the whole lesson.");
      this.button(ko ? "진화 배틀 시작" : "START EVOLUTION BATTLE", () => this.scene.start("code-battle", { monsterId: this.monsterId, returnTo: { scene: "secondary-region", data: { jobId: this.jobId, regionId: identity.coreId } } }));
      this.back(); return;
    }
    if (tertiary) {
      this.button(ko ? "설계 검증 배틀 시작" : "START DESIGN VERIFICATION", () => this.scene.start("code-battle", { monsterId: this.monsterId, returnTo: { scene: "promotion-chapter", data: { jobId: this.jobId } } }));
      this.back(); return;
    }
    const phase = nextWorkshopPhase(save, this.monsterId);
    this.line("h3", phase < 4 ? `${phase + 1}/4 · ${WORKSHOP_PHASES[phase][locale]}` : (ko ? "구역 실습 완료" : "REGION PRACTICE COMPLETE"));
    if (phase === 4) {
      this.button(ko ? "수호 생물 배틀 시작" : "START GUARDIAN BATTLE", () => this.scene.start("code-battle", { monsterId: this.monsterId, returnTo: { scene: "promotion-chapter", data: { jobId: this.jobId } } }));
      this.back(); return;
    }
    this.line("p", ko ? "5문항 중 3문항을 맞히면 이 실습이 저장됩니다. 틀린 답은 근거를 확인하고 다시 도전할 수 있습니다." : "Answer 3 of 5 correctly to save this practice checkpoint. Review feedback and retry when needed.");
    this.back();
    const loading = this.line("p", ko ? "실습 자료를 불러오는 중…" : "Loading practice…");
    const pack = await loadQuizPack(monster.quizPackId);
    if (this.root !== root || !root.isConnected) return;
    loading.remove();
    let battle: BattleState = createBattleState(pack.questions.slice(phase * 5, phase * 5 + 5));
    const area = document.createElement("div"); area.className = "workshop-practice"; root.append(area);
    const render = () => {
      area.replaceChildren();
      const add = (tag: string, copy: string) => { const node = document.createElement(tag); node.textContent = copy; area.append(node); return node; };
      if (battle.status !== "active") {
        if (battle.status === "passed") {
          applySaveToRegistry(this.registry, completeWorkshopPractice(snapshotRegistry(this.registry), this.monsterId, phase, battle));
          add("p", ko ? "실습 완료 · 저장했습니다." : "Practice complete · saved.");
          const next = add("button", ko ? "다음 실습" : "CONTINUE PRACTICE"); next.onclick = () => this.loadWorkshop();
        } else {
          add("p", ko ? "아직 통과하지 못했습니다. 예제를 다시 읽고 재도전하세요." : "Not passed yet. Revisit the example and retry.");
          const retry = add("button", ko ? "이 실습 다시 도전" : "RETRY PRACTICE"); retry.onclick = () => { battle = createBattleState(battle.questions); render(); };
        }
        return;
      }
      const question = battle.questions[battle.questionIndex];
      if (question.type === "freeText") throw new Error("Expected practice choices");
      add("p", `${battle.questionIndex + 1}/5 · ${battle.correctCount}/3`);
      add("h3", question.prompt[locale]);
      question.choices.forEach((choice, answer) => {
        const button = add("button", choice[locale]);
        button.onclick = () => {
          area.querySelectorAll("button").forEach((item) => { item.disabled = true; });
          const correct = answer === question.answerIndex;
          battle = submitBattleAnswer(battle, battle.questionIndex, answer);
          const feedback = add("p", `${correct ? (ko ? "정답" : "CORRECT") : (ko ? "다시 살펴보세요" : "REVIEW THIS")}: ${question.choices[question.answerIndex][locale]}\n${question.explanation?.[locale] ?? ("reasoning" in lesson ? lesson.reasoning[locale] : lesson.explanation[locale])}`);
          feedback.setAttribute("role", "status");
          const next = add("button", ko ? "확인 · 다음" : "CONTINUE"); next.onclick = render; next.focus();
        };
      });
    };
    render();
  }
}
