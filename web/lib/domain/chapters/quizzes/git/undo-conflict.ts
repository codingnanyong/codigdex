import type { QuizQuestion } from "../../types";

const undoConflictQuiz = [
  { prompt: "두 브랜치가 같은 줄을 다르게 고친 뒤 병합하면?", choices: ["충돌(conflict)이 난다", "둘 다 자동으로 지워진다", "새 저장소가 생긴다", "커밋 이력이 초기화된다"], answerIndex: 0 },
  { prompt: "충돌 표시에서 `=======` 줄이 나누는 것은?", choices: ["양쪽 브랜치의 변경 내용", "커밋 메시지", "파일 이름과 경로", "원격과 로컬 주소"], answerIndex: 0 },
  { prompt: "충돌 표시 `<<<<<<< HEAD` 바로 아래 내용은?", choices: ["현재 브랜치 쪽 변경", "병합해 오는 쪽 변경", "원격 저장소 주소", "커밋 메시지"], answerIndex: 0 },
  { prompt: "충돌을 손으로 고친 뒤 해결을 마무리하는 순서는?", choices: ["git add 후 git commit", "git push --force", "git init 후 clone", "git stash 후 drop"], answerIndex: 0 },
  { prompt: "진행 중인 병합을 취소하고 병합 전으로 돌아가려면?", choices: ["git merge --abort", "git merge --undo", "git merge --back", "git stop"], answerIndex: 0 },
  { prompt: "아직 스테이징하지 않은 파일 수정을 되돌리는 명령은?", choices: ["git restore 파일", "git commit 파일", "git push 파일", "git merge 파일"], answerIndex: 0 },
  { prompt: "스테이징만 취소하고 수정 내용은 남기려면?", choices: ["git restore --staged 파일", "git rm 파일", "git reset --hard", "git clean -f"], answerIndex: 0 },
  { prompt: "이미 공유한 커밋을, 취소하는 새 커밋을 만들어 되돌리는 명령은?", choices: ["git revert", "git reset --hard", "git stash", "git clone"], answerIndex: 0 },
  { prompt: "`git reset --hard HEAD~1`의 결과는?", choices: ["마지막 커밋과 변경이 사라진다", "새 커밋이 하나 생긴다", "원격이 삭제된다", "스테이징만 취소된다"], answerIndex: 0 },
  { prompt: "`git reset --soft HEAD~1`의 결과는?", choices: ["커밋만 취소되고 변경은 남는다", "변경까지 모두 삭제된다", "원격 커밋이 지워진다", "새 브랜치가 생긴다"], answerIndex: 0 },
  { prompt: "방금 한 커밋의 메시지를 고치는 명령은?", choices: ["git commit --amend", "git revert --message", "git log --edit", "git rebase --msg"], answerIndex: 0 },
  { prompt: "작업 중인 변경을 잠시 치워 두었다 나중에 꺼내는 명령은?", choices: ["git stash", "git save", "git hide", "git pause"], answerIndex: 0 },
  { prompt: "stash에 치워 둔 변경을 꺼내 다시 적용하려면?", choices: ["git stash pop", "git stash push", "git stash clear", "git stash drop"], answerIndex: 0 },
  { prompt: "reset으로 잃어버린 커밋을 찾을 때 보는 이동 기록은?", choices: ["git reflog", "git blame", "git status", "git tag"], answerIndex: 0 },
  { prompt: "추적되지 않는 새 파일들을 한꺼번에 지우는 명령은?", choices: ["git clean -f", "git rm --all", "git reset --soft", "git stash list"], answerIndex: 0 },
  { prompt: "공유 브랜치에서 reset보다 revert를 권하는 이유는?", choices: ["남의 이력을 깨지 않아서", "훨씬 빨라서", "파일이 작아져서", "원격이 필요 없어서"], answerIndex: 0 },
  { prompt: "`HEAD~1`이 가리키는 것은?", choices: ["현재 커밋의 바로 이전 커밋", "저장소의 첫 커밋", "원격의 최신 커밋", "다음에 만들 커밋"], answerIndex: 0 },
  { prompt: "충돌을 줄이는 좋은 습관은?", choices: ["작게 자주 커밋하고 병합하기", "한 번에 몰아서 커밋하기", "병합을 최대한 미루기", "브랜치를 오래 끌기"], answerIndex: 0 },
  { prompt: "커밋 안 한 수정과 스테이징을 모두 버리고 마지막 커밋으로 가려면?", choices: ["git reset --hard", "git reset --soft", "git revert HEAD", "git stash pop"], answerIndex: 0 },
  { prompt: "`git revert <커밋>`을 하면 이력에 남는 것은?", choices: ["되돌리는 새 커밋", "아무것도 남지 않는다", "원래 커밋이 삭제된다", "새 브랜치"], answerIndex: 0 },
] satisfies readonly QuizQuestion[];

export default undoConflictQuiz;
