import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const branchMergeTwinsQuiz = [
  question(
    ["`git branch feature`를 실행하면?", "What happens when you run `git branch feature`?"],
    [["feature 브랜치가 생긴다", "A feature branch is created"], ["feature 브랜치로 이동한다", "You switch to the feature branch"], ["feature 브랜치가 지워진다", "The feature branch is deleted"], ["feature가 main에 합쳐진다", "feature is merged into main"]]
  ),
  question(["다른 브랜치로 이동하는 명령은?", "Which command moves you to another branch?"], ["git switch feature", "git move feature", "git jump feature", "git go feature"]),
  question(["브랜치를 새로 만들면서 바로 이동하려면?", "How do you create a new branch and switch to it right away?"], ["git switch -c feature", "git branch -m feature", "git merge -c feature", "git add -b feature"]),
  question(["브랜치 목록을 보는 명령은?", "Which command lists the branches?"], ["git branch", "git list", "git branches", "git tree"]),
  question(["현재 브랜치에 feature 브랜치를 합치는 명령은?", "Which command merges the feature branch into the current branch?"], ["git merge feature", "git join feature", "git add feature", "git push feature"]),
  question(
    ["main에서 `git merge feature`를 실행하면?", "What happens when you run `git merge feature` on main?"],
    [["feature 변경이 main에 합쳐진다", "feature's changes are merged into main"], ["main 변경이 feature로 간다", "main's changes go to feature"], ["feature 브랜치가 지워진다", "The feature branch is deleted"], ["두 브랜치가 초기화된다", "Both branches are reset"]]
  ),
  question(["병합이 끝난 feature 브랜치를 삭제하는 명령은?", "Which command deletes a feature branch that has been merged?"], ["git branch -d feature", "git switch -d feature", "git merge -d feature", "git remove feature"]),
  question(["병합되지 않은 브랜치까지 강제로 지우는 옵션은?", "Which option force-deletes a branch even if it isn't merged?"], ["git branch -D", "git branch -a", "git branch -m", "git branch -v"]),
  question(
    ["지금 브랜치의 이름을 바꾸는 명령은?", "Which command renames the current branch?"],
    [["git branch -m 새이름", "git branch -m new-name"], ["git branch -d 새이름", "git branch -d new-name"], ["git switch -r 새이름", "git switch -r new-name"], ["git rename 새이름", "git rename new-name"]]
  ),
  question(
    ["브랜치를 가장 잘 설명한 것은?", "Which best describes a branch?"],
    [["커밋을 가리키는 움직이는 이름", "A movable name that points at a commit"], ["저장소를 복사한 폴더", "A folder copy of the repository"], ["원격 서버 주소", "A remote server address"], ["삭제된 커밋 모음", "A pile of deleted commits"]]
  ),
  question(["main에 새 커밋이 없을 때 feature를 병합하면 일어나는 병합은?", "If main has no new commits, what kind of merge happens when you merge feature?"], ["fast-forward", "3-way merge", "rebase", "cherry-pick"]),
  question(
    ["두 브랜치 모두 새 커밋이 있을 때 병합하면 보통 생기는 것은?", "When both branches have new commits, what does merging usually create?"],
    [["병합 커밋", "A merge commit"], ["새 저장소", "A new repository"], ["새 원격", "A new remote"], ["빈 브랜치", "An empty branch"]]
  ),
  question(
    ["`HEAD`가 가리키는 것은?", "What does `HEAD` point to?"],
    [["현재 작업 중인 위치", "Where you are currently working"], ["저장소의 첫 커밋", "The repository's first commit"], ["원격 저장소 주소", "The remote repository address"], ["삭제된 브랜치", "A deleted branch"]]
  ),
  question(
    ["브랜치를 나눠 작업하는 가장 큰 이유는?", "What is the main reason to work on separate branches?"],
    [["main을 건드리지 않고 작업하려고", "To work without touching main"], ["저장 공간을 줄이려고", "To save disk space"], ["커밋을 삭제하려고", "To delete commits"], ["원격을 끊으려고", "To disconnect the remote"]]
  ),
  question(
    ["`git switch main`을 실행하면 작업 폴더의 파일은?", "After `git switch main`, what happens to the files in your working folder?"],
    [["main 브랜치 기준으로 바뀐다", "They change to match the main branch"], ["모두 삭제된다", "They are all deleted"], ["원격에 올라간다", "They are uploaded to the remote"], ["새 브랜치로 복사된다", "They are copied to a new branch"]]
  ),
  question(["모든 브랜치의 이력을 그래프로 보려면?", "How do you view the history of every branch as a graph?"], ["git log --graph --all", "git branch --graph", "git status --all", "git diff --graph"]),
  question(["`git checkout -b feature`와 같은 일을 하는 최신 명령은?", "Which newer command does the same thing as `git checkout -b feature`?"], ["git switch -c feature", "git branch -m feature", "git merge feature", "git restore feature"]),
  question(["저장소를 새로 만들 때 흔히 쓰는 기본 브랜치 이름은?", "What is the common default branch name for a new repository?"], ["main", "feature", "origin", "HEAD"]),
  question(
    ["feature를 main에 병합하려면 먼저 어느 브랜치에 있어야 하나요?", "To merge feature into main, which branch do you need to be on first?"],
    [["main 브랜치", "The main branch"], ["feature 브랜치", "The feature branch"], ["원격 저장소", "The remote repository"], ["어디든 상관없다", "It doesn't matter"]]
  ),
  question(
    ["새로 만든 브랜치가 처음 가리키는 커밋은?", "Which commit does a newly created branch point to at first?"],
    [["지금 HEAD가 가리키던 커밋", "The commit HEAD was pointing to"], ["저장소의 첫 커밋", "The repository's first commit"], ["원격의 최신 커밋", "The latest commit on the remote"], ["비어 있는 커밋", "An empty commit"]]
  ),
] satisfies readonly QuizQuestion[];

export default branchMergeTwinsQuiz;
