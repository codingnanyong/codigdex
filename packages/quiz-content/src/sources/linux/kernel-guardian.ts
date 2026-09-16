import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

const kernelGuardianQuiz = [
  question(
    ["하드웨어를 관리하고 프로세스·메모리를 배분하는 운영체제의 핵심은?", "What is the core of the operating system that manages hardware and allocates processes and memory?"],
    [["커널", "The kernel"], ["셸", "The shell"], ["터미널", "The terminal"], ["파일 시스템", "The file system"]]
  ),
  question(
    ["리눅스 설계 철학 '모든 것은 ○○이다'에서 ○○은?", "Linux design philosophy says 'everything is a ___'. What fills the blank?"],
    [["파일", "file"], ["프로세스", "process"], ["명령", "command"], ["사용자", "user"]]
  ),
  question(
    ["프로그램이 커널에 파일 읽기 같은 일을 요청하는 방법은?", "How does a program ask the kernel to do work like reading a file?"],
    [["시스템 콜", "A system call"], ["파이프", "A pipe"], ["환경 변수", "An environment variable"], ["단축키", "A keyboard shortcut"]]
  ),
  question(["현재 커널 버전을 확인하는 명령은?", "Which command shows the current kernel version?"], ["uname -r", "kernel -v", "ls -kernel", "version --os"]),
  question(["커널이 프로세스와 하드웨어 정보를 파일처럼 보여 주는 가상 디렉터리는?", "Which virtual directory exposes process and hardware information from the kernel as files?"], ["/proc", "/home", "/tmp", "/opt"]),
  question(["커널이 남긴 부팅·하드웨어 메시지를 보는 명령은?", "Which command shows the boot and hardware messages logged by the kernel?"], ["dmesg", "echo", "history", "pwd"]),
  question(
    ["하드웨어 장치와 커널을 이어 주는 소프트웨어는?", "What software connects a hardware device to the kernel?"],
    [["드라이버", "A driver"], ["셸 스크립트", "A shell script"], ["텍스트 에디터", "A text editor"], ["브라우저", "A browser"]]
  ),
  question(
    ["실행 중에 커널에 기능을 끼워 넣는 조각은?", "What piece plugs extra features into the kernel while it's running?"],
    [["커널 모듈", "A kernel module"], ["셸 별칭", "A shell alias"], ["크론 작업", "A cron job"], ["심볼릭 링크", "A symbolic link"]]
  ),
  question(
    ["커널 공간과 사용자 공간을 나누는 가장 큰 이유는?", "What is the main reason to separate kernel space and user space?"],
    [["프로그램 오류로부터 시스템을 지키려고", "To protect the system from buggy programs"], ["파일 이름을 짧게 하려고", "To keep file names short"], ["인터넷을 빠르게 하려고", "To make the internet faster"], ["화면을 예쁘게 하려고", "To make the screen look nicer"]]
  ),
  question(
    ["메모리가 부족할 때 디스크 일부를 메모리처럼 쓰는 공간은?", "When memory runs low, what disk space is used as if it were memory?"],
    [["스왑(swap)", "Swap"], ["캐시 폴더", "A cache folder"], ["휴지통", "The trash"], ["부트 섹터", "The boot sector"]]
  ),
  question(
    ["여러 프로세스가 CPU를 번갈아 쓰도록 순서를 정하는 커널 기능은?", "Which kernel feature decides the order in which processes take turns on the CPU?"],
    [["스케줄러", "The scheduler"], ["컴파일러", "The compiler"], ["인터프리터", "The interpreter"], ["방화벽", "The firewall"]]
  ),
  question(["메모리 사용량을 한눈에 보는 명령은?", "Which command shows memory usage at a glance?"], ["free -h", "mem -all", "df -h", "du -m"]),
  question(["디스크 공간 사용량을 보는 명령은?", "Which command shows disk space usage?"], ["df -h", "free -h", "top -d", "ps -disk"]),
  question(["부팅 뒤 서비스를 띄우고 관리하는 대표적인 init 시스템은?", "Which well-known init system starts and manages services after boot?"], ["systemd", "bash", "grub", "cron"]),
  question(
    ["`systemctl status nginx`가 보여 주는 것은?", "What does `systemctl status nginx` show?"],
    [["nginx 서비스의 상태", "The status of the nginx service"], ["nginx 설치 파일", "The nginx install files"], ["nginx 소스 코드", "The nginx source code"], ["nginx 사용자 목록", "The list of nginx users"]]
  ),
  question(
    ["전원을 켠 뒤 커널을 메모리에 올려 주는 프로그램은?", "Which program loads the kernel into memory after power-on?"],
    [["부트로더(GRUB 등)", "The bootloader (GRUB, etc.)"], ["셸", "The shell"], ["드라이버", "A driver"], ["스케줄러", "The scheduler"]]
  ),
  question(
    ["리눅스 커널을 처음 만든 사람은?", "Who first created the Linux kernel?"],
    [["리누스 토르발스", "Linus Torvalds"], ["빌 게이츠", "Bill Gates"], ["스티브 잡스", "Steve Jobs"], ["데니스 리치", "Dennis Ritchie"]]
  ),
  question(
    ["Ubuntu, Fedora처럼 커널에 도구를 묶어 내놓은 것을 뭐라고 하나요?", "What do you call a bundle of the kernel plus tools, like Ubuntu or Fedora?"],
    [["배포판", "A distribution"], ["커널 모듈", "A kernel module"], ["셸", "A shell"], ["드라이버", "A driver"]]
  ),
  question(
    ["Ubuntu에서 패키지를 설치하는 명령은?", "Which command installs a package on Ubuntu?"],
    [["sudo apt install 패키지", "sudo apt install package"], ["sudo kernel add 패키지", "sudo kernel add package"], ["sudo pkg get 패키지", "sudo pkg get package"], ["sudo app install 패키지", "sudo app install package"]]
  ),
  question(
    ["`/dev/null`로 출력을 보내면 어떻게 되나요?", "What happens to output sent to `/dev/null`?"],
    [["버려져서 사라진다", "It's discarded and disappears"], ["파일로 저장된다", "It's saved to a file"], ["화면에 두 번 나온다", "It shows up twice on screen"], ["커널이 멈춘다", "The kernel stops"]]
  ),
] satisfies readonly QuizQuestion[];

export default kernelGuardianQuiz;
