import type { LocalizedText } from "../../i18n/locale";

interface QuizQuestionCopy {
  prompt: LocalizedText;
  /** Legacy choice questions may omit these; new content can reveal at most two hints. */
  hints?: readonly LocalizedText[];
  explanation?: LocalizedText;
}

export interface MultipleChoiceQuestion extends QuizQuestionCopy {
  /** Omitted on legacy content, which is always multiple choice. */
  type?: "multipleChoice";
  choices: readonly LocalizedText[];
  answerIndex: number;
  acceptedAnswers?: never;
  normalization?: never;
}

export interface FreeTextQuestion extends QuizQuestionCopy {
  type: "freeText";
  acceptedAnswers: readonly string[];
  normalization: "trim-collapse-case";
  hints: readonly LocalizedText[];
  explanation: LocalizedText;
  choices?: never;
  answerIndex?: never;
}

/** A tagged union prevents a free-text prompt from accidentally carrying choice grading. */
export type QuizQuestion = MultipleChoiceQuestion | FreeTextQuestion;

export interface CapturedCard {
  id: string;
  dexNumber: string;
  name: LocalizedText;
  classification: LocalizedText;
  trait: LocalizedText;
  description: LocalizedText;
  snippet: LocalizedText;
  capturedAt: string;
}

export type CommonChapterId = "tutorial" | "git" | "linux";
export type ChapterId = CommonChapterId | `career:${string}` | `promotion:${string}` | `open-source:${string}`;

/** Names the ambient animation layered over a painted background. */
export type AmbienceId = "loop-forest" | "git-field" | "linux-cave" | "title-archive";

/** One stage of a chapter: the creature fought there and the card it leaves. */
export interface MonsterDefinition {
  id: string;
  dexNumber: string;
  /** Sets how many questions a battle draws — see quizCountForLevel. */
  level: number;
  name: LocalizedText;
  classification: LocalizedText;
  trait: LocalizedText;
  description: LocalizedText;
  snippet: LocalizedText;
  textureKey: string;
  assetKey: string;
  /** What the guide says about this stage before the battle starts. */
  briefing: LocalizedText;
  /** Banner line across the top of this monster's battle. */
  preBattleLine: LocalizedText;
  /** Versioned content-pack identifier resolved when the battle starts. */
  quizPackId: string;
  /** @deprecated Transitional inline source; new content belongs in @codigdex/quiz-content. */
  quizPool?: readonly QuizQuestion[];
}

export interface ChapterDefinition {
  id: ChapterId;
  /** Short badge for the path map and dialogs, e.g. "CH.01". */
  label: string;
  name: LocalizedText;
  place: LocalizedText;
  /** Chapter that has to be fully captured before this one opens. */
  requires?: ChapterId;
  npcName: LocalizedText;
  successLine: LocalizedText;
  retryLine: LocalizedText;
  /** Battle backdrop. A chapter without one fights on the plain battle screen. */
  arena?: { textureKey: string; assetKey: string; ambience?: AmbienceId };
  /** Where a failed capture sends the player to try again. */
  retryScene: "world-map" | "path-map" | "career-region" | "promotion-chapter" | "open-source-chapter";
  /** Monsters in unlock order: each opens once the one before it is captured. */
  stages: readonly MonsterDefinition[];
}
