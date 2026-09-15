import type { QuizQuestion } from "../../types";
import { question } from "../question";

const remoteRebaseQuiz = [
  question(["원격 저장소를 통째로 내 컴퓨터에 복제하는 명령은?", "Which command copies an entire remote repository to your computer?"], ["git clone", "git copy", "git fetch", "git init"]),
  question(["내 로컬 커밋을 원격 저장소에 올리는 명령은?", "Which command uploads your local commits to the remote repository?"], ["git push", "git pull", "git fetch", "git clone"]),
  question(["원격의 새 커밋을 받아 현재 브랜치에 병합까지 하는 명령은?", "Which command downloads new remote commits and merges them into the current branch?"], ["git pull", "git fetch", "git push", "git clone"]),
  question(
    ["`git fetch`에 대한 설명으로 옳은 것은?", "Which statement about `git fetch` is correct?"],
    [["원격 변경을 가져오기만 한다", "It only downloads remote changes"], ["가져와서 병합까지 한다", "It downloads and also merges"], ["로컬 커밋을 원격에 올린다", "It uploads local commits to the remote"], ["원격 브랜치를 삭제한다", "It deletes remote branches"]]
  ),
  question(["clone한 원격 저장소에 붙는 기본 이름은?", "What default name is given to the remote you cloned from?"], ["origin", "main", "master", "remote"]),
  question(["연결된 원격 저장소의 주소를 확인하는 명령은?", "Which command shows the addresses of connected remotes?"], ["git remote -v", "git remote --url", "git origin", "git show remote"]),
  question(
    ["로컬 저장소에 원격 origin을 새로 연결하려면?", "How do you connect a new remote named origin to a local repository?"],
    [["git remote add origin 주소", "git remote add origin url"], ["git clone origin 주소", "git clone origin url"], ["git push origin 주소", "git push origin url"], ["git init origin 주소", "git init origin url"]]
  ),
  question(
    ["처음 push할 때 `-u` 옵션을 붙이면?", "What does adding `-u` on your first push do?"],
    [["로컬과 원격 브랜치가 연결된다", "It links the local and remote branches"], ["강제로 덮어쓴다", "It force-overwrites"], ["커밋이 삭제된다", "It deletes commits"], ["원격이 초기화된다", "It resets the remote"]]
  ),
  question(
    ["`origin/main`이 뜻하는 것은?", "What does `origin/main` mean?"],
    [["마지막으로 받아 온 원격 main", "The remote main as of your last fetch"], ["내 로컬 main", "Your local main"], ["새로 만든 브랜치", "A newly created branch"], ["원격 서버 주소", "The remote server address"]]
  ),
  question(
    ["내 push가 거절(rejected)되는 흔한 이유는?", "What is a common reason your push gets rejected?"],
    [["원격에 내가 없는 커밋이 있어서", "The remote has commits you don't have"], ["파일이 너무 작아서", "The files are too small"], ["브랜치 이름이 짧아서", "The branch name is too short"], ["메시지가 한글이라서", "The message isn't in English"]]
  ),
  question(
    ["feature 브랜치에서 `git rebase main`을 실행하면?", "What happens when you run `git rebase main` on the feature branch?"],
    [["feature 커밋을 main 뒤로 옮긴다", "feature's commits move on top of main"], ["main을 feature에 병합한다", "main is merged into feature"], ["feature를 삭제한다", "feature is deleted"], ["main을 원격에 올린다", "main is pushed to the remote"]]
  ),
  question(
    ["merge 대신 rebase를 쓰면 좋은 점은?", "What is a benefit of using rebase instead of merge?"],
    [["이력이 한 줄로 깔끔해진다", "The history stays in one clean line"], ["충돌이 절대 안 난다", "Conflicts never happen"], ["커밋 수가 늘어난다", "You get more commits"], ["원격이 필요 없어진다", "You no longer need a remote"]]
  ),
  question(
    ["이미 원격에 공유한 커밋을 rebase하면 안 되는 이유는?", "Why shouldn't you rebase commits you've already shared on the remote?"],
    [["다른 사람의 이력과 어긋나서", "It diverges from other people's history"], ["파일이 사라져서", "Files disappear"], ["속도가 느려서", "It's slow"], ["브랜치가 잠겨서", "The branch gets locked"]]
  ),
  question(["rebase 도중 충돌을 고친 뒤 계속 진행하는 명령은?", "After fixing a conflict mid-rebase, which command continues it?"], ["git rebase --continue", "git rebase --next", "git merge --continue", "git commit --rebase"]),
  question(["진행 중인 rebase를 취소하고 원래대로 돌리려면?", "How do you cancel a rebase in progress and restore the original state?"], ["git rebase --abort", "git rebase --undo", "git reset --rebase", "git rebase --stop"]),
  question(["여러 커밋을 하나로 합치거나 순서를 바꿀 때 쓰는 명령은?", "Which command lets you squash several commits or reorder them?"], ["git rebase -i", "git merge -i", "git push -i", "git fetch -i"]),
  question(["rebase 후 원격에 올릴 때 비교적 안전한 강제 push 옵션은?", "After a rebase, which force-push option is the safer choice?"], ["--force-with-lease", "--force-all", "--no-verify", "--dry-run"]),
  question(
    ["`git pull --rebase`가 하는 일은?", "What does `git pull --rebase` do?"],
    [["원격 변경 위로 내 커밋을 다시 쌓는다", "It replays your commits on top of the remote changes"], ["원격 커밋을 삭제한다", "It deletes remote commits"], ["병합 커밋을 꼭 만든다", "It always creates a merge commit"], ["로컬 브랜치를 지운다", "It deletes the local branch"]]
  ),
  question(["원격에서 삭제된 브랜치 정보를 로컬에서도 정리하려면?", "How do you clean up local references to branches deleted on the remote?"], ["git fetch --prune", "git pull --clean", "git push --delete-all", "git remote --clear"]),
  question(["원격 저장소에 feature 브랜치를 올리는 명령은?", "Which command pushes the feature branch to the remote repository?"], ["git push origin feature", "git pull origin feature", "git fetch feature origin", "git clone feature"]),
] satisfies readonly QuizQuestion[];

export default remoteRebaseQuiz;
