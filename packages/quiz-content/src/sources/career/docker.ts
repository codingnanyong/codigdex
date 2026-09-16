import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 image-whale — Image */
const imageWhaleQuiz: readonly QuizQuestion[] = [
  question(
    ["컨테이너 이미지를 가장 잘 설명한 것은?", "Which best describes a container image?"],
    [["컨테이너 실행에 필요한 읽기 전용 템플릿", "A read-only template needed to run a container"], ["실행 중인 프로세스", "A running process"], ["가상 머신 하이퍼바이저", "A virtual machine hypervisor"], ["네트워크 설정 파일", "A network configuration file"]]
  ),
  question(["이미지를 내려받는 명령은?", "Which command downloads an image?"], ["docker pull", "docker run -d", "docker build", "docker commit"]),
  question(["로컬에 있는 이미지 목록을 보는 명령은?", "Which command lists the images stored locally?"], ["docker images", "docker ps", "docker logs", "docker stats"]),
  question(
    ["이미지가 여러 층으로 쌓이는 구조를 부르는 말은?", "What is the stacked structure of an image called?"],
    [["레이어", "Layers"], ["볼륨", "Volumes"], ["네임스페이스", "Namespaces"], ["네트워크 브리지", "Network bridges"]]
  ),
  question(
    ["이미지 레이어가 공유되면 좋은 점은?", "What is the benefit of shared image layers?"],
    [["저장 공간과 전송량을 아낀다", "It saves storage and transfer"], ["보안이 자동으로 강화된다", "Security improves automatically"], ["컨테이너가 영구 저장된다", "Containers become persistent"], ["빌드가 필요 없어진다", "Builds become unnecessary"]]
  ),
  question(
    ["이미지 태그를 latest로만 쓰면 생기는 문제는?", "What problem comes from tagging only with latest?"],
    [["어떤 버전이 배포됐는지 재현할 수 없다", "You cannot reproduce which version was deployed"], ["이미지가 커진다", "The image grows"], ["빌드가 실패한다", "Builds fail"], ["레지스트리에 올릴 수 없다", "It cannot be pushed to a registry"]]
  ),
  question(
    ["컨테이너와 가상 머신의 차이는?", "How does a container differ from a virtual machine?"],
    [["컨테이너는 호스트 커널을 공유해 더 가볍다", "A container shares the host kernel, so it is lighter"], ["컨테이너가 항상 더 안전하다", "A container is always more secure"], ["가상 머신이 더 빨리 시작된다", "A virtual machine starts faster"], ["둘은 동일한 기술이다", "They are the same technology"]]
  ),
  question(
    ["이미지 크기를 줄이는 효과적인 방법은?", "Which effectively reduces image size?"],
    [["작은 베이스 이미지와 멀티 스테이지 빌드를 쓴다", "Use a small base image and a multi-stage build"], ["레이어 수를 최대한 늘린다", "Maximize the number of layers"], ["모든 빌드 도구를 함께 담는다", "Ship every build tool inside"], ["태그를 짧게 짓는다", "Use a shorter tag"]]
  ),
  question(
    ["빌드 중간 산출물을 최종 이미지에서 빼는 기법은?", "Which technique keeps build-time artifacts out of the final image?"],
    [["멀티 스테이지 빌드", "A multi-stage build"], ["볼륨 마운트", "A volume mount"], ["네트워크 브리지", "A network bridge"], ["헬스 체크", "A health check"]]
  ),
  question(
    ["이미지 이름 앞에 레지스트리 주소를 붙이는 이유는?", "Why prefix an image name with a registry address?"],
    [["어느 레지스트리에서 가져올지 명확히 하기 위해", "To state clearly which registry it comes from"], ["이미지를 압축하기 위해", "To compress the image"], ["빌드를 건너뛰기 위해", "To skip the build"], ["레이어를 병합하기 위해", "To merge layers"]]
  ),
];

