import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const teamWorkflowGuardianQuiz = [
  question(["내 브랜치 변경을 main에 합쳐 달라고 리뷰를 요청하는 것은?", "What do you open to ask for review before your branch is merged into main?"], ["Pull Request", "git stash", "Fork", "Tag"]),
  question(
    ["Pull Request에서 동료가 코드를 읽고 의견을 남기는 과정은?", "In a Pull Request, what is it called when teammates read the code and leave feedback?"],
    [["코드 리뷰", "Code review"], ["리베이스", "Rebase"], ["체크아웃", "Checkout"], ["클론", "Clone"]]
  ),
  question(
    ["기능마다 브랜치를 따서 작업하고 PR로 합치는 방식은?", "What is the workflow of branching per feature and merging through PRs?"],
    [["feature 브랜치 워크플로", "Feature branch workflow"], ["단일 파일 워크플로", "Single-file workflow"], ["원격 없는 워크플로", "No-remote workflow"], ["태그 워크플로", "Tag workflow"]]
  ),
  question(["남의 저장소를 내 계정으로 복사해 기여를 시작하는 것은?", "What copies someone else's repository to your account so you can start contributing?"], ["Fork", "Clone", "Merge", "Stash"]),
  question(
    ["main에 직접 push하지 못하게 막는 저장소 설정은?", "Which repository setting blocks pushing directly to main?"],
    [["보호된 브랜치", "Protected branch"], ["공개 저장소", "Public repository"], ["기본 브랜치 이름", "Default branch name"], ["원격 이름", "Remote name"]]
  ),
  question(["PR을 합칠 때 여러 커밋을 하나로 묶어 main에 넣는 방식은?", "Which PR merge method combines several commits into one on main?"], ["Squash and merge", "Rebase and merge", "Fast-forward only", "Cherry-pick"]),
  question(["PR에 커밋을 올릴 때마다 테스트와 빌드를 자동으로 돌리는 것은?", "What automatically runs tests and builds every time you push to a PR?"], ["CI", "Fork", "Stash", "Blame"]),
  question(
    ["PR 본문에 `Closes #12`를 쓰면 병합 때 일어나는 일은?", "What happens on merge if a PR description says `Closes #12`?"],
    [["12번 이슈가 자동으로 닫힌다", "Issue #12 is closed automatically"], ["12번 PR이 삭제된다", "PR #12 is deleted"], ["커밋 12개가 합쳐진다", "12 commits are combined"], ["브랜치 12개가 생긴다", "12 branches are created"]]
  ),
  question(
    ["좋은 PR에 가장 가까운 것은?", "Which is closest to a good PR?"],
    [["한 가지 목적의 작은 변경", "A small change with one purpose"], ["한 달치 작업 전부", "A whole month of work"], ["여러 기능을 한꺼번에", "Several features at once"], ["리뷰 없이 바로 병합", "Merged right away without review"]]
  ),
  question(["릴리스 버전 `v1.0.0`을 특정 커밋에 표시하는 명령은?", "Which command marks a specific commit as release `v1.0.0`?"], ["git tag v1.0.0", "git branch v1.0.0", "git stash v1.0.0", "git label v1.0.0"]),
  question(["다른 브랜치의 커밋 하나만 골라 현재 브랜치에 가져오는 명령은?", "Which command picks a single commit from another branch into the current one?"], ["git cherry-pick", "git pick", "git fetch-one", "git merge --one"]),
  question(["파일의 각 줄을 누가 마지막으로 고쳤는지 보는 명령은?", "Which command shows who last changed each line of a file?"], ["git blame", "git log --who", "git show --line", "git status -l"]),
  question(
    ["비밀번호가 담긴 `.env` 파일을 커밋하지 않으려면?", "How do you keep a `.env` file with passwords out of your commits?"],
    [[".gitignore에 추가한다", "Add it to .gitignore"], ["커밋 메시지에 적는다", "Write it in the commit message"], ["README에 적는다", "Write it in the README"], ["브랜치 이름으로 쓴다", "Use it as a branch name"]]
  ),
  question(
    ["실수로 비밀키를 push했을 때 가장 먼저 할 일은?", "If you accidentally push a secret key, what should you do first?"],
    [["그 키를 폐기하고 새로 발급한다", "Revoke the key and issue a new one"], ["다음 커밋에서 파일만 지운다", "Just delete the file in the next commit"], ["커밋 메시지를 고친다", "Edit the commit message"], ["저장소 이름을 바꾼다", "Rename the repository"]]
  ),
  question(
    ["리뷰어가 수정을 요청(Request changes)하면 작성자가 할 일은?", "When a reviewer requests changes, what should the author do?"],
    [["반영해서 같은 브랜치에 커밋", "Address them and commit to the same branch"], ["PR을 닫고 새로 만든다", "Close the PR and open a new one"], ["main에 직접 push한다", "Push directly to main"], ["리뷰어를 PR에서 뺀다", "Remove the reviewer from the PR"]]
  ),
  question(["`feat: 로그인 추가`, `fix: 버튼 오류` 같은 커밋 메시지 규칙은?", "Which commit message convention uses messages like `feat: add login` and `fix: button error`?"], ["Conventional Commits", "Git Flow", "Semantic Tag", "Fast-forward"]),
  question(["main(배포)과 develop(개발)을 나눠 운영하는 브랜치 전략은?", "Which branching strategy keeps main (release) and develop (development) separate?"], ["Git Flow", "Trunk Stack", "Fork Merge", "Stash Flow"]),
  question(
    ["PR 병합 전에 main의 최신 변경을 내 브랜치에 반영하는 이유는?", "Why bring main's latest changes into your branch before merging a PR?"],
    [["충돌을 미리 확인하고 풀려고", "To find and resolve conflicts early"], ["커밋 수를 줄이려고", "To reduce the number of commits"], ["원격을 삭제하려고", "To delete the remote"], ["리뷰를 건너뛰려고", "To skip review"]]
  ),
  question(
    ["병합이 끝난 PR의 feature 브랜치는 보통 어떻게 하나요?", "What do you usually do with a feature branch after its PR is merged?"],
    [["삭제해 정리한다", "Delete it to tidy up"], ["main으로 이름을 바꾼다", "Rename it to main"], ["영원히 남겨야 한다", "Keep it forever"], ["다시 fork한다", "Fork it again"]]
  ),
  question(
    ["동료의 PR을 내 컴퓨터에서 직접 실행해 보려면 먼저?", "To run a teammate's PR on your own computer, what do you do first?"],
    [["그 브랜치를 fetch해 switch한다", "Fetch that branch and switch to it"], ["main에 바로 merge한다", "Merge it straight into main"], ["저장소를 새로 init한다", "Run init on a new repository"], ["stash를 비운다", "Clear the stash"]]
  ),
] satisfies readonly QuizQuestion[];

export default teamWorkflowGuardianQuiz;
