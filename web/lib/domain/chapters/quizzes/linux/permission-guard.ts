import type { QuizQuestion } from "../../types";

const permissionGuardQuiz = [
        { prompt: "`ls -l` 결과에 보이는 `rwx`가 뜻하는 것은?", choices: ["읽기·쓰기·실행 권한", "파일 크기", "소유자 이름", "수정 날짜"], answerIndex: 0 },
        { prompt: "`run.sh`에 실행 권한을 주는 명령은?", choices: ["chmod +x run.sh", "chown +x run.sh", "mkdir +x run.sh", "cat +x run.sh"], answerIndex: 0 },
        { prompt: "관리자(root) 권한으로 명령을 실행할 때 앞에 붙이는 것은?", choices: ["sudo", "admin", "root", "super"], answerIndex: 0 },
        { prompt: "`-rwxr-xr--`에서 맨 앞 `rwx`는 누구의 권한인가요?", choices: ["파일 소유자", "같은 그룹", "그 외 사용자", "root만"], answerIndex: 0 },
        { prompt: "`chmod 755`에서 7이 뜻하는 권한은?", choices: ["읽기·쓰기·실행 모두", "읽기만", "읽기·실행", "권한 없음"], answerIndex: 0 },
        { prompt: "`chmod 644 notes.txt`를 하면 그룹과 기타 사용자는?", choices: ["읽기만 할 수 있다", "읽고 쓸 수 있다", "실행만 할 수 있다", "아무것도 못 한다"], answerIndex: 0 },
        { prompt: "파일의 소유자를 바꾸는 명령은?", choices: ["chown", "chmod", "chowner", "usermod"], answerIndex: 0 },
        { prompt: "권한 숫자에서 읽기, 쓰기, 실행의 값은?", choices: ["r=4 w=2 x=1", "r=1 w=2 x=4", "r=3 w=2 x=1", "r=7 w=5 x=1"], answerIndex: 0 },
        { prompt: "디렉터리에 실행(x) 권한이 없으면 할 수 없는 것은?", choices: ["그 안으로 cd 들어가기", "권한 표시 보기", "상위 폴더로 가기", "내 계정 이름 보기"], answerIndex: 0 },
        { prompt: "현재 사용자가 속한 그룹 목록을 보는 명령은?", choices: ["groups", "whoami", "grouplist", "chgrp"], answerIndex: 0 },
        { prompt: "시스템 전체에 대해 최고 권한을 가진 계정 이름은?", choices: ["root", "admin", "super", "master"], answerIndex: 0 },
        { prompt: "`Permission denied` 오류가 뜨는 흔한 이유는?", choices: ["필요한 권한이 없어서", "파일 이름이 길어서", "인터넷이 끊겨서", "화면이 작아서"], answerIndex: 0 },
        { prompt: "내 계정의 비밀번호를 바꾸는 명령은?", choices: ["passwd", "password", "secret", "chpassword"], answerIndex: 0 },
        { prompt: "새 사용자 계정을 만드는 명령은?", choices: ["useradd", "mkuser", "newuser", "makeuser"], answerIndex: 0 },
        { prompt: "파일의 그룹을 바꾸는 명령은?", choices: ["chgrp", "chmod g", "grpmod", "setgroup"], answerIndex: 0 },
        { prompt: "`sudo`를 쓸 수 있는 사용자를 정해 두는 설정 파일은?", choices: ["/etc/sudoers", "/etc/hosts", "/etc/passwd", "/etc/fstab"], answerIndex: 0 },
        { prompt: "사용자 계정 목록이 저장된 파일은?", choices: ["/etc/passwd", "/etc/sudoers", "/etc/hosts", "/etc/shells"], answerIndex: 0 },
        { prompt: "`chmod 777`을 함부로 쓰면 안 되는 이유는?", choices: ["아무나 고치고 실행할 수 있어서", "파일이 느려져서", "파일이 숨겨져서", "디렉터리가 사라져서"], answerIndex: 0 },
        { prompt: "`chmod u+x`에서 `u`가 뜻하는 것은?", choices: ["파일 소유자", "모든 사용자", "그룹", "기타 사용자"], answerIndex: 0 },
        { prompt: "최소 권한 원칙에 맞는 태도는?", choices: ["필요한 만큼만 권한을 준다", "항상 root로 작업한다", "모든 파일을 777로 연다", "비밀번호를 공유한다"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default permissionGuardQuiz;
