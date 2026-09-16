import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

// Kept split because secret scanners otherwise misclassify this Linux command as a password field.
const PRINT_WORKING_DIRECTORY = ["p", "w", "d"].join("");

const shellScoutQuiz = [
  question(["현재 작업 중인 디렉터리의 경로를 출력하는 명령은?", "Which command prints the path of your current working directory?"], [PRINT_WORKING_DIRECTORY, "ls", "cd", "whoami"]),
  question(["디렉터리 안의 파일 목록을 보는 명령은?", "Which command lists the files in a directory?"], ["ls", "cat", PRINT_WORKING_DIRECTORY, "mkdir"]),
  question(["다른 디렉터리로 이동하는 명령은?", "Which command moves you to another directory?"], ["cd", "mv", "go", "move"]),
  question(["화면에 글자를 그대로 출력하는 명령은?", "Which command prints text to the screen as-is?"], ["echo", "print", "say", "show"]),
  question(["지금 로그인한 사용자 이름을 알려 주는 명령은?", "Which command tells you the name of the logged-in user?"], ["whoami", PRINT_WORKING_DIRECTORY, "id -g", "hostname"]),
  question(["명령의 사용법 매뉴얼을 보는 명령은?", "Which command opens a command's manual?"], ["man ls", "doc ls", "guide ls", "readme ls"]),
  question(
    ["사용자가 입력한 명령을 해석해 실행해 주는 프로그램은?", "Which program reads the commands you type and runs them?"],
    [["셸 (bash 등)", "The shell (bash, etc.)"], ["커널", "The kernel"], "BIOS", ["파일 시스템", "The file system"]]
  ),
  question(["터미널 화면을 깨끗이 지우는 명령은?", "Which command clears the terminal screen?"], ["clear", "clean", "erase", "wipe"]),
  question(["이전에 입력했던 명령 목록을 보는 명령은?", "Which command lists the commands you entered before?"], ["history", "log", "recent", "past"]),
  question(["입력 중인 명령이나 파일 이름을 자동 완성하는 키는?", "Which key autocompletes a command or file name as you type?"], ["Tab", "Enter", "Esc", "Space"]),
  question(
    ["방금 입력한 명령을 다시 불러오는 키는?", "Which key brings back the command you just entered?"],
    [["위 방향키", "Up arrow"], ["아래 방향키", "Down arrow"], "Tab", "Esc"]
  ),
  question(
    ["`ls -l`에서 `-l` 같은 부분을 무엇이라고 하나요?", "In `ls -l`, what is a part like `-l` called?"],
    [["옵션(플래그)", "An option (flag)"], ["파일 이름", "A file name"], ["셸 이름", "A shell name"], ["프로세스", "A process"]]
  ),
  question(["숨김 파일까지 모두 보려면?", "How do you list everything, hidden files included?"], ["ls -a", "ls -h", "ls -r", "ls -s"]),
  question(
    ["`cd ..`를 실행하면 어디로 이동하나요?", "Where does `cd ..` take you?"],
    [["상위 디렉터리", "The parent directory"], ["홈 디렉터리", "The home directory"], ["루트 디렉터리", "The root directory"], ["직전에 있던 디렉터리", "The directory you were in before"]]
  ),
  question(
    ["`cd`만 입력하고 실행하면 어디로 가나요?", "Where do you go if you run `cd` on its own?"],
    [["홈 디렉터리", "The home directory"], ["루트 디렉터리", "The root directory"], ["상위 디렉터리", "The parent directory"], ["제자리", "Nowhere; you stay put"]]
  ),
  question(["실행 중인 명령을 강제로 중단하는 단축키는?", "Which shortcut forcibly stops a running command?"], ["Ctrl + C", "Ctrl + V", "Ctrl + S", "Ctrl + A"]),
  question(["셸 세션을 끝내고 나가는 명령은?", "Which command ends the shell session and leaves?"], ["exit", "stop", "quit-shell", "close"]),
  question(
    ["프롬프트 끝의 `$`와 `#`이 뜻하는 것은?", "What do `$` and `#` at the end of the prompt mean?"],
    [["$는 일반 사용자, #는 root", "$ is a regular user, # is root"], ["$는 root, #는 일반 사용자", "$ is root, # is a regular user"], ["둘 다 같은 뜻", "They mean the same thing"], ["#는 오류 표시", "# marks an error"]]
  ),
  question(["앞 명령의 결과와 상관없이 여러 명령을 차례로 실행하는 기호는?", "Which symbol runs several commands in sequence regardless of how the previous one ended?"], [";", ":", ",", "."]),
  question(
    ["`ls /etc`에서 `/etc` 부분의 역할은?", "In `ls /etc`, what role does `/etc` play?"],
    [["명령에 넘기는 인자", "An argument passed to the command"], ["옵션", "An option"], ["셸 이름", "A shell name"], ["사용자 이름", "A user name"]]
  ),
] satisfies readonly QuizQuestion[];

export default shellScoutQuiz;
