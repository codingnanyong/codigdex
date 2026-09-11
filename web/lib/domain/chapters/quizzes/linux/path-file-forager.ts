import type { QuizQuestion } from "../../types";

const pathFileForagerQuiz = [
        { prompt: "리눅스 파일 시스템의 최상위 디렉터리는?", choices: ["/", "~", "./", "C:\\"], answerIndex: 0 },
        { prompt: "`~` 기호가 가리키는 곳은?", choices: ["현재 사용자의 홈 디렉터리", "루트 디렉터리", "현재 디렉터리", "임시 디렉터리"], answerIndex: 0 },
        { prompt: "새 디렉터리를 만드는 명령은?", choices: ["mkdir", "touch", "rm", "cd"], answerIndex: 0 },
        { prompt: "빈 파일을 새로 만드는 명령은?", choices: ["touch", "mkdir", "cat", "ls"], answerIndex: 0 },
        { prompt: "파일 내용을 터미널에 출력하는 명령은?", choices: ["cat", "ls", "cp", "mkdir"], answerIndex: 0 },
        { prompt: "파일을 복사하는 명령은?", choices: ["cp", "mv", "rm", "ln"], answerIndex: 0 },
        { prompt: "파일을 다른 곳으로 옮기거나 이름을 바꾸는 명령은?", choices: ["mv", "cp", "rm", "touch"], answerIndex: 0 },
        { prompt: "파일을 삭제하는 명령은?", choices: ["rm", "del", "erase", "drop"], answerIndex: 0 },
        { prompt: "`rm -r 폴더`에서 `-r`의 의미는?", choices: ["안의 내용까지 재귀적으로", "읽기 전용으로", "확인 없이 조용히", "휴지통으로 보내기"], answerIndex: 0 },
        { prompt: "`/home/lupi/app.py`처럼 루트부터 시작하는 경로는?", choices: ["절대 경로", "상대 경로", "숨김 경로", "임시 경로"], answerIndex: 0 },
        { prompt: "`./run.sh`의 `.`이 가리키는 곳은?", choices: ["현재 디렉터리", "상위 디렉터리", "홈 디렉터리", "루트 디렉터리"], answerIndex: 0 },
        { prompt: "이름으로 파일 위치를 찾는 명령은?", choices: ["find . -name 파일명", "grep 파일명", "cd 파일명", "ls -find 파일명"], answerIndex: 0 },
        { prompt: "파일 안에서 특정 문자열이 든 줄을 찾는 명령은?", choices: ["grep", "find", "ls", "echo"], answerIndex: 0 },
        { prompt: "긴 파일을 한 화면씩 넘겨 보는 명령은?", choices: ["less", "cat", "head", "echo"], answerIndex: 0 },
        { prompt: "파일의 앞부분 10줄만 보는 명령은?", choices: ["head", "tail", "top", "first"], answerIndex: 0 },
        { prompt: "로그 파일의 끝부분을 계속 따라가며 보려면?", choices: ["tail -f", "head -f", "cat -f", "less -end"], answerIndex: 0 },
        { prompt: "이름이 `.`으로 시작하는 파일의 특징은?", choices: ["ls에서 기본으로 숨겨진다", "실행할 수 없다", "삭제할 수 없다", "root만 볼 수 있다"], answerIndex: 0 },
        { prompt: "시스템 설정 파일이 주로 모여 있는 디렉터리는?", choices: ["/etc", "/bin", "/tmp", "/home"], answerIndex: 0 },
        { prompt: "재부팅하면 비워질 수 있는 임시 파일용 디렉터리는?", choices: ["/tmp", "/etc", "/usr", "/root"], answerIndex: 0 },
        { prompt: "디렉터리 구조를 나무 모양으로 보여 주는 명령은?", choices: ["tree", "ls -tree", "dir -t", "map"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default pathFileForagerQuiz;
