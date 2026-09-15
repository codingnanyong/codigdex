import Phaser from "phaser";
import { findStage } from "@codigdex/game-content/domain/chapters";
import type { ChapterDefinition, MonsterDefinition, QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import {
  isSuccessfulCapture,
  requiredCorrectAnswers,
  shouldContinueBattle,
} from "@codigdex/game-core/domain/dex/capture";
import { drawQuizQuestions, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { assetUrl } from "../../assets";
import { playAmbience } from "../ambience";
import { AnswerGrid } from "../battle/answerGrid";
import { drawNpcBanner } from "../battle/banner";
import { lt, t } from "../i18n";
import { MessagePanel } from "../battle/messagePanel";
import { Opponent } from "../battle/opponent";
import { StatusPanel } from "../battle/statusPanel";
import { preloadMonsterArt } from "../monsterArt";
import { createHomeButton } from "../navigation";
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
  private questions: QuizQuestion[] = [];
  private questionIndex = 0;
  private correctCount = 0;
  private locked = false;
  private status!: StatusPanel;
  private opponent!: Opponent;
  private message!: MessagePanel;
  private answers!: AnswerGrid;
  private returnTo?: CodeBattleData["returnTo"];
  private battleArena?: ChapterDefinition["arena"];

  constructor() {
    super("code-battle");
  }

  init(data: CodeBattleData) {
    const { chapter, monster } = findStage(data.monsterId);
    this.chapter = chapter;
    this.monster = monster;
    this.questions = drawQuizQuestions(monster.quizPool, quizCountForLevel(monster.level));
    this.returnTo = data.returnTo;
    this.battleArena = data.arena ?? chapter.arena;
    this.questionIndex = 0;
    this.correctCount = 0;
    this.locked = false;
  }

  preload() {
    preloadMonsterArt(this, [this.monster]);
    if (this.battleArena) this.load.image(this.battleArena.textureKey, assetUrl(this.battleArena.assetKey));
  }

  create() {
    const { width, height } = this.scale;
    const { npcName } = this.chapter;
    const arena = this.battleArena;

    // Backdrop and its ambience go in first so every battle panel draws on top.
    if (arena) {
      this.add.image(width / 2, height / 2, arena.textureKey).setDisplaySize(width, height);
      if (arena.ambience) playAmbience(this, arena.ambience);
    }

    drawNpcBanner(this, `${lt(this, npcName)}: ${lt(this, this.monster.preBattleLine)}`);
    this.status = new StatusPanel(this, this.monster);
    this.opponent = new Opponent(this, this.monster);
    this.message = new MessagePanel(this);
    this.answers = new AnswerGrid(this);
    createHomeButton(this).setDepth(30);

    this.showQuestion();
    applyPixelFontToScene(this);
  }

  private showQuestion() {
    const question = this.questions[this.questionIndex];
    this.message.showQuestion({
      index: this.questionIndex,
      total: this.questions.length,
      correct: this.correctCount,
      required: requiredCorrectAnswers(this.questions.length),
      prompt: lt(this, question.prompt),
    });
    this.answers.show(
      question.choices.map((choice) => lt(this, choice)),
      (index) => this.onAnswer(index, index === question.answerIndex)
    );
  }

  private onAnswer(index: number, isCorrect: boolean) {
    if (this.locked) return;
    this.locked = true;
    this.answers.mark(index, isCorrect);

    if (isCorrect) {
      this.correctCount += 1;
      this.message.say(t(this, "battle.hit"));
      const required = requiredCorrectAnswers(this.questions.length);
      this.status.setHealth(Math.max(0, required - this.correctCount) / required);
      this.opponent.flinch();
    } else {
      this.message.say(t(this, "battle.miss"));
    }

    this.time.delayedCall(650, () => {
      this.locked = false;
      this.advance();
    });
  }

  private advance() {
    this.questionIndex += 1;
    if (shouldContinueBattle(this.correctCount, this.questionIndex, this.questions.length)) {
      this.showQuestion();
      return;
    }

    this.answers.clear();
    if (isSuccessfulCapture(this.correctCount, this.questions.length)) {
      this.message.say(t(this, "battle.defeated", { name: lt(this, this.monster.name) }));
      this.opponent.faint(() => this.finishBattle());
    } else {
      this.message.say(
        this.questionIndex < this.questions.length
          ? t(this, "battle.failedEarly")
          : t(this, "battle.finished")
      );
      this.time.delayedCall(700, () => this.finishBattle());
    }
  }

  private finishBattle() {
    this.scene.start("capture-quiz", {
      monsterId: this.monster.id,
      correctCount: this.correctCount,
      total: this.questions.length,
      returnTo: this.returnTo,
    });
  }
}