/** LV.2 container-tug — Container */
const containerTugQuiz: readonly QuizQuestion[] = [
  question(
    ["컨테이너를 가장 잘 설명한 것은?", "Which best describes a container?"],
    [["이미지를 격리된 프로세스로 실행한 인스턴스", "A running, isolated process instance created from an image"], ["이미지를 저장하는 파일", "A file that stores an image"], ["빌드 명령 목록", "A list of build commands"], ["가상 네트워크 장비", "A virtual network device"]]
  ),
  question(["실행 중인 컨테이너 목록을 보는 명령은?", "Which command lists running containers?"], ["docker ps", "docker images", "docker build", "docker pull"]),
  question(
    ["컨테이너를 백그라운드로 실행하는 옵션은?", "Which option runs a container in the background?"],
    ["-d", "-it", "-v", "--rm"]
  ),
  question(
    ["호스트의 8080 포트를 컨테이너의 80 포트에 연결하는 옵션은?", "Which option maps host port 8080 to container port 80?"],
    ["-p 8080:80", "-p 80:8080", "--port 8080", "-e PORT=8080"]
  ),
  question(["컨테이너의 표준 출력 로그를 보는 명령은?", "Which command shows a container's stdout logs?"], ["docker logs", "docker inspect", "docker stats", "docker top"]),
  question(
    ["실행 중인 컨테이너 안에서 셸을 여는 명령은?", "Which command opens a shell inside a running container?"],
    ["docker exec -it <container> sh", "docker run -it <container> sh", "docker attach --shell", "docker enter <container>"]
  ),
  question(
    ["컨테이너를 삭제하면 그 안에서 만든 파일은?", "What happens to files created inside a container when it is removed?"],
    [["볼륨에 두지 않았다면 함께 사라진다", "They disappear too, unless they were on a volume"], ["항상 호스트에 남는다", "They always remain on the host"], ["이미지에 저장된다", "They are saved into the image"], ["레지스트리로 업로드된다", "They are uploaded to the registry"]]
  ),
  question(
    ["컨테이너에 설정값을 전달하는 일반적인 방법은?", "What is the usual way to pass configuration into a container?"],
    [["환경 변수를 주입한다", "Inject environment variables"], ["이미지를 다시 빌드한다", "Rebuild the image every time"], ["컨테이너에 직접 접속해 수정한다", "Log in and edit the files by hand"], ["레지스트리 설정을 바꾼다", "Change the registry settings"]]
  ),
  question(
    ["컨테이너가 하나의 주 프로세스만 실행하는 편이 좋은 이유는?", "Why should a container run a single main process?"],
    [["수명 관리와 재시작, 로그 수집이 단순해진다", "Lifecycle, restarts and log collection all stay simple"], ["메모리를 두 배로 쓴다", "It uses twice the memory"], ["이미지가 커진다", "The image gets bigger"], ["네트워크가 빨라진다", "The network gets faster"]]
  ),
  question(
    ["여러 컨테이너를 한 파일로 함께 정의해 실행하는 도구는?", "Which tool defines and runs several containers from one file?"],
    ["Docker Compose", "Dockerfile", "Docker Registry", "Docker Scan"]
  ),
];

/** LV.3 container-carrier — Dockerfile */
const containerCarrierQuiz: readonly QuizQuestion[] = [
  question(
    ["Dockerfile이 하는 일은?", "What does a Dockerfile do?"],
    [["이미지를 만드는 명령을 선언적으로 기록한다", "It declares the instructions used to build an image"], ["컨테이너를 실행한다", "It runs a container"], ["이미지를 레지스트리에 올린다", "It pushes an image to a registry"], ["네트워크를 구성한다", "It configures networking"]]
  ),
  question(["기반이 되는 이미지를 지정하는 명령어는?", "Which instruction sets the base image?"], ["FROM", "BASE", "IMAGE", "RUN"]),
  question(
    ["빌드 시점에 명령을 실행해 레이어를 만드는 명령어는?", "Which instruction runs a command at build time and creates a layer?"],
    ["RUN", "CMD", "ENTRYPOINT", "EXPOSE"]
  ),
  question(
    ["컨테이너가 시작될 때 실행할 기본 명령을 정하는 것은?", "Which sets the default command run when the container starts?"],
    ["CMD", "RUN", "COPY", "ARG"]
  ),
  question(
    ["CMD와 ENTRYPOINT의 차이로 옳은 것은?", "Which correctly distinguishes CMD from ENTRYPOINT?"],
    [["CMD는 실행 시 인자로 쉽게 덮어쓸 수 있다", "CMD is easily overridden by arguments at run time"], ["ENTRYPOINT는 빌드 시점에만 실행된다", "ENTRYPOINT runs only at build time"], ["둘은 완전히 같다", "They are exactly the same"], ["CMD는 여러 번 모두 실행된다", "Every CMD in the file is executed"]]
  ),
  question(["호스트 파일을 이미지 안으로 복사하는 명령어는?", "Which instruction copies host files into the image?"], ["COPY", "MOVE", "IMPORT", "LOAD"]),
  question(["이후 명령의 기준 디렉터리를 정하는 명령어는?", "Which instruction sets the working directory for later instructions?"], ["WORKDIR", "CD", "PWD", "DIR"]),
  question(
    ["의존성 설치를 소스 복사보다 먼저 두는 이유는?", "Why copy dependency manifests and install before copying the source?"],
    [["소스만 바뀔 때 설치 레이어 캐시를 재사용한다", "The install layer stays cached when only the source changes"], ["이미지가 작아진다", "The image becomes smaller"], ["보안이 강해진다", "It is more secure"], ["빌드 순서는 상관없다", "The order makes no difference"]]
  ),
  question(
    ["빌드 문맥에서 제외할 파일을 적는 파일은?", "Which file lists paths to exclude from the build context?"],
    [".dockerignore", ".gitignore", "Dockerfile.skip", "build.exclude"]
  ),
  question(
    ["컨테이너를 root가 아닌 사용자로 실행하는 명령어는?", "Which instruction runs the container as a non-root user?"],
    ["USER", "RUNAS", "SETUID", "PRIVILEGE"]
  ),
];

