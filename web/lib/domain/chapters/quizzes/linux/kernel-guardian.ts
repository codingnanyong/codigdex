import type { QuizQuestion } from "../../types";

const kernelGuardianQuiz = [
        { prompt: "하드웨어를 관리하고 프로세스·메모리를 배분하는 운영체제의 핵심은?", choices: ["커널", "셸", "터미널", "파일 시스템"], answerIndex: 0 },
        { prompt: "리눅스 설계 철학 '모든 것은 ○○이다'에서 ○○은?", choices: ["파일", "프로세스", "명령", "사용자"], answerIndex: 0 },
        { prompt: "프로그램이 커널에 파일 읽기 같은 일을 요청하는 방법은?", choices: ["시스템 콜", "파이프", "환경 변수", "단축키"], answerIndex: 0 },
        { prompt: "현재 커널 버전을 확인하는 명령은?", choices: ["uname -r", "kernel -v", "ls -kernel", "version --os"], answerIndex: 0 },
        { prompt: "커널이 프로세스와 하드웨어 정보를 파일처럼 보여 주는 가상 디렉터리는?", choices: ["/proc", "/home", "/tmp", "/opt"], answerIndex: 0 },
        { prompt: "커널이 남긴 부팅·하드웨어 메시지를 보는 명령은?", choices: ["dmesg", "echo", "history", "pwd"], answerIndex: 0 },
        { prompt: "하드웨어 장치와 커널을 이어 주는 소프트웨어는?", choices: ["드라이버", "셸 스크립트", "텍스트 에디터", "브라우저"], answerIndex: 0 },
        { prompt: "실행 중에 커널에 기능을 끼워 넣는 조각은?", choices: ["커널 모듈", "셸 별칭", "크론 작업", "심볼릭 링크"], answerIndex: 0 },
        { prompt: "커널 공간과 사용자 공간을 나누는 가장 큰 이유는?", choices: ["프로그램 오류로부터 시스템을 지키려고", "파일 이름을 짧게 하려고", "인터넷을 빠르게 하려고", "화면을 예쁘게 하려고"], answerIndex: 0 },
        { prompt: "메모리가 부족할 때 디스크 일부를 메모리처럼 쓰는 공간은?", choices: ["스왑(swap)", "캐시 폴더", "휴지통", "부트 섹터"], answerIndex: 0 },
        { prompt: "여러 프로세스가 CPU를 번갈아 쓰도록 순서를 정하는 커널 기능은?", choices: ["스케줄러", "컴파일러", "인터프리터", "방화벽"], answerIndex: 0 },
        { prompt: "메모리 사용량을 한눈에 보는 명령은?", choices: ["free -h", "mem -all", "df -h", "du -m"], answerIndex: 0 },
        { prompt: "디스크 공간 사용량을 보는 명령은?", choices: ["df -h", "free -h", "top -d", "ps -disk"], answerIndex: 0 },
        { prompt: "부팅 뒤 서비스를 띄우고 관리하는 대표적인 init 시스템은?", choices: ["systemd", "bash", "grub", "cron"], answerIndex: 0 },
        { prompt: "`systemctl status nginx`가 보여 주는 것은?", choices: ["nginx 서비스의 상태", "nginx 설치 파일", "nginx 소스 코드", "nginx 사용자 목록"], answerIndex: 0 },
        { prompt: "전원을 켠 뒤 커널을 메모리에 올려 주는 프로그램은?", choices: ["부트로더(GRUB 등)", "셸", "드라이버", "스케줄러"], answerIndex: 0 },
        { prompt: "리눅스 커널을 처음 만든 사람은?", choices: ["리누스 토르발스", "빌 게이츠", "스티브 잡스", "데니스 리치"], answerIndex: 0 },
        { prompt: "Ubuntu, Fedora처럼 커널에 도구를 묶어 내놓은 것을 뭐라고 하나요?", choices: ["배포판", "커널 모듈", "셸", "드라이버"], answerIndex: 0 },
        { prompt: "Ubuntu에서 패키지를 설치하는 명령은?", choices: ["sudo apt install 패키지", "sudo kernel add 패키지", "sudo pkg get 패키지", "sudo app install 패키지"], answerIndex: 0 },
        { prompt: "`/dev/null`로 출력을 보내면 어떻게 되나요?", choices: ["버려져서 사라진다", "파일로 저장된다", "화면에 두 번 나온다", "커널이 멈춘다"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default kernelGuardianQuiz;
