import type { QuizQuestion } from "../../types";

const branchMergeTwinsQuiz = [
  { prompt: "`git branch feature`를 실행하면?", choices: ["feature 브랜치가 생긴다", "feature 브랜치로 이동한다", "feature 브랜치가 지워진다", "feature가 main에 합쳐진다"], answerIndex: 0 },
  { prompt: "다른 브랜치로 이동하는 명령은?", choices: ["git switch feature", "git move feature", "git jump feature", "git go feature"], answerIndex: 0 },
  { prompt: "브랜치를 새로 만들면서 바로 이동하려면?", choices: ["git switch -c feature", "git branch -m feature", "git merge -c feature", "git add -b feature"], answerIndex: 0 },
  { prompt: "브랜치 목록을 보는 명령은?", choices: ["git branch", "git list", "git branches", "git tree"], answerIndex: 0 },
  { prompt: "현재 브랜치에 feature 브랜치를 합치는 명령은?", choices: ["git merge feature", "git join feature", "git add feature", "git push feature"], answerIndex: 0 },
  { prompt: "main에서 `git merge feature`를 실행하면?", choices: ["feature 변경이 main에 합쳐진다", "main 변경이 feature로 간다", "feature 브랜치가 지워진다", "두 브랜치가 초기화된다"], answerIndex: 0 },
  { prompt: "병합이 끝난 feature 브랜치를 삭제하는 명령은?", choices: ["git branch -d feature", "git switch -d feature", "git merge -d feature", "git remove feature"], answerIndex: 0 },
  { prompt: "병합되지 않은 브랜치까지 강제로 지우는 옵션은?", choices: ["git branch -D", "git branch -a", "git branch -m", "git branch -v"], answerIndex: 0 },
  { prompt: "지금 브랜치의 이름을 바꾸는 명령은?", choices: ["git branch -m 새이름", "git branch -d 새이름", "git switch -r 새이름", "git rename 새이름"], answerIndex: 0 },
  { prompt: "브랜치를 가장 잘 설명한 것은?", choices: ["커밋을 가리키는 움직이는 이름", "저장소를 복사한 폴더", "원격 서버 주소", "삭제된 커밋 모음"], answerIndex: 0 },
  { prompt: "main에 새 커밋이 없을 때 feature를 병합하면 일어나는 병합은?", choices: ["fast-forward", "3-way merge", "rebase", "cherry-pick"], answerIndex: 0 },
  { prompt: "두 브랜치 모두 새 커밋이 있을 때 병합하면 보통 생기는 것은?", choices: ["병합 커밋", "새 저장소", "새 원격", "빈 브랜치"], answerIndex: 0 },
  { prompt: "`HEAD`가 가리키는 것은?", choices: ["현재 작업 중인 위치", "저장소의 첫 커밋", "원격 저장소 주소", "삭제된 브랜치"], answerIndex: 0 },
  { prompt: "브랜치를 나눠 작업하는 가장 큰 이유는?", choices: ["main을 건드리지 않고 작업하려고", "저장 공간을 줄이려고", "커밋을 삭제하려고", "원격을 끊으려고"], answerIndex: 0 },
  { prompt: "`git switch main`을 실행하면 작업 폴더의 파일은?", choices: ["main 브랜치 기준으로 바뀐다", "모두 삭제된다", "원격에 올라간다", "새 브랜치로 복사된다"], answerIndex: 0 },
  { prompt: "모든 브랜치의 이력을 그래프로 보려면?", choices: ["git log --graph --all", "git branch --graph", "git status --all", "git diff --graph"], answerIndex: 0 },
  { prompt: "`git checkout -b feature`와 같은 일을 하는 최신 명령은?", choices: ["git switch -c feature", "git branch -m feature", "git merge feature", "git restore feature"], answerIndex: 0 },
  { prompt: "저장소를 새로 만들 때 흔히 쓰는 기본 브랜치 이름은?", choices: ["main", "feature", "origin", "HEAD"], answerIndex: 0 },
  { prompt: "feature를 main에 병합하려면 먼저 어느 브랜치에 있어야 하나요?", choices: ["main 브랜치", "feature 브랜치", "원격 저장소", "어디든 상관없다"], answerIndex: 0 },
  { prompt: "새로 만든 브랜치가 처음 가리키는 커밋은?", choices: ["지금 HEAD가 가리키던 커밋", "저장소의 첫 커밋", "원격의 최신 커밋", "비어 있는 커밋"], answerIndex: 0 },
] satisfies readonly QuizQuestion[];

export default branchMergeTwinsQuiz;
