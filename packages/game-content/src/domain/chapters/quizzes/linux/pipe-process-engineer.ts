import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const pipeProcessEngineerQuiz = [
  question(
    ["`명령1 | 명령2`에서 `|`(파이프)의 역할은?", "In `command1 | command2`, what does the `|` (pipe) do?"],
    [["앞 명령 출력을 뒤 명령 입력으로", "Feeds the first command's output into the second"], ["두 명령을 함께 종료", "Stops both commands together"], ["앞 명령을 백그라운드로", "Sends the first command to the background"], ["출력을 파일에 저장", "Saves the output to a file"]]
  ),
  question(
    ["`echo hi > a.txt`에서 `>`가 하는 일은?", "What does `>` do in `echo hi > a.txt`?"],
    [["출력을 파일에 덮어쓴다", "Overwrites the file with the output"], ["파일 끝에 이어 쓴다", "Appends to the end of the file"], ["파일을 삭제한다", "Deletes the file"], ["파일을 실행한다", "Runs the file"]]
  ),
  question(["출력을 파일 끝에 이어 붙이는 기호는?", "Which symbol appends output to the end of a file?"], [">>", ">", "<", "|"]),
  question(["파일 내용을 명령의 입력으로 넣는 기호는?", "Which symbol feeds a file's contents into a command as input?"], ["<", ">", ">>", "&"]),
  question(["실행 중인 프로세스 목록을 보는 명령은?", "Which command lists running processes?"], ["ps", "ls", "pwd", "df"]),
  question(["PID가 1234인 프로세스를 종료하는 명령은?", "Which command ends the process with PID 1234?"], ["kill 1234", "stop 1234", "rm 1234", "exit 1234"]),
  question(["CPU와 메모리를 많이 쓰는 프로세스를 실시간으로 보는 명령은?", "Which command shows the processes using the most CPU and memory in real time?"], ["top", "ps -once", "df", "du"]),
  question(
    ["명령 끝에 `&`를 붙이면?", "What happens if you add `&` to the end of a command?"],
    [["백그라운드에서 실행된다", "It runs in the background"], ["두 번 실행된다", "It runs twice"], ["관리자 권한으로 실행된다", "It runs with admin rights"], ["실행이 취소된다", "It gets cancelled"]]
  ),
  question(
    ["실행 중인 프로그램, 즉 PID를 가진 실행 단위를 뭐라고 하나요?", "What do you call a running program, the unit of execution that has a PID?"],
    [["프로세스", "A process"], ["커널", "A kernel"], ["디렉터리", "A directory"], ["패키지", "A package"]]
  ),
  question(
    ["`ls | wc -l`이 알려 주는 것은?", "What does `ls | wc -l` tell you?"],
    [["현재 디렉터리의 항목 수", "How many entries the current directory has"], ["파일 크기의 합", "The total size of the files"], ["숨김 파일 목록", "The list of hidden files"], ["가장 긴 파일 이름", "The longest file name"]]
  ),
  question(
    ["`ps aux | grep node`는 무엇을 하나요?", "What does `ps aux | grep node` do?"],
    [["node 프로세스만 추려 보여 준다", "Shows only the node processes"], ["node를 종료한다", "Stops node"], ["node를 설치한다", "Installs node"], ["node를 백그라운드로 보낸다", "Sends node to the background"]]
  ),
  question(["에러 출력만 따로 파일에 저장하는 표기는?", "Which notation saves only the error output to a file?"], ["2> error.log", "1> error.log", "&> error.log", "| error.log"]),
  question(["앞 명령이 성공했을 때만 다음 명령을 실행하는 기호는?", "Which symbol runs the next command only if the previous one succeeded?"], ["&&", "||", ";", "|"]),
  question(["`Ctrl + Z`로 멈춘 작업을 백그라운드에서 이어 실행하는 명령은?", "Which command resumes a job paused with `Ctrl + Z` in the background?"], ["bg", "fg", "jobs", "kill"]),
  question(["현재 셸에서 돌리는 작업 목록을 보는 명령은?", "Which command lists the jobs running in the current shell?"], ["jobs", "tasks", "bg", "procs"]),
  question(
    ["`kill -9 PID`의 `-9`가 뜻하는 것은?", "What does `-9` mean in `kill -9 PID`?"],
    [["강제 종료 신호(SIGKILL)", "The force-kill signal (SIGKILL)"], ["9초 뒤 종료", "Stop after 9 seconds"], ["9번 반복 종료", "Stop 9 times in a row"], ["정상 종료 요청", "A polite request to exit"]]
  ),
  question(
    ["`sort names.txt | uniq`가 하는 일은?", "What does `sort names.txt | uniq` do?"],
    [["정렬 후 중복 줄을 없앤다", "Sorts, then removes duplicate lines"], ["파일을 삭제한다", "Deletes the file"], ["줄 수를 센다", "Counts the lines"], ["두 파일을 합친다", "Merges two files"]]
  ),
  question(["출력을 화면에 보여 주면서 파일에도 저장하는 명령은?", "Which command shows output on screen while also saving it to a file?"], ["tee", "cat", "less", "echo"]),
  question(["부팅 후 가장 먼저 뜨는, 모든 프로세스의 조상 프로세스의 PID는?", "What is the PID of the first process started after boot, the ancestor of all others?"], ["1", "0", "100", "65535"]),
  question(["로그아웃해도 명령이 계속 돌게 하는 명령은?", "Which command keeps a command running after you log out?"], ["nohup", "keepalive", "stay", "hold"]),
] satisfies readonly QuizQuestion[];

export default pipeProcessEngineerQuiz;
