import { text } from "@/lib/i18n/locale";
import type { ChapterDefinition } from "./types";
import { GIT_STAGE_QUIZZES } from "./quizzes/git";

const ART = "/assets/monsters/ch01.git";

/**
 * Five stages, each its own dex entry and topic, climbing Lv.1 to Lv.5.
 * In every pool the right answer is authored first; drawQuizQuestions
 * shuffles the choice order each time a battle draws a question.
 */
export const GIT_CHAPTER: ChapterDefinition = {
  id: "git",
  label: "CH.01",
  name: text("Git", "Git"),
  place: text("기록의 들판", "Field of Records"),
  requires: "tutorial",
  npcName: text("루피", "Lupi"),
  successLine: text("좋아, 기록이 깔끔해졌어! 바로 도감에 등록할게.", "Great, the history is clean again! I'll register it in your dex."),
  retryLine: text(
    "아직 가지가 엉켜 있어. 이번 단계 명령을 다시 떠올리고 재도전하자!",
    "The branches are still tangled. Recall this stage's commands and try again!"
  ),
  arena: {
    textureKey: "arena-git",
    assetPath: "/assets/wallpapers/git-battle-arena-v1.png",
    ambience: "git-field",
  },
  retryScene: "world-map",
  stages: [
    {
      id: "git-sprout",
      dexNumber: "001",
      level: 1,
      name: text("깃새싹", "Git Sprout"),
      classification: text("저장소 기초형", "Repository basics type"),
      trait: text("변경을 커밋으로 한 칸씩 기록한다", "Records changes one commit at a time"),
      description: text(
        "Git 기초 — git init으로 저장소를 만들고, add로 스테이징한 변경을 commit으로 기록한다. status와 log로 상태와 이력을 확인한다.",
        "Git basics — git init creates a repository, add stages changes, and commit records them. status and log show the current state and history."
      ),
      snippet: text('git init\ngit add .\ngit commit -m "첫 커밋"', 'git init\ngit add .\ngit commit -m "First commit"'),
      textureKey: "git-sprout",
      assetPath: `${ART}/git-sprout-lv1.png`,
      briefing: text(
        "기록의 들판 입구에 깃새싹이 돋아났어! 저장소를 만들고 첫 커밋을 남기는 법부터 보여 주자.",
        "A Git Sprout popped up at the entrance to the Field of Records! Show it how to create a repository and make a first commit."
      ),
      preBattleLine: text(
        "깃새싹은 init, add, commit 순서만 알면 금방 잡을 수 있어!",
        "Know the order init, add, commit, and the Git Sprout is an easy catch!"
      ),
      quizPool: GIT_STAGE_QUIZZES.sproutQuiz,
    },
    {
      id: "git-branch-merge-twins",
      dexNumber: "002",
      level: 2,
      name: text("브랜치 쌍둥이", "Branch Twins"),
      classification: text("분기 병합형", "Branch and merge type"),
      trait: text("한 줄기에서 갈라졌다가 다시 합쳐진다", "Splits from one stem and joins back together"),
      description: text(
        "브랜치 — 커밋을 가리키는 이름. switch로 갈라져 따로 작업하고, merge로 다시 하나로 합친다.",
        "Branches — names that point at commits. switch splits off to work separately, and merge brings the work back together."
      ),
      snippet: text("git switch -c feature\ngit switch main\ngit merge feature", "git switch -c feature\ngit switch main\ngit merge feature"),
      textureKey: "git-branch-merge-twins",
      assetPath: `${ART}/branch-merge-twins-lv2.png`,
      briefing: text(
        "브랜치 쌍둥이가 줄기를 둘로 찢어 놨어! 갈라진 가지를 다시 하나로 합쳐 줘.",
        "The Branch Twins tore the stem in two! Merge the split branches back into one."
      ),
      preBattleLine: text(
        "쌍둥이는 branch, switch, merge를 헷갈리게 해. 지금 어느 가지에 있는지 떠올려!",
        "The twins love to mix up branch, switch and merge. Keep track of which branch you're on!"
      ),
      quizPool: GIT_STAGE_QUIZZES.branchMergeTwinsQuiz,
    },
    {
      id: "git-undo-conflict",
      dexNumber: "003",
      level: 3,
      name: text("충돌 되돌이", "Conflict Rewinder"),
      classification: text("충돌 복구형", "Conflict recovery type"),
      trait: text("엉킨 변경을 풀고 과거로 되돌린다", "Untangles changes and rewinds to the past"),
      description: text(
        "충돌과 되돌리기 — 같은 줄을 다르게 고치면 충돌이 난다. restore·reset·revert로 변경을 되돌리고, stash로 잠시 치워 둔다.",
        "Conflicts and undoing — editing the same line two ways causes a conflict. restore, reset and revert undo changes, and stash tucks them away for later."
      ),
      snippet: text(
        "git merge --abort\ngit restore --staged app.js\ngit revert HEAD",
        "git merge --abort\ngit restore --staged app.js\ngit revert HEAD"
      ),
      textureKey: "git-undo-conflict",
      assetPath: `${ART}/undo-conflict-lv3.png`,
      briefing: text(
        "가지끼리 부딪쳐서 충돌 되돌이가 번개를 뿜고 있어! 충돌을 풀고 잘못된 변경을 되돌려 줘.",
        "The branches collided and the Conflict Rewinder is throwing lightning! Resolve the conflict and undo the bad changes."
      ),
      preBattleLine: text(
        "충돌 표시를 읽고 reset과 revert의 차이를 기억해. 공유한 커밋은 revert야!",
        "Read the conflict markers and remember reset versus revert. Shared commits get revert!"
      ),
      quizPool: GIT_STAGE_QUIZZES.undoConflictQuiz,
    },
    {
      id: "git-remote-rebase",
      dexNumber: "004",
      level: 4,
      name: text("원격 리베이서", "Remote Rebaser"),
      classification: text("원격 동기화형", "Remote sync type"),
      trait: text("먼 저장소와 이력을 맞추고 한 줄로 세운다", "Syncs history with distant repositories and lines it up"),
      description: text(
        "원격과 rebase — clone·fetch·pull·push로 원격 저장소와 동기화하고, rebase로 내 커밋을 최신 이력 위로 옮겨 한 줄로 정리한다.",
        "Remotes and rebase — clone, fetch, pull and push sync with a remote repository, and rebase moves your commits on top of the latest history in one straight line."
      ),
      snippet: text(
        "git fetch origin\ngit rebase origin/main\ngit push --force-with-lease",
        "git fetch origin\ngit rebase origin/main\ngit push --force-with-lease"
      ),
      textureKey: "git-remote-rebase",
      assetPath: `${ART}/remote-rebase-lv4.png`,
      briefing: text(
        "원격 리베이서가 멀리 떨어진 가지들을 제멋대로 줄 세우고 있어! 원격과 이력을 맞춰 줘.",
        "The Remote Rebaser is lining up faraway branches however it likes! Sync the history with the remote."
      ),
      preBattleLine: text(
        "fetch와 pull의 차이, 그리고 공유한 커밋은 rebase하지 않는다는 규칙을 떠올려!",
        "Remember fetch versus pull, and the rule: never rebase commits you've already shared!"
      ),
      quizPool: GIT_STAGE_QUIZZES.remoteRebaseQuiz,
    },
    {
      id: "git-team-workflow-guardian",
      dexNumber: "005",
      level: 5,
      name: text("워크플로 수호자", "Workflow Guardian"),
      classification: text("협업 수호형", "Collaboration guardian type"),
      trait: text("리뷰와 PR로 팀의 main을 지킨다", "Guards the team's main with reviews and PRs"),
      description: text(
        "팀 워크플로 — 기능 브랜치에서 작업하고 Pull Request로 리뷰를 받아 병합한다. 보호된 브랜치와 CI가 main을 지킨다.",
        "Team workflow — work on a feature branch, get it reviewed through a Pull Request, then merge. Protected branches and CI guard main."
      ),
      snippet: text(
        "git switch -c feat/login\ngit push -u origin feat/login\n# PR 생성, 리뷰, 병합",
        "git switch -c feat/login\ngit push -u origin feat/login\n# open PR, review, merge"
      ),
      textureKey: "git-team-workflow-guardian",
      assetPath: `${ART}/team-workflow-guardian-lv5.png`,
      briefing: text(
        "기록의 들판의 주인, 워크플로 수호자가 나타났어! 팀과 함께 일하는 법을 증명해야 인정받을 수 있어.",
        "The master of the Field of Records, the Workflow Guardian, has appeared! Prove you can work with a team to earn its respect."
      ),
      preBattleLine: text(
        "PR, 리뷰, 보호된 브랜치, CI. 혼자가 아니라 팀의 main을 지킨다고 생각해!",
        "PRs, reviews, protected branches, CI. Think about guarding the team's main, not just your own!"
      ),
      quizPool: GIT_STAGE_QUIZZES.teamWorkflowGuardianQuiz,
    },
  ],
};