/** LV.4 registry-carrier — Volume */
const registryCarrierQuiz: readonly QuizQuestion[] = [
  question(
    ["볼륨이 하는 일은?", "What does a volume do?"],
    [["컨테이너 수명과 분리해 데이터를 보존한다", "It persists data independently of a container's lifetime"], ["이미지를 압축한다", "It compresses the image"], ["네트워크를 격리한다", "It isolates the network"], ["빌드 속도를 높인다", "It speeds up builds"]]
  ),
  question(
    ["컨테이너 안의 데이터가 기본적으로 사라지는 성질을 부르는 말은?", "What is it called that container data disappears by default?"],
    [["일시성(ephemeral)", "Ephemerality"], ["멱등성", "Idempotence"], ["원자성", "Atomicity"], ["불변성", "Immutability"]]
  ),
  question(
    ["호스트 디렉터리를 컨테이너에 연결하는 옵션은?", "Which option attaches a host directory to a container?"],
    ["-v /host/path:/container/path", "-p /host/path:/container/path", "-e PATH=/host/path", "--mount-host /host/path"]
  ),
  question(
    ["바인드 마운트와 이름 있는 볼륨의 차이는?", "How does a bind mount differ from a named volume?"],
    [["바인드 마운트는 호스트 경로에, 이름 있는 볼륨은 도커가 관리하는 저장소에 둔다", "A bind mount points at a host path; a named volume lives in Docker-managed storage"], ["이름 있는 볼륨은 호스트 경로가 필요하다", "A named volume requires a host path"], ["둘은 완전히 같다", "They are exactly the same"], ["바인드 마운트만 영구적이다", "Only bind mounts persist"]]
  ),
  question(
    ["데이터베이스를 컨테이너로 운영할 때 반드시 해야 할 일은?", "What must you do when running a database in a container?"],
    [["데이터 디렉터리를 볼륨에 둔다", "Put the data directory on a volume"], ["컨테이너를 매번 새로 만든다", "Recreate the container every time"], ["로그를 끈다", "Turn off logging"], ["포트를 열지 않는다", "Never expose a port"]]
  ),
  question(
    ["여러 컨테이너가 같은 볼륨을 공유할 수 있는가?", "Can several containers share one volume?"],
    [["가능하며 동시 쓰기에는 주의가 필요하다", "Yes, though concurrent writes need care"], ["불가능하다", "No, it is impossible"], ["읽기도 불가능하다", "Not even for reading"], ["이미지를 다시 빌드해야만 가능하다", "Only after rebuilding the image"]]
  ),
  question(
    ["사용하지 않는 볼륨과 이미지를 정리하는 명령은?", "Which command cleans up unused volumes and images?"],
    ["docker system prune", "docker clean all", "docker rm --cache", "docker gc"]
  ),
  question(
    ["설정 파일을 이미지에 굽지 않고 볼륨으로 넣는 이유는?", "Why mount a config file as a volume instead of baking it into the image?"],
    [["환경마다 이미지를 다시 만들지 않아도 된다", "The same image works across environments without a rebuild"], ["이미지가 항상 작아진다", "The image is always smaller"], ["빌드가 필요 없어진다", "No build is needed at all"], ["보안 검사를 건너뛴다", "It skips the security scan"]]
  ),
  question(
    ["볼륨 안의 데이터를 백업하는 합리적인 방법은?", "What is a sensible way to back up data inside a volume?"],
    [["볼륨을 마운트한 임시 컨테이너로 아카이브를 만든다", "Run a throwaway container that mounts it and writes an archive"], ["컨테이너를 이미지로 커밋한다", "Commit the container into an image"], ["컨테이너를 삭제한다", "Delete the container"], ["레지스트리에 푸시한다", "Push it to the registry"]]
  ),
  question(
    ["컨테이너 로그가 디스크를 가득 채우는 것을 막으려면?", "How do you stop container logs from filling the disk?"],
    [["로그 드라이버에 크기와 회전 정책을 설정한다", "Configure size and rotation limits on the log driver"], ["로그를 모두 끈다", "Disable logging entirely"], ["컨테이너를 매일 지운다", "Delete the container daily"], ["볼륨을 늘린다", "Just add more volume space"]]
  ),
];

