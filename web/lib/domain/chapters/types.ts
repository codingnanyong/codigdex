export interface QuizQuestion {
  prompt: string;
  choices: string[];
  answerIndex: number;
}

export interface CapturedCard {
  id: string;
  dexNumber: string;
  name: string;
  classification: string;
  trait: string;
  description: string;
  snippet: string;
  capturedAt: string;
}

export type ChapterId = "tutorial" | "git" | "linux";

/** Names the ambient animation layered over a painted background. */
export type AmbienceId = "loop-forest" | "git-field" | "linux-cave" | "title-archive";

/** One stage of a chapter: the creature fought there and the card it leaves. */
export interface MonsterDefinition {
  id: string;
  dexNumber: string;
  /** Sets how many questions a battle draws — see quizCountForLevel. */
  level: number;
  name: string;
  classification: string;
  trait: string;
  description: string;
  snippet: string;
  textureKey: string;
  assetPath: string;
  /** What the guide says about this stage before the battle starts. */
  briefing: string;
  /** Banner line across the top of this monster's battle. */
  preBattleLine: string;
  quizPool: readonly QuizQuestion[];
}

export interface ChapterDefinition {
  id: ChapterId;
  /** Short badge for the path map and dialogs, e.g. "CH.01". */
  label: string;
  name: string;
  place: string;
  /** Chapter that has to be fully captured before this one opens. */
  requires?: ChapterId;
  npcName: string;
  successLine: string;
  retryLine: string;
  /** Battle backdrop. A chapter without one fights on the plain battle screen. */
  arena?: { textureKey: string; assetPath: string; ambience: AmbienceId };
  /** Where a failed capture sends the player to try again. */
  retryScene: "world-map" | "path-map";
  /** Monsters in unlock order: each opens once the one before it is captured. */
  stages: readonly MonsterDefinition[];
}
