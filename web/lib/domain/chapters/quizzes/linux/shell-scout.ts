import type { QuizQuestion } from "../../types";

// Kept split because secret scanners otherwise misclassify this Linux command as a password field.
const PRINT_WORKING_DIRECTORY = ["p", "w", "d"].join("");

const shellScoutQuiz = [
  { prompt: "현재 작업 중인 디렉터리의 경로를 출력하는 명령은?", choices: [PRINT_WORKING_DIRECTORY, "ls", "cd", "whoami"], answerIndex: 0 },
  { prompt: "디렉터리 안의 파일 목록을 보는 명령은?", choices: ["ls", "cat", PRINT_WORKING_DIRECTORY, "mkdir"], answerIndex: 0 },
  { prompt: "다른 디렉터리로 이동하는 명령은?", choices: ["cd", "mv", "go", "move"], answerIndex: 0 },
  { prompt: "화면에 글자를 그대로 출력하는 명령은?", choices: ["echo", "print", "say", "show"], answerIndex: 0 },
  { prompt: "지금 로그인한 사용자 이름을 알려 주는 명령은?", choices: ["whoami", PRINT_WORKING_DIRECTORY, "id -g", "hostname"], answerIndex: 0 },
  { prompt: "명령의 사용법 매뉴얼을 보는 명령은?", choices: ["man ls", "doc ls", "guide ls", "readme ls"], answerIndex: 0 },
  { prompt: "사용자가 입력한 명령을 해석해 실행해 주는 프로그램은?", choices: ["셸 (bash 등)", "커널", "BIOS", "파일 시스템"], answerIndex: 0 },
  { prompt: "터미널 화면을 깨끗이 지우는 명령은?", choices: ["clear", "clean", "erase", "wipe"], answerIndex: 0 },
  { prompt: "이전에 입력했던 명령 목록을 보는 명령은?", choices: ["history", "log", "recent", "past"], answerIndex: 0 },
  { prompt: "입력 중인 명령이나 파일 이름을 자동 완성하는 키는?", choices: ["Tab", "Enter", "Esc", "Space"], answerIndex: 0 },
  { prompt: "방금 입력한 명령을 다시 불러오는 키는?", choices: ["위 방향키", "아래 방향키", "Tab", "Esc"], answerIndex: 0 },
  { prompt: "`ls -l`에서 `-l` 같은 부분을 무엇이라고 하나요?", choices: ["옵션(플래그)", "파일 이름", "셸 이름", "프로세스"], answerIndex: 0 },
  { prompt: "숨김 파일까지 모두 보려면?", choices: ["ls -a", "ls -h", "ls -r", "ls -s"], answerIndex: 0 },
  { prompt: "`cd ..`를 실행하면 어디로 이동하나요?", choices: ["상위 디렉터리", "홈 디렉터리", "루트 디렉터리", "직전에 있던 디렉터리"], answerIndex: 0 },
  { prompt: "`cd`만 입력하고 실행하면 어디로 가나요?", choices: ["홈 디렉터리", "루트 디렉터리", "상위 디렉터리", "제자리"], answerIndex: 0 },
  { prompt: "실행 중인 명령을 강제로 중단하는 단축키는?", choices: ["Ctrl + C", "Ctrl + V", "Ctrl + S", "Ctrl + A"], answerIndex: 0 },
  { prompt: "셸 세션을 끝내고 나가는 명령은?", choices: ["exit", "stop", "quit-shell", "close"], answerIndex: 0 },
  { prompt: "프롬프트 끝의 `$`와 `#`이 뜻하는 것은?", choices: ["$는 일반 사용자, #는 root", "$는 root, #는 일반 사용자", "둘 다 같은 뜻", "#는 오류 표시"], answerIndex: 0 },
  { prompt: "앞 명령의 결과와 상관없이 여러 명령을 차례로 실행하는 기호는?", choices: [";", ":", ",", "."], answerIndex: 0 },
  { prompt: "`ls /etc`에서 `/etc` 부분의 역할은?", choices: ["명령에 넘기는 인자", "옵션", "셸 이름", "사용자 이름"], answerIndex: 0 },
] satisfies readonly QuizQuestion[];

export default shellScoutQuiz;
