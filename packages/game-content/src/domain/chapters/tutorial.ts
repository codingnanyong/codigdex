import { text } from "@codigdex/game-core/i18n/locale";
import { question } from "./quizzes/question";
import type { ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";

export const TUTORIAL_ONBOARDING_LINES = [
  text(
    "처음 왔구나, 주니어 개발자! 나는 버그 연구원 루피야.",
    "You must be new here, junior developer! I'm Lupi, the bug researcher."
  ),
  text(
    "이 세계의 버그는 코드 문제로 물리쳐. 나온 문제의 60% 이상을 맞히면 도감에 등록할 수 있어.",
    "In this world, you beat bugs with coding questions. Get at least 60% of them right to register the bug in your dex."
  ),
  text(
    "첫 번째 버그가 우물가에서 소동을 벌이고 있어. 빛나는 의뢰 표식을 눌러 만나 보자!",
    "Your first bug is causing trouble by the well. Tap the glowing request marker to go meet it!"
  ),
] as const;

export const TUTORIAL_CHAPTER: ChapterDefinition = {
  id: "tutorial",
  label: "TUTORIAL",
  name: text("튜토리얼", "Tutorial"),
  place: text("반복문의 숲", "Loop Forest"),
  npcName: text("루피", "Lupi"),
  successLine: text("오, 잘 잡았네! 바로 도감에 등록해줄게.", "Nice catch! I'll register it in your dex right away."),
  retryLine: text(
    "아직 다 못 잡은 것 같아. 반복문을 다시 한번 살펴보고 재도전해보자!",
    "It got away this time. Let's take another look at loops and try again!"
  ),
  retryScene: "world-map",
  stages: [
    {
      id: "infinite-loop-slime",
      dexNumber: "000",
      level: 1,
      name: text("무한루프 버그", "Infinite Loop Bug"),
      classification: text("반복 순환형", "Looping type"),
      trait: text("정해진 횟수만큼 동작을 정확히 반복한다", "Repeats an action exactly a set number of times"),
      description: text(
        "for 반복문 — 정해진 횟수만큼 같은 동작을 반복 실행하는 문법. range(5)는 0부터 4까지 5번을 의미한다.",
        "for loop — syntax that repeats the same action a fixed number of times. range(5) means 5 times, from 0 to 4."
      ),
      snippet: text("for i in range(5):\n    물_긷기()", "for i in range(5):\n    draw_water()"),
      textureKey: "loop-bug",
      assetKey: "monsters/ch00.tutorial/loop-bug-v2.png",
      briefing: text(
        "무한루프 버그가 우물가를 계속 맴돌고 있어요. 물리치고 도감에 등록해주세요!",
        "The Infinite Loop Bug keeps circling the well. Defeat it and register it in your dex!"
      ),
      preBattleLine: text(
        "저 버그, 같은 경로를 계속 맴돌고 있어. for 반복문으로 정확히 5번만 물을 부어보자!",
        "That bug keeps running the same path. Use a for loop to pour water exactly 5 times!"
      ),
      // A battle draws quizCountForLevel(level) of these at random, so a retry
      // asks a different set than the first attempt.
      quizPool: [
        question(["`for i in range(5):` 는 몇 번 반복되나요?", "How many times does `for i in range(5):` loop?"], ["3", "4", "5", "6"], 2),
        question(["____ i in range(5):", "____ i in range(5):"], ["for", "while", "if", "in"], 0),
        question(["`range(5)`가 만들어내는 첫 번째 값은?", "What is the first value `range(5)` produces?"], ["0", "1", "4", "5"], 0),
        question(["`range(5)`가 만들어내는 마지막 값은?", "What is the last value `range(5)` produces?"], ["3", "4", "5", "6"], 1),
        question(["`for i in range(2, 5):` 는 몇 번 반복되나요?", "How many times does `for i in range(2, 5):` loop?"], ["2", "3", "4", "5"], 1),
        question(
          ["`for i in range(0):` 안의 코드는 어떻게 되나요?", "What happens to the code inside `for i in range(0):`?"],
          [["한 번 실행된다", "It runs once"], ["한 번도 실행되지 않는다", "It never runs"], ["무한 반복된다", "It loops forever"], ["에러가 난다", "It raises an error"]],
          1
        ),
        question(["`for i in range(3):`\n`    print(i)`\n출력 결과는?", "`for i in range(3):`\n`    print(i)`\nWhat does it print?"], ["1 2 3", "0 1 2", "0 1 2 3", "3 3 3"], 1),
        question(["반복 횟수를 미리 알 수 없을 때 더 알맞은 것은?", "Which fits better when you can't know the number of loops in advance?"], ["for", "while", "if", "def"], 1),
        question(
          ["`for` 다음 줄이 반복문 안에 들어가려면 무엇이 필요한가요?", "What does the line after `for` need to be inside the loop?"],
          [["들여쓰기", "Indentation"], ["세미콜론", "A semicolon"], ["괄호", "Parentheses"], ["쉼표", "A comma"]],
          0
        ),
        question(
          ["`for 물통 in 우물:` 에서 반복할 때마다 바뀌는 것은?", "In `for bucket in well:`, what changes on every loop?"],
          [["우물", "well"], ["물통", "bucket"], "for", ["둘 다", "Both"]],
          1
        ),
        question(["`for i in range(1, 4):` 에서 i가 갖는 값을 순서대로 고르면?", "In `for i in range(1, 4):`, which values does i take, in order?"], ["1 2 3", "0 1 2 3", "1 2 3 4", "1 4"], 0),
        question(["`range(0, 10, 2)`에서 세 번째 값은?", "What is the third value of `range(0, 10, 2)`?"], ["2", "3", "4", "6"], 2),
        question(["반복을 즉시 멈추고 빠져나갈 때 쓰는 것은?", "What do you use to stop a loop immediately and leave it?"], ["break", "continue", "return", "pass"], 0),
        question(["이번 회차만 건너뛰고 다음 반복으로 넘어갈 때 쓰는 것은?", "What do you use to skip just this pass and move on to the next loop?"], ["break", "continue", "skip", "exit"], 1),
        question(["`총합 = 0`\n`for i in range(1, 4):`\n`    총합 += i`\n총합은?", "`total = 0`\n`for i in range(1, 4):`\n`    total += i`\nWhat is total?"], ["3", "6", "10", "4"], 1),
        question(["`for 물통 in [10, 20, 30]:` 첫 반복에서 물통의 값은?", "In `for bucket in [10, 20, 30]:`, what is bucket on the first loop?"], ["0", "10", "30", "[10, 20, 30]"], 1),
        question(["`for i in range(2):`\n`    for j in range(3):`\n안쪽 코드는 총 몇 번 실행되나요?", "`for i in range(2):`\n`    for j in range(3):`\nHow many times does the inner code run in total?"], ["2", "3", "5", "6"], 3),
        question(
          ["`while True:` 안에 `break`가 없으면 어떻게 되나요?", "What happens if there is no `break` inside `while True:`?"],
          [["한 번만 실행된다", "It runs only once"], ["무한 반복된다", "It loops forever"], ["실행되지 않는다", "It never runs"], ["에러가 난다", "It raises an error"]],
          1
        ),
        question(["`for i in range(5):` 의 마지막 반복에서 i는?", "In `for i in range(5):`, what is i on the last loop?"], ["3", "4", "5", "6"], 1),
        question(
          ["리스트 `물통들`의 개수만큼 반복하려면 range 안에 무엇을 넣나요?", "To loop once per item in the list `buckets`, what goes inside range?"],
          [["len(물통들)", "len(buckets)"], ["물통들", "buckets"], ["count(물통들)", "count(buckets)"], ["size(물통들)", "size(buckets)"]],
          0
        ),
      ],
    },
  ],
};

export const TUTORIAL_MONSTER = TUTORIAL_CHAPTER.stages[0];
