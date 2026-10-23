import Phaser from "phaser";
import { findStage } from "@codigdex/game-content/domain/chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { createBattleState, revealBattleHint, submitBattleAnswer, type BattleState } from "@codigdex/game-core/domain/dex/battle";
import { drawMixedQuizQuestions, quizCountForLevel, type QuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { canEnterBattle, rememberCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { applySaveToRegistry, snapshotRegistry } from "../registryAdapter";
import { assetUrl } from "../../assets";
import { playAmbience } from "../ambience";
import { MixedControls } from "../battle/mixedControls";
import { drawNpcBanner } from "../battle/banner";
import { lt, sceneLocale, t } from "../i18n";
import { Opponent } from "../battle/opponent";
import { StatusPanel } from "../battle/statusPanel";
import { preloadMonsterArt } from "../monsterArt";
import { createHomeButton } from "../navigation";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene } from "../ui";

export interface CodeBattleData {
  monsterId: string;
  returnTo?: { scene: "world-map" | "career-region"; data?: Record<string, unknown> };
  arena?: ChapterDefinition["arena"];
}

/** Runs one battle until its pass line is reached or its questions run out. */
export class CodeBattleScene extends Phaser.Scene {
  private chapter!: ChapterDefinition;
  private monster!: MonsterDefinition;
  private battle?: BattleState;
  private feedback?: BattleState;
  private locked = false;
  private status!: StatusPanel;
  private opponent!: Opponent;
  private controls!: MixedControls;
  private returnTo?: CodeBattleData["returnTo"];
  private battleArena?: ChapterDefinition["arena"];
  private loadGeneration = 0;

  constructor() {
    super("code-battle");
  }

  init(data: CodeBattleData) {
    const { chapter, monster } = findStage(data.monsterId);
    this.chapter = chapter;
    this.monster = monster;
    this.battle = undefined;
    this.feedback = undefined;
    this.returnTo = data.returnTo;
    this.battleArena = data.arena ?? chapter.arena;
    this.locked = false;
    this.loadGeneration += 1;
  }

  preload() {
    preloadMonsterArt(this, [this.monster]);
    if (this.battleArena) this.load.image(this.battleArena.textureKey, assetUrl(this.battleArena.assetKey));
  }

  create() {
    const save = snapshotRegistry(this.registry);
    if (!canEnterBattle(save, this.monster.id)) {
      this.scene.start("world-map");
      return;
    }
    applySaveToRegistry(this.registry, rememberCheckpoint(save, this.monster.id));
    this.events.once("shutdown", () => { this.loadGeneration += 1; this.locked = true; });
    const { width, height } = this.scale;
    const arena = this.battleArena;

    // Backdrop and its ambience go in first so every battle panel draws on top.
    if (arena) {
      this.add.image(width / 2, height / 2, arena.textureKey).setDisplaySize(width, height);
      if (arena.ambience) playAmbience(this, arena.ambience);
    }

    createHomeButton(this).setDepth(30);
    const loading = this.add
      .text(width / 2, height / 2, t(this, "battle.loadingQuiz"), {
        ...pixelText("body"),
        color: "#f1e4cb",
      })
      .setOrigin(0.5);
    applyPixelFontToScene(this);
    void this.createBattleUi(this.loadGeneration, loading);
  }

  private async createBattleUi(generation: number, loading: Phaser.GameObjects.Text) {
    try {
      const pack = await loadMixedQuizPack(this.monster.quizPackId);
      if (!this.sys.isActive() || generation !== this.loadGeneration) return;
      this.battle = createBattleState(drawMixedQuizQuestions(pack.questions, quizCountForLevel(this.monster.level)));
      loading.destroy();
    } catch (error) {
      console.error(`[CodeBattleScene] failed to load ${this.monster.quizPackId}`, error);
      if (!this.sys.isActive() || generation !== this.loadGeneration) return;
      loading.setText(t(this, "battle.quizLoadFailed"));
      loading.setInteractive({ useHandCursor: true }).once("pointerup", () => this.scene.restart({ monsterId: this.monster.id, returnTo: this.returnTo, arena: this.battleArena }));
      return;
    }

    const { npcName } = this.chapter;

    drawNpcBanner(this, `${lt(this, npcName)}: ${lt(this, this.monster.preBattleLine)}`);
    this.status = new StatusPanel(this, this.monster);
    this.opponent = new Opponent(this, this.monster);
    this.controls = new MixedControls(this);

    this.showQuestion();
    applyPixelFontToScene(this);
  }

  private showQuestion() {
    if (!this.battle) return;
    this.controls.show(this.battle, sceneLocale(this), {
      answer: (index, value) => this.onAnswer(index, value),
      hint: (index) => {
        if (this.locked || !this.battle) return;
        this.battle = revealBattleHint(this.battle, index);
        this.showQuestion();
      },
      next: () => this.advance(),
    }, this.feedback);
  }

  private onAnswer(index: number, answer: QuizAnswer) {
    if (this.locked || !this.battle) return;
    const next = submitBattleAnswer(this.battle, index, answer);
    if (next === this.battle) return;
    this.locked = true;
    this.feedback = next;
    const required = Math.ceil(next.questions.length * 0.6);
    this.status.setHealth(Math.max(0, required - next.correctCount) / required);
    if (next.attempts.at(-1)?.correct) this.opponent.flinch();
    this.showQuestion();
  }

  private advance() {
    if (!this.feedback) return;
    const next = this.feedback;
    this.feedback = undefined;
    if (next.status !== 'active') {
      this.scene.start('capture-quiz', {
        monsterId: this.monster.id, correctCount: next.correctCount,
        total: next.questions.length, returnTo: this.returnTo,
      });
      return;
    }
    this.battle = next;
    this.locked = false;
    this.showQuestion();
  }
}
