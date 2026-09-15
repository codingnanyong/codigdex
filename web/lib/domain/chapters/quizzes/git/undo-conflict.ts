import type { QuizQuestion } from "../../types";
import { question } from "../question";

const undoConflictQuiz = [
  question(
    ["두 브랜치가 같은 줄을 다르게 고친 뒤 병합하면?", "What happens when two branches edit the same line differently and are merged?"],
    [["충돌(conflict)이 난다", "A conflict occurs"], ["둘 다 자동으로 지워진다", "Both are deleted automatically"], ["새 저장소가 생긴다", "A new repository is created"], ["커밋 이력이 초기화된다", "The commit history is reset"]]
  ),
  question(
    ["충돌 표시에서 `=======` 줄이 나누는 것은?", "In a conflict marker, what does the `=======` line separate?"],
    [["양쪽 브랜치의 변경 내용", "The changes from each branch"], ["커밋 메시지", "Commit messages"], ["파일 이름과 경로", "File name and path"], ["원격과 로컬 주소", "Remote and local addresses"]]
  ),
  question(
    ["충돌 표시 `<<<<<<< HEAD` 바로 아래 내용은?", "What comes right below the conflict marker `<<<<<<< HEAD`?"],
    [["현재 브랜치 쪽 변경", "The current branch's changes"], ["병합해 오는 쪽 변경", "The incoming branch's changes"], ["원격 저장소 주소", "The remote repository address"], ["커밋 메시지", "The commit message"]]
  ),
  question(
    ["충돌을 손으로 고친 뒤 해결을 마무리하는 순서는?", "After fixing a conflict by hand, how do you finish resolving it?"],
    [["git add 후 git commit", "git add, then git commit"], "git push --force", ["git init 후 clone", "git init, then clone"], ["git stash 후 drop", "git stash, then drop"]]
  ),
  question(["진행 중인 병합을 취소하고 병합 전으로 돌아가려면?", "How do you cancel a merge in progress and go back to before it?"], ["git merge --abort", "git merge --undo", "git merge --back", "git stop"]),
  question(
    ["아직 스테이징하지 않은 파일 수정을 되돌리는 명령은?", "Which command discards edits to a file that are not staged yet?"],
    [["git restore 파일", "git restore file"], ["git commit 파일", "git commit file"], ["git push 파일", "git push file"], ["git merge 파일", "git merge file"]]
  ),
  question(
    ["스테이징만 취소하고 수정 내용은 남기려면?", "How do you unstage a file but keep your edits?"],
    [["git restore --staged 파일", "git restore --staged file"], ["git rm 파일", "git rm file"], "git reset --hard", "git clean -f"]
  ),
  question(["이미 공유한 커밋을, 취소하는 새 커밋을 만들어 되돌리는 명령은?", "Which command undoes an already-shared commit by creating a new commit that reverses it?"], ["git revert", "git reset --hard", "git stash", "git clone"]),
  question(
    ["`git reset --hard HEAD~1`의 결과는?", "What does `git reset --hard HEAD~1` do?"],
    [["마지막 커밋과 변경이 사라진다", "The last commit and its changes are gone"], ["새 커밋이 하나 생긴다", "A new commit is created"], ["원격이 삭제된다", "The remote is deleted"], ["스테이징만 취소된다", "Only the staging is undone"]]
  ),
  question(
    ["`git reset --soft HEAD~1`의 결과는?", "What does `git reset --soft HEAD~1` do?"],
    [["커밋만 취소되고 변경은 남는다", "Only the commit is undone; the changes stay"], ["변경까지 모두 삭제된다", "The changes are deleted too"], ["원격 커밋이 지워진다", "The remote commit is erased"], ["새 브랜치가 생긴다", "A new branch is created"]]
  ),
  question(["방금 한 커밋의 메시지를 고치는 명령은?", "Which command edits the message of the commit you just made?"], ["git commit --amend", "git revert --message", "git log --edit", "git rebase --msg"]),
  question(["작업 중인 변경을 잠시 치워 두었다 나중에 꺼내는 명령은?", "Which command tucks away work in progress so you can bring it back later?"], ["git stash", "git save", "git hide", "git pause"]),
  question(["stash에 치워 둔 변경을 꺼내 다시 적용하려면?", "How do you take stashed changes back out and reapply them?"], ["git stash pop", "git stash push", "git stash clear", "git stash drop"]),
  question(["reset으로 잃어버린 커밋을 찾을 때 보는 이동 기록은?", "Which movement log do you check to find commits lost to a reset?"], ["git reflog", "git blame", "git status", "git tag"]),
  question(["추적되지 않는 새 파일들을 한꺼번에 지우는 명령은?", "Which command deletes all untracked new files at once?"], ["git clean -f", "git rm --all", "git reset --soft", "git stash list"]),
  question(
    ["공유 브랜치에서 reset보다 revert를 권하는 이유는?", "Why is revert recommended over reset on a shared branch?"],
    [["남의 이력을 깨지 않아서", "It doesn't break other people's history"], ["훨씬 빨라서", "It's much faster"], ["파일이 작아져서", "It makes files smaller"], ["원격이 필요 없어서", "It doesn't need a remote"]]
  ),
  question(
    ["`HEAD~1`이 가리키는 것은?", "What does `HEAD~1` point to?"],
    [["현재 커밋의 바로 이전 커밋", "The commit right before the current one"], ["저장소의 첫 커밋", "The repository's first commit"], ["원격의 최신 커밋", "The latest commit on the remote"], ["다음에 만들 커밋", "The next commit you will make"]]
  ),
  question(
    ["충돌을 줄이는 좋은 습관은?", "Which habit helps reduce conflicts?"],
    [["작게 자주 커밋하고 병합하기", "Commit and merge small changes often"], ["한 번에 몰아서 커밋하기", "Commit everything in one big batch"], ["병합을 최대한 미루기", "Put off merging as long as possible"], ["브랜치를 오래 끌기", "Keep branches alive for a long time"]]
  ),
  question(["커밋 안 한 수정과 스테이징을 모두 버리고 마지막 커밋으로 가려면?", "How do you throw away all uncommitted edits and staging and return to the last commit?"], ["git reset --hard", "git reset --soft", "git revert HEAD", "git stash pop"]),
  question(
    ["`git revert <커밋>`을 하면 이력에 남는 것은?", "What stays in the history after `git revert <commit>`?"],
    [["되돌리는 새 커밋", "A new commit that reverses it"], ["아무것도 남지 않는다", "Nothing is left"], ["원래 커밋이 삭제된다", "The original commit is deleted"], ["새 브랜치", "A new branch"]]
  ),
] satisfies readonly QuizQuestion[];

export default undoConflictQuiz;
