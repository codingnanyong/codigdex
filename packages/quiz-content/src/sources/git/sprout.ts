import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const sproutQuiz = [
  question(["새 폴더를 Git 저장소로 만드는 명령은?", "Which command turns a new folder into a Git repository?"], ["git init", "git start", "git new", "git create"]),
  question(["수정한 파일을 다음 커밋에 담도록 스테이징하는 명령은?", "Which command stages an edited file for the next commit?"], ["git add", "git commit", "git push", "git save"]),
  question(
    ["스테이징된 변경을 메시지와 함께 기록하는 명령은?", "Which command records staged changes with a message?"],
    [['git commit -m "메시지"', 'git commit -m "message"'], ['git push -m "메시지"', 'git push -m "message"'], ['git add -m "메시지"', 'git add -m "message"'], ['git log -m "메시지"', 'git log -m "message"']]
  ),
  question(["수정·스테이징된 파일 등 저장소의 현재 상태를 보여주는 명령은?", "Which command shows the repository's current state, such as edited and staged files?"], ["git status", "git log", "git show", "git init"]),
  question(["지금까지 쌓인 커밋 이력을 보는 명령은?", "Which command shows the commit history so far?"], ["git log", "git status", "git diff", "git add"]),
  question(["커밋 이력을 한 줄씩 짧게 보려면?", "How do you view the commit history as short one-line entries?"], ["git log --oneline", "git status -s", "git diff --stat", "git branch -v"]),
  question(["커밋하기 전, 수정한 내용을 줄 단위로 비교하는 명령은?", "Which command compares your edits line by line before committing?"], ["git diff", "git log", "git status", "git init"]),
  question(["Git이 추적하지 않을 파일을 적어 두는 파일은?", "Which file lists the files Git should not track?"], [".gitignore", ".gitconfig", "README.md", "package.json"]),
  question(
    ["`git add`로 올린 변경이 커밋 전까지 머무는 곳은?", "Where do changes added with `git add` wait until they are committed?"],
    [["스테이징 영역", "The staging area"], ["원격 저장소", "The remote repository"], ["휴지통", "The trash"], ["브랜치 목록", "The branch list"]]
  ),
  question(
    ["커밋(commit)을 가장 잘 설명한 것은?", "Which best describes a commit?"],
    [["변경을 기록한 스냅숏", "A snapshot that records changes"], ["원격에 올리는 동작", "Uploading to the remote"], ["파일을 지우는 명령", "A command that deletes files"], ["브랜치의 다른 이름", "Another name for a branch"]]
  ),
  question(["현재 폴더의 모든 변경을 한 번에 스테이징하려면?", "How do you stage every change in the current folder at once?"], ["git add .", "git commit .", "git push .", "git init ."]),
  question(["`git init`을 하면 폴더 안에 생기는 숨김 폴더는?", "Which hidden folder does `git init` create inside the folder?"], [".git", ".github", ".gitignore", ".config"]),
  question(
    ["다음 중 가장 좋은 커밋 메시지는?", "Which of these is the best commit message?"],
    [["로그인 버튼 오류 수정", "Fix login button error"], "asdf", ["수정함", "changed stuff"], ["몰라", "idk"]]
  ),
  question(
    ["커밋에 남을 작성자 이름을 설정하는 명령은?", "Which command sets the author name recorded on commits?"],
    [['git config user.name "루피"', 'git config user.name "Lupi"'], ['git init user.name "루피"', 'git init user.name "Lupi"'], ['git log user.name "루피"', 'git log user.name "Lupi"'], ['git add user.name "루피"', 'git add user.name "Lupi"']]
  ),
  question(["커밋 하나의 변경 내용을 자세히 보는 명령은?", "Which command shows the details of a single commit?"], ["git show", "git init", "git add", "git clone"]),
  question(["스테이징했지만 아직 커밋하지 않은 변경을 비교하려면?", "How do you compare changes that are staged but not yet committed?"], ["git diff --staged", "git log --staged", "git status --diff", "git show --add"]),
  question(
    ["`git status`의 'Untracked files'가 뜻하는 것은?", "What does 'Untracked files' mean in `git status`?"],
    [["아직 추적하지 않는 새 파일", "New files Git is not tracking yet"], ["삭제된 파일", "Deleted files"], ["원격에만 있는 파일", "Files that exist only on the remote"], ["충돌이 난 파일", "Files with conflicts"]]
  ),
  question(
    ["커밋마다 붙는 고유한 식별자는?", "What is the unique identifier attached to every commit?"],
    [["커밋 해시", "Commit hash"], ["브랜치 이름", "Branch name"], ["태그 번호", "Tag number"], ["파일 경로", "File path"]]
  ),
  question(
    ["변경을 저장소에 기록하는 올바른 순서는?", "What is the right order for recording changes in the repository?"],
    [["add 후 commit", "add, then commit"], ["commit 후 add", "commit, then add"], ["push 후 add", "push, then add"], ["init 후 push", "init, then push"]]
  ),
  question(
    ["파일을 삭제하면서 그 삭제를 스테이징하는 명령은?", "Which command deletes a file and stages the deletion?"],
    [["git rm 파일", "git rm file"], ["git del 파일", "git del file"], ["git drop 파일", "git drop file"], ["git cut 파일", "git cut file"]]
  ),
] satisfies readonly QuizQuestion[];

export default sproutQuiz;
