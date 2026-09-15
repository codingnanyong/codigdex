import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const pathFileForagerQuiz = [
  question(["리눅스 파일 시스템의 최상위 디렉터리는?", "What is the top-level directory of the Linux file system?"], ["/", "~", "./", "C:\\"]),
  question(
    ["`~` 기호가 가리키는 곳은?", "Where does the `~` symbol point?"],
    [["현재 사용자의 홈 디렉터리", "The current user's home directory"], ["루트 디렉터리", "The root directory"], ["현재 디렉터리", "The current directory"], ["임시 디렉터리", "The temp directory"]]
  ),
  question(["새 디렉터리를 만드는 명령은?", "Which command creates a new directory?"], ["mkdir", "touch", "rm", "cd"]),
  question(["빈 파일을 새로 만드는 명령은?", "Which command creates a new empty file?"], ["touch", "mkdir", "cat", "ls"]),
  question(["파일 내용을 터미널에 출력하는 명령은?", "Which command prints a file's contents to the terminal?"], ["cat", "ls", "cp", "mkdir"]),
  question(["파일을 복사하는 명령은?", "Which command copies a file?"], ["cp", "mv", "rm", "ln"]),
  question(["파일을 다른 곳으로 옮기거나 이름을 바꾸는 명령은?", "Which command moves or renames a file?"], ["mv", "cp", "rm", "touch"]),
  question(["파일을 삭제하는 명령은?", "Which command deletes a file?"], ["rm", "del", "erase", "drop"]),
  question(
    ["`rm -r 폴더`에서 `-r`의 의미는?", "What does `-r` mean in `rm -r folder`?"],
    [["안의 내용까지 재귀적으로", "Recursively, including everything inside"], ["읽기 전용으로", "Read-only"], ["확인 없이 조용히", "Quietly, without asking"], ["휴지통으로 보내기", "Send it to the trash"]]
  ),
  question(
    ["`/home/lupi/app.py`처럼 루트부터 시작하는 경로는?", "What is a path like `/home/lupi/app.py`, starting from the root, called?"],
    [["절대 경로", "An absolute path"], ["상대 경로", "A relative path"], ["숨김 경로", "A hidden path"], ["임시 경로", "A temporary path"]]
  ),
  question(
    ["`./run.sh`의 `.`이 가리키는 곳은?", "Where does the `.` in `./run.sh` point?"],
    [["현재 디렉터리", "The current directory"], ["상위 디렉터리", "The parent directory"], ["홈 디렉터리", "The home directory"], ["루트 디렉터리", "The root directory"]]
  ),
  question(
    ["이름으로 파일 위치를 찾는 명령은?", "Which command finds where a file is by its name?"],
    [["find . -name 파일명", "find . -name filename"], ["grep 파일명", "grep filename"], ["cd 파일명", "cd filename"], ["ls -find 파일명", "ls -find filename"]]
  ),
  question(["파일 안에서 특정 문자열이 든 줄을 찾는 명령은?", "Which command finds the lines in a file that contain a given string?"], ["grep", "find", "ls", "echo"]),
  question(["긴 파일을 한 화면씩 넘겨 보는 명령은?", "Which command pages through a long file one screen at a time?"], ["less", "cat", "head", "echo"]),
  question(["파일의 앞부분 10줄만 보는 명령은?", "Which command shows just the first 10 lines of a file?"], ["head", "tail", "top", "first"]),
  question(["로그 파일의 끝부분을 계속 따라가며 보려면?", "How do you keep following the end of a log file as it grows?"], ["tail -f", "head -f", "cat -f", "less -end"]),
  question(
    ["이름이 `.`으로 시작하는 파일의 특징은?", "What is special about a file whose name starts with `.`?"],
    [["ls에서 기본으로 숨겨진다", "ls hides it by default"], ["실행할 수 없다", "It can't be executed"], ["삭제할 수 없다", "It can't be deleted"], ["root만 볼 수 있다", "Only root can see it"]]
  ),
  question(["시스템 설정 파일이 주로 모여 있는 디렉터리는?", "Which directory mainly holds system configuration files?"], ["/etc", "/bin", "/tmp", "/home"]),
  question(["재부팅하면 비워질 수 있는 임시 파일용 디렉터리는?", "Which directory holds temporary files that may be cleared on reboot?"], ["/tmp", "/etc", "/usr", "/root"]),
  question(["디렉터리 구조를 나무 모양으로 보여 주는 명령은?", "Which command shows a directory structure as a tree?"], ["tree", "ls -tree", "dir -t", "map"]),
] satisfies readonly QuizQuestion[];

export default pathFileForagerQuiz;
