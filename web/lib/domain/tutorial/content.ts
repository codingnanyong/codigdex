export type CardGrade = "bronze" | "silver" | "gold";

export interface CapturedCard {
  id: string;
  name: string;
  grade: CardGrade;
  description: string;
  snippet: string;
  capturedAt: string;
}

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  answerIndex: number;
}

export const REGISTRY_KEYS = {
  exp: "exp",
  coins: "coins",
  cards: "cards",
  badges: "badges",
} as const;

export const TUTORIAL_MASTER_BADGE_ID = "tutorial-master";

export const TUTORIAL_CHAPTER_TITLE = "튜토리얼 · 반복문의 숲";

export const TUTORIAL_MONSTER = {
  id: "infinite-loop-slime",
  name: "무한루프 슬라임",
  npcName: "루피",
  questText:
    "무한루프 슬라임들이 우물을 막고 있어요. 물리치고 도감에 등록해주세요!",
  codeBlocks: ["for", "i in range(5):", "물_긷기()"],
  quiz: [
    {
      prompt: "`for i in range(5):` 는 몇 번 반복되나요?",
      choices: ["3", "4", "5", "6"],
      answerIndex: 2,
    },
    {
      prompt: "____ i in range(5):",
      choices: ["for", "while", "if", "in"],
      answerIndex: 0,
    },
  ] satisfies QuizQuestion[],
  description:
    "for 반복문 — 정해진 횟수만큼 같은 동작을 반복 실행하는 문법. range(5)는 0부터 4까지 5번을 의미한다.",
  snippet: "for i in range(5):\n    물_긷기()",
  rewards: { exp: 50, coins: 20 },
} as const;

export const NPC_REACTIONS: Record<CardGrade, string> = {
  gold: "오, 골드로 잡았네! 나도 저번에 실버로 겨우 잡았었는데 ㅋㅋ",
  silver: "실버도 훌륭해! 한 번 더 조우하면 골드도 노려볼 수 있어.",
  bronze: "브론즈 등록 완료! 다음에 다시 만나면 복습 겸 재도전해보자.",
};

export const NPC_PRE_BATTLE_LINE =
  "저 슬라임, 같은 자리를 계속 맴돌고 있어. for 반복문으로 정확히 5번만 물을 부어보자!";

export const TOTAL_TUTORIAL_MONSTERS = 1;
