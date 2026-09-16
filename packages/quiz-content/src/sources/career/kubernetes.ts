import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 pod-cadet — Pod */
const podCadetQuiz: readonly QuizQuestion[] = [
  question(
    ["Pod를 가장 잘 설명한 것은?", "Which best describes a Pod?"],
    [["하나 이상의 컨테이너가 함께 실행되는 최소 배포 단위", "The smallest deployable unit, holding one or more containers"], ["클러스터의 물리 서버", "A physical server in the cluster"], ["이미지 저장소", "An image repository"], ["네트워크 정책", "A network policy"]]
  ),
  question(
    ["같은 Pod 안의 컨테이너들이 공유하는 것은?", "What do containers in the same Pod share?"],
    [["네트워크 네임스페이스와 IP", "The network namespace and IP address"], ["CPU 코어 하나만", "Exactly one CPU core"], ["소스 코드", "The source code"], ["호스트 이름만", "Only the host name"]]
  ),
  question(["클러스터의 Pod 목록을 보는 명령은?", "Which command lists the Pods in a cluster?"], ["kubectl get pods", "kubectl list pods", "kubectl show pods", "kubectl pods"]),
  question(
    ["Pod가 어떤 노드에 배치될지 정하는 구성 요소는?", "Which component decides which node a Pod lands on?"],
    [["스케줄러", "The scheduler"], ["kubelet", "The kubelet"], ["etcd", "etcd"], ["인그레스", "The ingress"]]
  ),
  question(
    ["각 노드에서 Pod를 실제로 실행하고 감시하는 것은?", "What actually runs and watches Pods on each node?"],
    ["kubelet", "kube-proxy", "etcd", "kubectl"]
  ),
  question(
    ["클러스터의 모든 상태가 저장되는 곳은?", "Where is all cluster state stored?"],
    ["etcd", ["스케줄러 메모리", "The scheduler's memory"], ["kubelet 디스크", "The kubelet's disk"], ["인그레스 캐시", "The ingress cache"]]
  ),
  question(
    ["Pod가 CrashLoopBackOff 상태라는 것은?", "What does a Pod in CrashLoopBackOff mean?"],
    [["컨테이너가 반복해서 죽고 재시작되고 있다", "The container keeps crashing and being restarted"], ["이미지를 아직 내려받는 중이다", "The image is still downloading"], ["노드가 부족하다", "There are not enough nodes"], ["정상적으로 동작 중이다", "It is working normally"]]
  ),
  question(
    ["Pod의 로그를 보는 명령은?", "Which command shows a Pod's logs?"],
    ["kubectl logs <pod>", "kubectl describe <pod>", "kubectl top <pod>", "kubectl events <pod>"]
  ),
  question(
    ["Pod가 왜 스케줄되지 않았는지 이벤트까지 보는 명령은?", "Which command shows the events explaining why a Pod is unscheduled?"],
    ["kubectl describe pod <pod>", "kubectl get pod <pod>", "kubectl logs <pod>", "kubectl exec <pod>"]
  ),
  question(
    ["Pod를 직접 만들지 않고 컨트롤러로 관리하는 이유는?", "Why manage Pods through a controller instead of creating them directly?"],
    [["죽어도 원하는 개수만큼 자동으로 다시 만들어진다", "They are recreated to the desired count when they die"], ["더 적은 메모리를 쓴다", "They use less memory"], ["이미지가 작아진다", "The image gets smaller"], ["네트워크가 빨라진다", "The network gets faster"]]
  ),
];