/** LV.5 harbor-leviathan — Registry */
const harborLeviathanQuiz: readonly QuizQuestion[] = [
  question(
    ["레지스트리가 하는 일은?", "What does a registry do?"],
    [["컨테이너 이미지를 저장하고 배포한다", "It stores and distributes container images"], ["컨테이너를 실행한다", "It runs containers"], ["네트워크를 라우팅한다", "It routes network traffic"], ["볼륨을 관리한다", "It manages volumes"]]
  ),
  question(["빌드한 이미지를 레지스트리에 올리는 명령은?", "Which command uploads a built image to a registry?"], ["docker push", "docker pull", "docker save", "docker export"]),
  question(
    ["비공개 레지스트리에 접근하기 전에 해야 할 일은?", "What must you do before using a private registry?"],
    ["docker login", "docker init", "docker trust", "docker network create"]
  ),
  question(
    ["이미지를 내용 해시로 고정해 참조하는 방식은?", "How do you reference an image pinned by its content hash?"],
    [["다이제스트로 참조한다", "Reference it by digest"], ["latest 태그로 참조한다", "Reference the latest tag"], ["빌드 번호로 참조한다", "Reference the build number"], ["컨테이너 이름으로 참조한다", "Reference the container name"]]
  ),
  question(
    ["운영 배포에 다이제스트나 고정 태그를 쓰는 이유는?", "Why use a digest or a pinned tag for production deployments?"],
    [["같은 배포가 항상 같은 이미지를 실행하도록 보장한다", "It guarantees the same deployment always runs the same image"], ["이미지 크기를 줄인다", "It shrinks the image"], ["빌드를 생략한다", "It skips the build"], ["레지스트리 비용을 없앤다", "It removes registry cost"]]
  ),
  question(
    ["이미지의 알려진 취약점을 확인하는 활동은?", "Which activity checks an image for known vulnerabilities?"],
    [["이미지 스캔", "Image scanning"], ["레이어 병합", "Layer squashing"], ["태그 정리", "Tag pruning"], ["캐시 워밍", "Cache warming"]]
  ),
  question(
    ["이미지에 서명을 붙이는 이유는?", "Why sign an image?"],
    [["출처와 위변조 여부를 검증할 수 있다", "It lets consumers verify origin and integrity"], ["이미지를 압축한다", "It compresses the image"], ["다운로드를 빠르게 한다", "It speeds up downloads"], ["레이어를 줄인다", "It reduces layers"]]
  ),
  question(
    ["레지스트리 저장 비용이 계속 늘어날 때 필요한 것은?", "What is needed when registry storage keeps growing?"],
    [["오래된 태그를 정리하는 보존 정책", "A retention policy that prunes old tags"], ["더 큰 베이스 이미지", "A larger base image"], ["더 많은 레이어", "More layers"], ["태그 이름 변경", "Renaming the tags"]]
  ),
  question(
    ["CI에서 이미지를 태깅하는 좋은 방식은?", "What is a good way to tag images in CI?"],
    [["커밋 해시나 버전으로 고유하게 태깅한다", "Tag uniquely with a commit hash or version"], ["항상 latest 하나만 쓴다", "Always use only latest"], ["날짜 없이 dev로만 쓴다", "Use only dev, with no date"], ["태그를 붙이지 않는다", "Skip tagging altogether"]]
  ),
  question(
    ["공개 이미지를 그대로 운영에 쓰기 전에 확인할 것은?", "What should you check before running a public image in production?"],
    [["출처와 유지 상태, 취약점 스캔 결과", "Its provenance, maintenance status and scan results"], ["다운로드 수만", "Only the download count"], ["태그 이름의 길이", "The length of the tag name"], ["레이어 개수만", "Only the layer count"]]
  ),
];

const dockerQuiz: readonly (readonly QuizQuestion[])[] = [
  imageWhaleQuiz,
  containerTugQuiz,
  containerCarrierQuiz,
  registryCarrierQuiz,
  harborLeviathanQuiz,
];

export default dockerQuiz;
