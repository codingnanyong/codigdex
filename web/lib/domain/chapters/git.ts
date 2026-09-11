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
  name: "Git",
  place: "기록의 들판",
  requires: "tutorial",
  npcName: "루피",
  successLine: "좋아, 기록이 깔끔해졌어! 바로 도감에 등록할게.",
  retryLine: "아직 가지가 엉켜 있어. 이번 단계 명령을 다시 떠올리고 재도전하자!",
  arena: {
    textureKey: "arena-git",
    assetPath: "/assets/wallpapers/git-battle-arena-v1.png",
    ambience: "git-field",
  },
  retryScene: "world-map",
  stages: [
    {
      id: "git-sprout",
      dexNumber: "002",
      level: 1,
      name: "깃새싹",
      classification: "저장소 기초형",
      trait: "변경을 커밋으로 한 칸씩 기록한다",
      description:
        "Git 기초 — git init으로 저장소를 만들고, add로 스테이징한 변경을 commit으로 기록한다. status와 log로 상태와 이력을 확인한다.",
      snippet: 'git init\ngit add .\ngit commit -m "첫 커밋"',
      textureKey: "git-sprout",
      assetPath: `${ART}/git-sprout-lv1.png`,
      briefing: "기록의 들판 입구에 깃새싹이 돋아났어! 저장소를 만들고 첫 커밋을 남기는 법부터 보여 주자.",
      preBattleLine: "깃새싹은 init, add, commit 순서만 알면 금방 잡을 수 있어!",
      quizPool: GIT_STAGE_QUIZZES.sproutQuiz,
    },
    {
      id: "git-branch-merge-twins",
      dexNumber: "003",
      level: 2,
      name: "브랜치 쌍둥이",
      classification: "분기 병합형",
      trait: "한 줄기에서 갈라졌다가 다시 합쳐진다",
      description:
        "브랜치 — 커밋을 가리키는 이름. switch로 갈라져 따로 작업하고, merge로 다시 하나로 합친다.",
      snippet: "git switch -c feature\ngit switch main\ngit merge feature",
      textureKey: "git-branch-merge-twins",
      assetPath: `${ART}/branch-merge-twins-lv2.png`,
      briefing: "브랜치 쌍둥이가 줄기를 둘로 찢어 놨어! 갈라진 가지를 다시 하나로 합쳐 줘.",
      preBattleLine: "쌍둥이는 branch, switch, merge를 헷갈리게 해. 지금 어느 가지에 있는지 떠올려!",
      quizPool: GIT_STAGE_QUIZZES.branchMergeTwinsQuiz,
    },
    {
      id: "git-undo-conflict",
      dexNumber: "004",
      level: 3,
      name: "충돌 되돌이",
      classification: "충돌 복구형",
      trait: "엉킨 변경을 풀고 과거로 되돌린다",
      description:
        "충돌과 되돌리기 — 같은 줄을 다르게 고치면 충돌이 난다. restore·reset·revert로 변경을 되돌리고, stash로 잠시 치워 둔다.",
      snippet: "git merge --abort\ngit restore --staged app.js\ngit revert HEAD",
      textureKey: "git-undo-conflict",
      assetPath: `${ART}/undo-conflict-lv3.png`,
      briefing: "가지끼리 부딪쳐서 충돌 되돌이가 번개를 뿜고 있어! 충돌을 풀고 잘못된 변경을 되돌려 줘.",
      preBattleLine: "충돌 표시를 읽고 reset과 revert의 차이를 기억해. 공유한 커밋은 revert야!",
      quizPool: GIT_STAGE_QUIZZES.undoConflictQuiz,
    },
    {
      id: "git-remote-rebase",
      dexNumber: "005",
      level: 4,
      name: "원격 리베이서",
      classification: "원격 동기화형",
      trait: "먼 저장소와 이력을 맞추고 한 줄로 세운다",
      description:
        "원격과 rebase — clone·fetch·pull·push로 원격 저장소와 동기화하고, rebase로 내 커밋을 최신 이력 위로 옮겨 한 줄로 정리한다.",
      snippet: "git fetch origin\ngit rebase origin/main\ngit push --force-with-lease",
      textureKey: "git-remote-rebase",
      assetPath: `${ART}/remote-rebase-lv4.png`,
      briefing: "원격 리베이서가 멀리 떨어진 가지들을 제멋대로 줄 세우고 있어! 원격과 이력을 맞춰 줘.",
      preBattleLine: "fetch와 pull의 차이, 그리고 공유한 커밋은 rebase하지 않는다는 규칙을 떠올려!",
      quizPool: GIT_STAGE_QUIZZES.remoteRebaseQuiz,
    },
    {
      id: "git-team-workflow-guardian",
      dexNumber: "006",
      level: 5,
      name: "워크플로 수호자",
      classification: "협업 수호형",
      trait: "리뷰와 PR로 팀의 main을 지킨다",
      description:
        "팀 워크플로 — 기능 브랜치에서 작업하고 Pull Request로 리뷰를 받아 병합한다. 보호된 브랜치와 CI가 main을 지킨다.",
      snippet: "git switch -c feat/login\ngit push -u origin feat/login\n# PR 생성, 리뷰, 병합",
      textureKey: "git-team-workflow-guardian",
      assetPath: `${ART}/team-workflow-guardian-lv5.png`,
      briefing: "기록의 들판의 주인, 워크플로 수호자가 나타났어! 팀과 함께 일하는 법을 증명해야 인정받을 수 있어.",
      preBattleLine: "PR, 리뷰, 보호된 브랜치, CI. 혼자가 아니라 팀의 main을 지킨다고 생각해!",
      quizPool: GIT_STAGE_QUIZZES.teamWorkflowGuardianQuiz,
    },
  ],
};