/** LV.2 cluster-pilot — Deployment */
const clusterPilotQuiz: readonly QuizQuestion[] = [
  question(
    ["Deployment가 관리하는 것은?", "What does a Deployment manage?"],
    [["Pod 복제본 수와 롤링 업데이트 상태", "The number of Pod replicas and the rolling update state"], ["클러스터의 노드 수", "The number of nodes in the cluster"], ["이미지 레지스트리", "The image registry"], ["DNS 레코드", "DNS records"]]
  ),
  question(
    ["replicas를 3으로 설정하면?", "What does setting replicas to 3 do?"],
    [["항상 Pod 3개가 유지되도록 조정된다", "The controller keeps exactly three Pods running"], ["Pod가 3번만 실행되고 멈춘다", "The Pod runs three times and stops"], ["노드가 3개 생성된다", "Three nodes are created"], ["3배 빠르게 실행된다", "It runs three times faster"]]
  ),
  question(
    ["Deployment의 이미지 태그를 바꾸면 기본적으로 일어나는 일은?", "What happens by default when you change a Deployment's image tag?"],
    [["롤링 업데이트로 Pod가 점진적으로 교체된다", "A rolling update replaces the Pods gradually"], ["모든 Pod가 동시에 멈췄다 켜진다", "Every Pod stops and starts at once"], ["아무 일도 일어나지 않는다", "Nothing happens"], ["클러스터가 재시작된다", "The cluster restarts"]]
  ),
  question(
    ["Deployment를 이전 리비전으로 되돌리는 명령은?", "Which command reverts a Deployment to its previous revision?"],
    ["kubectl rollout undo", "kubectl rollout pause", "kubectl delete deployment", "kubectl apply --revert"]
  ),
  question(
    ["롤아웃 진행 상황을 확인하는 명령은?", "Which command watches a rollout's progress?"],
    ["kubectl rollout status", "kubectl get nodes", "kubectl top pods", "kubectl config view"]
  ),
  question(
    ["Deployment가 실제로 Pod를 만들기 위해 생성하는 중간 객체는?", "Which intermediate object does a Deployment create to manage Pods?"],
    ["ReplicaSet", "DaemonSet", "StatefulSet", "Job"]
  ),
  question(
    ["모든 노드에 Pod를 하나씩 배치하는 컨트롤러는?", "Which controller places one Pod on every node?"],
    ["DaemonSet", "Deployment", "StatefulSet", "CronJob"]
  ),
  question(
    ["안정적인 이름과 저장소가 필요한 워크로드에 쓰는 컨트롤러는?", "Which controller suits workloads needing stable names and storage?"],
    ["StatefulSet", "Deployment", "DaemonSet", "ReplicaSet"]
  ),
  question(
    ["한 번 실행하고 끝나는 작업에 쓰는 객체는?", "Which object runs a task once to completion?"],
    ["Job", "Deployment", "Service", "Ingress"]
  ),
  question(
    ["매니페스트를 선언적으로 적용하는 명령은?", "Which command applies manifests declaratively?"],
    ["kubectl apply -f", "kubectl create --now", "kubectl edit --push", "kubectl patch --all"]
  ),
];

/** LV.3 pod-helmsman — Service */
const podHelmsmanQuiz: readonly QuizQuestion[] = [
  question(
    ["Service가 제공하는 것은?", "What does a Service provide?"],
    [["변하는 Pod 집합에 안정적인 접근점", "A stable endpoint for a changing set of Pods"], ["Pod의 저장 공간", "Storage for a Pod"], ["컨테이너 이미지", "A container image"], ["클러스터 인증서", "The cluster certificate"]]
  ),
  question(
    ["Service가 어떤 Pod를 대상으로 삼을지 정하는 것은?", "How does a Service decide which Pods it targets?"],
    [["라벨 셀렉터", "A label selector"], ["Pod 이름 목록", "A list of Pod names"], ["노드 IP 범위", "A node IP range"], ["네임스페이스 크기", "The namespace size"]]
  ),
  question(
    ["클러스터 내부에서만 접근 가능한 기본 Service 타입은?", "Which Service type is reachable only inside the cluster?"],
    ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"]
  ),
  question(
    ["각 노드의 특정 포트로 외부 접근을 여는 Service 타입은?", "Which Service type opens a port on every node for external access?"],
    ["NodePort", "ClusterIP", "ExternalName", "Headless"]
  ),
  question(
    ["클라우드 로드 밸런서를 붙여 주는 Service 타입은?", "Which Service type provisions a cloud load balancer?"],
    ["LoadBalancer", "NodePort", "ClusterIP", "ExternalName"]
  ),
  question(
    ["HTTP 경로와 호스트 기준으로 외부 트래픽을 나누는 객체는?", "Which object routes external HTTP traffic by host and path?"],
    ["Ingress", "Service", "ConfigMap", "PersistentVolume"]
  ),
  question(
    ["클러스터 안에서 Service를 이름으로 찾을 수 있는 이유는?", "Why can a Service be reached by name inside the cluster?"],
    [["클러스터 DNS가 Service 이름을 해석한다", "Cluster DNS resolves Service names"], ["모든 Pod가 IP를 외우고 있다", "Every Pod memorizes the IP addresses"], ["노드가 이름을 브로드캐스트한다", "Nodes broadcast the names"], ["etcd가 직접 라우팅한다", "etcd routes traffic directly"]]
  ),
  question(
    ["Pod의 IP를 직접 참조하면 안 되는 이유는?", "Why should you never hardcode a Pod's IP?"],
    [["Pod가 재생성되면 IP가 바뀐다", "The IP changes whenever the Pod is recreated"], ["IP가 암호화되어 있다", "The IP is encrypted"], ["IP가 노드마다 같다", "Every node has the same IP"], ["IP를 조회할 수 없다", "The IP cannot be read"]]
  ),
  question(
    ["트래픽을 받을 준비가 됐는지 확인하는 검사는?", "Which probe checks whether a container is ready to receive traffic?"],
    [["readiness probe", "The readiness probe"], ["liveness probe", "The liveness probe"], ["startup probe", "The startup probe"], ["health check job", "A health check job"]]
  ),
  question(
    ["컨테이너가 살아 있는지 확인해 실패 시 재시작하는 검사는?", "Which probe restarts a container when it stops responding?"],
    [["liveness probe", "The liveness probe"], ["readiness probe", "The readiness probe"], ["resource quota", "A resource quota"], ["pod disruption budget", "A pod disruption budget"]]
  ),
];

