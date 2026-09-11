import type { QuizQuestion } from "../../types";

const pipeProcessEngineerQuiz = [
        { prompt: "`명령1 | 명령2`에서 `|`(파이프)의 역할은?", choices: ["앞 명령 출력을 뒤 명령 입력으로", "두 명령을 함께 종료", "앞 명령을 백그라운드로", "출력을 파일에 저장"], answerIndex: 0 },
        { prompt: "`echo hi > a.txt`에서 `>`가 하는 일은?", choices: ["출력을 파일에 덮어쓴다", "파일 끝에 이어 쓴다", "파일을 삭제한다", "파일을 실행한다"], answerIndex: 0 },
        { prompt: "출력을 파일 끝에 이어 붙이는 기호는?", choices: [">>", ">", "<", "|"], answerIndex: 0 },
        { prompt: "파일 내용을 명령의 입력으로 넣는 기호는?", choices: ["<", ">", ">>", "&"], answerIndex: 0 },
        { prompt: "실행 중인 프로세스 목록을 보는 명령은?", choices: ["ps", "ls", "pwd", "df"], answerIndex: 0 },
        { prompt: "PID가 1234인 프로세스를 종료하는 명령은?", choices: ["kill 1234", "stop 1234", "rm 1234", "exit 1234"], answerIndex: 0 },
        { prompt: "CPU와 메모리를 많이 쓰는 프로세스를 실시간으로 보는 명령은?", choices: ["top", "ps -once", "df", "du"], answerIndex: 0 },
        { prompt: "명령 끝에 `&`를 붙이면?", choices: ["백그라운드에서 실행된다", "두 번 실행된다", "관리자 권한으로 실행된다", "실행이 취소된다"], answerIndex: 0 },
        { prompt: "실행 중인 프로그램, 즉 PID를 가진 실행 단위를 뭐라고 하나요?", choices: ["프로세스", "커널", "디렉터리", "패키지"], answerIndex: 0 },
        { prompt: "`ls | wc -l`이 알려 주는 것은?", choices: ["현재 디렉터리의 항목 수", "파일 크기의 합", "숨김 파일 목록", "가장 긴 파일 이름"], answerIndex: 0 },
        { prompt: "`ps aux | grep node`는 무엇을 하나요?", choices: ["node 프로세스만 추려 보여 준다", "node를 종료한다", "node를 설치한다", "node를 백그라운드로 보낸다"], answerIndex: 0 },
        { prompt: "에러 출력만 따로 파일에 저장하는 표기는?", choices: ["2> error.log", "1> error.log", "&> error.log", "| error.log"], answerIndex: 0 },
        { prompt: "앞 명령이 성공했을 때만 다음 명령을 실행하는 기호는?", choices: ["&&", "||", ";", "|"], answerIndex: 0 },
        { prompt: "`Ctrl + Z`로 멈춘 작업을 백그라운드에서 이어 실행하는 명령은?", choices: ["bg", "fg", "jobs", "kill"], answerIndex: 0 },
        { prompt: "현재 셸에서 돌리는 작업 목록을 보는 명령은?", choices: ["jobs", "tasks", "bg", "procs"], answerIndex: 0 },
        { prompt: "`kill -9 PID`의 `-9`가 뜻하는 것은?", choices: ["강제 종료 신호(SIGKILL)", "9초 뒤 종료", "9번 반복 종료", "정상 종료 요청"], answerIndex: 0 },
        { prompt: "`sort names.txt | uniq`가 하는 일은?", choices: ["정렬 후 중복 줄을 없앤다", "파일을 삭제한다", "줄 수를 센다", "두 파일을 합친다"], answerIndex: 0 },
        { prompt: "출력을 화면에 보여 주면서 파일에도 저장하는 명령은?", choices: ["tee", "cat", "less", "echo"], answerIndex: 0 },
        { prompt: "부팅 후 가장 먼저 뜨는, 모든 프로세스의 조상 프로세스의 PID는?", choices: ["1", "0", "100", "65535"], answerIndex: 0 },
        { prompt: "로그아웃해도 명령이 계속 돌게 하는 명령은?", choices: ["nohup", "keepalive", "stay", "hold"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default pipeProcessEngineerQuiz;
