import type { ChapterDefinition } from "./types";
import { LINUX_STAGE_QUIZZES } from "./quizzes/linux";

const ART = "/assets/monsters/ch02.linux";

/**
 * Five stages from the shell down to the kernel, each its own dex entry and
 * topic, climbing Lv.1 to Lv.5. In every pool the right answer is authored
 * first; drawQuizQuestions shuffles the choice order each time it draws.
 */
export const LINUX_CHAPTER: ChapterDefinition = {
  id: "linux",
  label: "CH.02",
  name: "Linux",
  place: "셸 동굴",
  requires: "git",
  npcName: "루피",
  successLine: "명령 한 줄 한 줄이 정확했어! 바로 도감에 등록할게.",
  retryLine: "명령이 조금 어긋났어. 이번 단계 명령을 다시 짚어 보고 재도전하자!",
  arena: {
    textureKey: "arena-linux",
    assetPath: "/assets/wallpapers/linux-battle-arena-v1.png",
    ambience: "linux-cave",
  },
  retryScene: "world-map",
  stages: [
    {
      id: "linux-shell-scout",
      dexNumber: "007",
      level: 1,
      name: "셸 탐험가",
      classification: "셸 입문형",
      trait: "터미널 한 줄로 컴퓨터에 말을 건다",
      description:
        "셸 기초 — 터미널에 명령을 입력하면 셸이 해석해 실행한다. pwd·ls·cd로 현재 위치를 확인하고 이동한다.",
      snippet: "pwd\nls -a\ncd ~/project",
      textureKey: "linux-shell-scout",
      assetPath: `${ART}/shell-scout-lv1.png`,
      briefing: "셸 동굴 입구에서 셸 탐험가가 휴대 터미널을 두드리고 있어! 기본 명령으로 말을 걸어 보자.",
      preBattleLine: "셸 탐험가는 pwd, ls, cd만 알아도 따라잡을 수 있어!",
      quizPool: LINUX_STAGE_QUIZZES.shellScoutQuiz,
    },
    {
      id: "linux-path-file-forager",
      dexNumber: "008",
      level: 2,
      name: "경로 채집가",
      classification: "파일 탐색형",
      trait: "경로 지도를 따라 파일을 모으고 옮긴다",
      description:
        "경로와 파일 — /에서 시작하는 절대 경로와 현재 위치 기준의 상대 경로로 파일을 찾고, mkdir·cp·mv·rm으로 다룬다.",
      snippet: 'mkdir notes\ncp todo.txt notes/\nfind . -name "*.log"',
      textureKey: "linux-path-file-forager",
      assetPath: `${ART}/path-file-forager-lv2.png`,
      briefing: "경로 채집가가 동굴 곳곳의 파일을 몰래 옮기고 있어! 경로를 읽고 파일을 제자리로 돌려놔 줘.",
      preBattleLine: "절대 경로와 상대 경로, 그리고 cp, mv, rm의 차이를 떠올려!",
      quizPool: LINUX_STAGE_QUIZZES.pathFileForagerQuiz,
    },
    {
      id: "linux-permission-guard",
      dexNumber: "009",
      level: 3,
      name: "권한 수호병",
      classification: "접근 통제형",
      trait: "열쇠와 방패로 rwx 권한을 지킨다",
      description:
        "권한 — 파일마다 소유자·그룹·기타 사용자의 읽기(r)·쓰기(w)·실행(x) 권한이 있다. chmod·chown으로 바꾸고 sudo로 관리자 권한을 빌린다.",
      snippet: "ls -l run.sh\nchmod 755 run.sh\nsudo chown lupi run.sh",
      textureKey: "linux-permission-guard",
      assetPath: `${ART}/permission-guard-lv3.png`,
      briefing: "권한 수호병이 열쇠를 쥐고 길을 막았어! 누가 무엇을 할 수 있는지 증명해야 지나갈 수 있어.",
      preBattleLine: "r=4, w=2, x=1. 소유자, 그룹, 기타 순서를 잊지 마!",
      quizPool: LINUX_STAGE_QUIZZES.permissionGuardQuiz,
    },
    {
      id: "linux-pipe-process-engineer",
      dexNumber: "010",
      level: 4,
      name: "파이프 엔지니어",
      classification: "흐름 제어형",
      trait: "명령의 출력을 파이프로 이어 프로세스를 부린다",
      description:
        "파이프와 프로세스 — |로 명령의 출력을 다음 명령에 넘기고 >·>>로 파일에 저장한다. ps·top으로 프로세스를 보고 kill로 멈춘다.",
      snippet: "ps aux | grep node\nkill 1234\nnpm run dev > dev.log &",
      textureKey: "linux-pipe-process-engineer",
      assetPath: `${ART}/pipe-process-engineer-lv4.png`,
      briefing: "파이프 엔지니어가 뒤엉킨 파이프로 프로세스를 폭주시키고 있어! 출력의 흐름을 바로잡아 줘.",
      preBattleLine: "파이프, 리다이렉션, 백그라운드 실행. 출력이 어디로 흐르는지 따라가 봐!",
      quizPool: LINUX_STAGE_QUIZZES.pipeProcessEngineerQuiz,
    },
    {
      id: "linux-kernel-guardian",
      dexNumber: "011",
      level: 5,
      name: "커널 수호자",
      classification: "운영체제 핵심형",
      trait: "하드웨어와 프로세스 사이의 모든 요청을 중재한다",
      description:
        "커널 — 하드웨어를 관리하고 프로세스에 CPU·메모리를 나눠 주는 운영체제의 핵심. 프로그램은 시스템 콜로 커널에 일을 요청한다.",
      snippet: "uname -r\nfree -h\nsystemctl status nginx",
      textureKey: "linux-kernel-guardian",
      assetPath: `${ART}/kernel-guardian-lv5.png`,
      briefing: "셸 동굴의 가장 깊은 곳에서 커널 수호자가 깨어났어! 운영체제의 핵심을 이해했는지 보여 줘.",
      preBattleLine: "커널, 시스템 콜, 스케줄러, 부팅. 셸 너머의 세계를 떠올려!",
      quizPool: LINUX_STAGE_QUIZZES.kernelGuardianQuiz,
    },
  ],
};