/** LV.4 fleet-commander — ConfigMap/Secret */
const fleetCommanderQuiz: readonly QuizQuestion[] = [
  question(
    ["ConfigMap과 Secret이 하는 일은?", "What do ConfigMaps and Secrets do?"],
    [["설정과 민감 정보를 이미지 밖에서 주입한다", "They inject configuration and sensitive data from outside the image"], ["컨테이너를 실행한다", "They run containers"], ["노드를 추가한다", "They add nodes"], ["네트워크를 라우팅한다", "They route network traffic"]]
  ),
  question(
    ["설정을 이미지에 굽지 않고 분리하는 이유는?", "Why keep configuration out of the image?"],
    [["같은 이미지를 환경마다 다시 빌드 없이 쓸 수 있다", "The same image works in every environment without a rebuild"], ["이미지가 항상 작아진다", "The image is always smaller"], ["빌드가 필요 없어진다", "Builds become unnecessary"], ["보안 검사를 건너뛴다", "Security scanning can be skipped"]]
  ),
  question(
    ["Secret의 기본 저장 방식에 대해 옳은 것은?", "Which is true about how a Secret is stored by default?"],
    [["base64 인코딩일 뿐이라 별도 암호화 설정이 필요하다", "It is only base64-encoded, so encryption at rest must be configured"], ["항상 강력하게 암호화된다", "It is always strongly encrypted"], ["평문 그대로 노출된다", "It is exposed as plaintext to everyone"], ["저장되지 않고 메모리에만 있다", "It is never stored, only kept in memory"]]
  ),
  question(
    ["ConfigMap 값을 컨테이너에 전달하는 방법이 아닌 것은?", "Which is NOT a way to deliver a ConfigMap to a container?"],
    [["이미지 레이어로 굽는다", "Baking it into an image layer"], ["환경 변수로 주입한다", "Injecting it as environment variables"], ["볼륨으로 마운트한다", "Mounting it as a volume"], ["명령 인자로 전달한다", "Passing it as command arguments"]]
  ),
  question(
    ["설정을 볼륨으로 마운트할 때의 장점은?", "What is the advantage of mounting configuration as a volume?"],
    [["값이 바뀌면 파일 내용이 갱신될 수 있다", "The file contents can update when the value changes"], ["Pod가 항상 재시작된다", "The Pod always restarts"], ["값이 자동으로 암호화된다", "The value is encrypted automatically"], ["이미지가 작아진다", "The image gets smaller"]]
  ),
  question(
    ["환경 변수로 주입한 설정을 바꾸면?", "What happens when you change configuration injected as environment variables?"],
    [["Pod를 다시 만들어야 반영된다", "The Pod must be recreated for the change to apply"], ["즉시 자동으로 반영된다", "It applies instantly on its own"], ["다음 배포까지 무시된다", "It is ignored until the next release"], ["ConfigMap이 삭제된다", "The ConfigMap is deleted"]]
  ),
  question(
    ["클러스터 안에서 자원을 논리적으로 나누는 단위는?", "Which unit logically partitions resources inside a cluster?"],
    [["네임스페이스", "A namespace"], ["노드 풀", "A node pool"], ["레이블", "A label"], ["어노테이션", "An annotation"]]
  ),
  question(
    ["네임스페이스별로 사용할 수 있는 자원 총량을 제한하는 것은?", "Which object caps the total resources a namespace may use?"],
    ["ResourceQuota", "LimitRange", "NetworkPolicy", "PodDisruptionBudget"]
  ),
  question(
    ["컨테이너에 requests와 limits를 설정하는 이유는?", "Why set requests and limits on a container?"],
    [["스케줄링 기준을 주고 과도한 자원 사용을 막는다", "They guide scheduling and cap runaway resource use"], ["이미지 크기를 줄인다", "They shrink the image"], ["로그를 줄인다", "They reduce logging"], ["네트워크를 암호화한다", "They encrypt the network"]]
  ),
  question(
    ["Secret을 Git 저장소에 그대로 커밋하면 안 되는 이유는?", "Why must a raw Secret never be committed to Git?"],
    [["base64는 암호화가 아니라 누구나 되돌려 읽을 수 있다", "base64 is not encryption; anyone can decode it"], ["파일 크기가 커지기 때문이다", "It makes the repository larger"], ["YAML 문법이 깨지기 때문이다", "It breaks the YAML syntax"], ["쿠버네티스가 거부하기 때문이다", "Kubernetes rejects it"]]
  ),
];

