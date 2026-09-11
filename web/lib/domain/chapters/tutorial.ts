import type { ChapterDefinition } from "./types";

export const TUTORIAL_ONBOARDING_LINES = [
  "처음 왔구나, 주니어 개발자! 나는 버그 연구원 루피야.",
  "이 세계의 버그는 코드 지식으로 물리친 뒤, 마지막 문제까지 맞혀야 도감에 등록할 수 있어.",
  "첫 번째 버그가 우물가에서 소동을 벌이고 있어. 빛나는 의뢰 표식을 눌러 만나 보자!",
] as const;

export const TUTORIAL_CHAPTER: ChapterDefinition = {
  id: "tutorial",
  label: "TUTORIAL",
  name: "튜토리얼",
  place: "반복문의 숲",
  npcName: "루피",
  successLine: "오, 완벽하게 잡았네! 바로 도감에 등록해줄게.",
  retryLine: "아직 다 못 잡은 것 같아. 반복문을 다시 한번 살펴보고 재도전해보자!",
  retryScene: "world-map",
  stages: [
    {
      id: "infinite-loop-slime",
      dexNumber: "001",
      level: 1,
      name: "무한루프 버그",
      classification: "반복 순환형",
      trait: "정해진 횟수만큼 동작을 정확히 반복한다",
      description:
        "for 반복문 — 정해진 횟수만큼 같은 동작을 반복 실행하는 문법. range(5)는 0부터 4까지 5번을 의미한다.",
      snippet: "for i in range(5):\n    물_긷기()",
      textureKey: "loop-bug",
      assetPath: "/assets/monsters/ch00.tutorial/loop-bug-v2.png",
      briefing: "무한루프 버그가 우물가를 계속 맴돌고 있어요. 물리치고 도감에 등록해주세요!",
      preBattleLine:
        "저 버그, 같은 경로를 계속 맴돌고 있어. for 반복문으로 정확히 5번만 물을 부어보자!",
      // A battle draws quizCountForLevel(level) of these at random, so a retry
      // asks a different set than the first attempt.
      quizPool: [
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
        {
          prompt: "`range(5)`가 만들어내는 첫 번째 값은?",
          choices: ["0", "1", "4", "5"],
          answerIndex: 0,
        },
        {
          prompt: "`range(5)`가 만들어내는 마지막 값은?",
          choices: ["3", "4", "5", "6"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(2, 5):` 는 몇 번 반복되나요?",
          choices: ["2", "3", "4", "5"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(0):` 안의 코드는 어떻게 되나요?",
          choices: ["한 번 실행된다", "한 번도 실행되지 않는다", "무한 반복된다", "에러가 난다"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(3):`\n`    print(i)`\n출력 결과는?",
          choices: ["1 2 3", "0 1 2", "0 1 2 3", "3 3 3"],
          answerIndex: 1,
        },
        {
          prompt: "반복 횟수를 미리 알 수 없을 때 더 알맞은 것은?",
          choices: ["for", "while", "if", "def"],
          answerIndex: 1,
        },
        {
          prompt: "`for` 다음 줄이 반복문 안에 들어가려면 무엇이 필요한가요?",
          choices: ["들여쓰기", "세미콜론", "괄호", "쉼표"],
          answerIndex: 0,
        },
        {
          prompt: "`for 물통 in 우물:` 에서 반복할 때마다 바뀌는 것은?",
          choices: ["우물", "물통", "for", "둘 다"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(1, 4):` 에서 i가 갖는 값을 순서대로 고르면?",
          choices: ["1 2 3", "0 1 2 3", "1 2 3 4", "1 4"],
          answerIndex: 0,
        },
        {
          prompt: "`range(0, 10, 2)`에서 세 번째 값은?",
          choices: ["2", "3", "4", "6"],
          answerIndex: 2,
        },
        {
          prompt: "반복을 즉시 멈추고 빠져나갈 때 쓰는 것은?",
          choices: ["break", "continue", "return", "pass"],
          answerIndex: 0,
        },
        {
          prompt: "이번 회차만 건너뛰고 다음 반복으로 넘어갈 때 쓰는 것은?",
          choices: ["break", "continue", "skip", "exit"],
          answerIndex: 1,
        },
        {
          prompt: "`총합 = 0`\n`for i in range(1, 4):`\n`    총합 += i`\n총합은?",
          choices: ["3", "6", "10", "4"],
          answerIndex: 1,
        },
        {
          prompt: "`for 물통 in [10, 20, 30]:` 첫 반복에서 물통의 값은?",
          choices: ["0", "10", "30", "[10, 20, 30]"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(2):`\n`    for j in range(3):`\n안쪽 코드는 총 몇 번 실행되나요?",
          choices: ["2", "3", "5", "6"],
          answerIndex: 3,
        },
        {
          prompt: "`while True:` 안에 `break`가 없으면 어떻게 되나요?",
          choices: ["한 번만 실행된다", "무한 반복된다", "실행되지 않는다", "에러가 난다"],
          answerIndex: 1,
        },
        {
          prompt: "`for i in range(5):` 의 마지막 반복에서 i는?",
          choices: ["3", "4", "5", "6"],
          answerIndex: 1,
        },
        {
          prompt: "리스트 `물통들`의 개수만큼 반복하려면 range 안에 무엇을 넣나요?",
          choices: ["len(물통들)", "물통들", "count(물통들)", "size(물통들)"],
          answerIndex: 0,
        },
      ],
    },
  ],
};

export const TUTORIAL_MONSTER = TUTORIAL_CHAPTER.stages[0];
