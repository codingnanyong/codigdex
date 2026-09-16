import type { LocalizedText } from "../../i18n/locale";

export interface QuizQuestion {
  prompt: LocalizedText;
  choices: readonly LocalizedText[];
  answerIndex: number;
}

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
export type ChapterId = CommonChapterId | `career:${string}`;

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
  retryScene: "world-map" | "path-map" | "career-region";
  /** Monsters in unlock order: each opens once the one before it is captured. */
  stages: readonly MonsterDefinition[];
}