/** LV.5 cluster-admiral — Autoscaling */
const clusterAdmiralQuiz: readonly QuizQuestion[] = [
  question(
    ["오토스케일링이 하는 일은?", "What does autoscaling do?"],
    [["부하나 지표에 따라 실행 복제본 수를 조절한다", "It adjusts the replica count based on load or metrics"], ["이미지를 자동으로 빌드한다", "It builds images automatically"], ["로그를 자동 삭제한다", "It deletes logs automatically"], ["인증서를 갱신한다", "It renews certificates"]]
  ),
  question(
    ["Pod 개수를 늘리고 줄이는 오토스케일러는?", "Which autoscaler adds and removes Pods?"],
    [["HorizontalPodAutoscaler", "The HorizontalPodAutoscaler"], ["VerticalPodAutoscaler", "The VerticalPodAutoscaler"], ["ClusterAutoscaler", "The ClusterAutoscaler"], ["DaemonSet", "A DaemonSet"]]
  ),
  question(
    ["Pod 하나의 CPU와 메모리 요청량을 조정하는 것은?", "Which adjusts a single Pod's CPU and memory requests?"],
    [["VerticalPodAutoscaler", "The VerticalPodAutoscaler"], ["HorizontalPodAutoscaler", "The HorizontalPodAutoscaler"], ["ClusterAutoscaler", "The ClusterAutoscaler"], ["ResourceQuota", "A ResourceQuota"]]
  ),
  question(
    ["Pod를 놓을 자리가 없을 때 노드를 늘리는 것은?", "Which adds nodes when there is nowhere to place a Pod?"],
    [["ClusterAutoscaler", "The ClusterAutoscaler"], ["HorizontalPodAutoscaler", "The HorizontalPodAutoscaler"], ["kube-proxy", "kube-proxy"], ["Ingress 컨트롤러", "The ingress controller"]]
  ),
  question(
    ["HPA가 동작하려면 반드시 설정돼 있어야 하는 것은?", "What must be configured for an HPA to work?"],
    [["컨테이너의 resource requests와 지표 수집", "Container resource requests and a metrics source"], ["노드 수가 고정돼 있어야 한다", "A fixed node count"], ["Ingress가 있어야 한다", "An Ingress must exist"], ["Secret이 있어야 한다", "A Secret must exist"]]
  ),
  question(
    ["복제본 수가 짧은 간격으로 오르내리는 현상을 막는 설정은?", "Which setting stops the replica count from oscillating rapidly?"],
    [["스케일 안정화 윈도우", "A scale stabilization window"], ["리소스 쿼터", "A resource quota"], ["노드 셀렉터", "A node selector"], ["서비스 어카운트", "A service account"]]
  ),
  question(
    ["무중단 운영을 위해 동시에 내려갈 수 있는 Pod 수를 제한하는 것은?", "Which object limits how many Pods may go down at once?"],
    ["PodDisruptionBudget", "ResourceQuota", "NetworkPolicy", "PriorityClass"]
  ),
  question(
    ["스케일 아웃만으로 해결되지 않는 대표적인 병목은?", "Which bottleneck scaling out alone does NOT solve?"],
    [["하나의 데이터베이스에 몰리는 쓰기 부하", "Write load concentrated on a single database"], ["웹 서버의 CPU 부족", "Insufficient CPU on web servers"], ["요청 수 증가", "A rise in request volume"], ["정적 자원 트래픽", "Static asset traffic"]]
  ),
  question(
    ["요청량이 아니라 큐 길이로 확장해야 하는 워크로드는?", "Which workload should scale on queue depth rather than request rate?"],
    [["비동기 작업 처리기", "An asynchronous job worker"], ["정적 파일 서버", "A static file server"], ["로그인 API", "A login API"], ["헬스 체크 엔드포인트", "A health check endpoint"]]
  ),
  question(
    ["오토스케일링을 설정한 뒤에도 반드시 필요한 것은?", "What is still required after autoscaling is configured?"],
    [["실제 부하에서 동작을 검증하고 상한을 두는 것", "Verifying behavior under real load and setting an upper bound"], ["복제본 수를 수동으로 고정하는 것", "Pinning the replica count by hand"], ["모니터링을 끄는 것", "Turning monitoring off"], ["노드를 모두 같은 크기로 두는 것", "Making every node identical in size"]]
  ),
];

const kubernetesQuiz: readonly (readonly QuizQuestion[])[] = [
  podCadetQuiz,
  clusterPilotQuiz,
  podHelmsmanQuiz,
  fleetCommanderQuiz,
  clusterAdmiralQuiz,
];

export default kubernetesQuiz;
