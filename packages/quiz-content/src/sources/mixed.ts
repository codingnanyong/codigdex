import type { FreeTextQuestion } from "@codigdex/game-core/domain/chapters/types";
import { freeTextQuestion } from "./question";

/** Authored replacements keep the original twenty-question pools available to choice-only clients. */
export const MIXED_REPLACEMENTS: Readonly<Record<string, Readonly<Record<number, FreeTextQuestion>>>> = {
  "infinite-loop-slime": {
    0: freeTextQuestion({
      prompt: ["단답: range(5)의 값 개수를 숫자로 적으세요.", "Type the number of values produced by range(5)."],
      acceptedAnswers: ["5"],
      hints: [["시작값을 생략하면 음수가 아닌 가장 작은 정수부터 시작해요.", "With no start value, begin at the smallest nonnegative integer."], ["끝값은 포함되지 않아요. 그 직전까지의 개수를 세어 보세요.", "The stop value is excluded. Count the values before it."]],
      explanation: ["range(5)는 0, 1, 2, 3, 4의 다섯 값을 만들어요.", "range(5) produces five values: 0, 1, 2, 3 and 4."],
    }),
    1: freeTextQuestion({
      prompt: ["단답: ___ i in range(3): 의 빈칸에 들어갈 반복문 키워드는?", "Type the loop keyword missing from: ___ i in range(3):"],
      acceptedAnswers: ["for"],
      hints: [["정해진 값들을 하나씩 순회하는 반복문이에요.", "This loop visits each value in a sequence."], ["in 앞에서 반복 변수를 선언하는 키워드예요.", "The keyword introduces the loop variable before in."]],
      explanation: ["for 반복문은 range 등의 값들을 하나씩 순회해요.", "A for loop visits values from a sequence such as range."],
    }),
    2: freeTextQuestion({
      prompt: ["단답: range(3)의 첫 값을 숫자로 적으세요.", "Type the first value produced by range(3)."],
      acceptedAnswers: ["0"],
      hints: [["시작값을 따로 적지 않은 range예요.", "No start value is specified here."], ["기본 시작값은 가장 작은 음이 아닌 정수예요.", "The default start is the smallest nonnegative integer."]],
      explanation: ["range(3)은 0, 1, 2를 만들므로 첫 값은 0이에요.", "range(3) produces 0, 1 and 2, so the first value is 0."],
    }),
    3: freeTextQuestion({
      prompt: ["단답: range(5)의 마지막 값을 숫자로 적으세요.", "Type the last value produced by range(5)."],
      acceptedAnswers: ["4"],
      hints: [["range의 끝 경계는 결과에 포함되지 않아요.", "The stop boundary is not included in the result."], ["끝 경계보다 하나 작은 정수를 생각해 보세요.", "Think of the integer immediately before the stop boundary."]],
      explanation: ["range(5)의 마지막 값은 끝 경계 5보다 하나 작은 4예요.", "The last value of range(5) is 4, one less than the stop boundary 5."],
    }),
    7: freeTextQuestion({
      prompt: ["단답: 반복 횟수 대신 조건이 참인 동안 반복하는 Python 키워드는?", "Type the Python keyword that repeats while a condition is true."],
      acceptedAnswers: ["while"],
      hints: [["반복할 횟수를 미리 알지 못할 때 사용할 수 있어요.", "It can be used when the iteration count is not known in advance."], ["값들을 순회하는 대신 매번 조건을 확인하는 반복문이에요.", "This loop checks a condition instead of visiting a sequence."]],
      explanation: ["while 반복문은 조건이 참인 동안 본문을 반복해요.", "A while loop repeats its body as long as its condition is true."],
    }),
  },
  "git-sprout": {
    0: freeTextQuestion({ prompt: ["단답: 현재 폴더에서 새 Git 저장소를 초기화하는 명령어는?", "Type the command to initialize a new Git repository in the current folder."], acceptedAnswers: ["git init"], hints: [["현재 폴더에 버전 관리용 메타데이터를 만들어요.", "Create version-control metadata in the current folder."], ["git 다음에 초기화를 뜻하는 짧은 하위 명령을 적으세요.", "After git, use the short subcommand for initialization."]], explanation: ["git init은 현재 폴더를 Git 저장소로 초기화해요.", "git init initializes the current folder as a Git repository."] }),
    3: freeTextQuestion({ prompt: ["단답: 작업 트리의 수정·스테이징 상태를 확인하는 Git 명령어는?", "Type a Git command that shows modified and staged files."], acceptedAnswers: ["git status", "git status --short", "git status -s"], hints: [["새 커밋을 만들지 않고 현재 상태만 확인해요.", "Inspect the current state without creating a commit."], ["git 다음에 상태를 뜻하는 하위 명령을 적으세요.", "After git, use the subcommand named for the current state."]], explanation: ["git status는 추적·수정·스테이징 상태를 보여줘요. -s와 --short는 짧은 출력이에요.", "git status shows tracked, modified and staged files. -s and --short request compact output."] }),
    4: freeTextQuestion({ prompt: ["단답: 지금까지 쌓인 커밋 이력을 확인하는 기본 Git 명령어는?", "Type the basic Git command for viewing commit history."], acceptedAnswers: ["git log"], hints: [["현재 파일의 변경이 아니라 과거 기록을 확인해요.", "Inspect past records rather than current file changes."], ["git 다음에 기록을 뜻하는 하위 명령을 적으세요.", "After git, use the subcommand named for a record of events."]], explanation: ["git log는 커밋 이력을 보여줘요.", "git log shows the commit history."] }),
    6: freeTextQuestion({ prompt: ["단답: 스테이징 전 변경을 줄 단위로 비교하는 Git 명령어는?", "Type the Git command that compares unstaged edits line by line."], acceptedAnswers: ["git diff"], hints: [["변경 여부뿐 아니라 바뀐 줄을 확인하고 싶어요.", "Inspect the changed lines, not just whether a file changed."], ["git 다음에 차이를 뜻하는 짧은 하위 명령을 적으세요.", "After git, use the short subcommand named for differences."]], explanation: ["git diff는 작업 트리와 인덱스의 차이, 즉 스테이징 전 변경을 보여줘요.", "git diff compares the working tree with the index, showing unstaged edits."] }),
    10: freeTextQuestion({ prompt: ["단답: 현재 폴더와 하위 폴더의 변경을 스테이징하는 명령어는? 경로는 점 하나로 적으세요.", "Type the command to stage changes in this folder and its children, using a single dot for the path."], acceptedAnswers: ["git add ."], hints: [["커밋에 넣기 전에 변경을 스테이징 영역에 올려요.", "Move changes into the staging area before committing."], ["git 다음에 추가 명령과 현재 폴더를 나타내는 경로를 적으세요.", "After git, use the add subcommand followed by the current-folder path."]], explanation: ["git add .은 현재 폴더와 하위 폴더의 변경을 스테이징해요.", "git add . stages changes in the current folder and its descendants."] }),
  },
};
