import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 packet-crab — IP address */
const packetCrabQuiz: readonly QuizQuestion[] = [
  question(
    ["IP 주소가 하는 일은?", "What does an IP address do?"],
    [["네트워크에서 호스트의 논리적 위치를 식별한다", "It identifies a host's logical location on a network"], ["파일의 저장 위치를 가리킨다", "It points at where a file is stored"], ["사용자의 비밀번호를 담는다", "It holds a user's password"], ["웹 페이지의 제목을 정한다", "It sets a web page title"]]
  ),
  question(
    ["IPv4 주소의 길이는?", "How long is an IPv4 address?"],
    [["32비트", "32 bits"], ["64비트", "64 bits"], ["128비트", "128 bits"], ["16비트", "16 bits"]]
  ),
  question(
    ["IPv6 주소의 길이는?", "How long is an IPv6 address?"],
    [["128비트", "128 bits"], ["32비트", "32 bits"], ["64비트", "64 bits"], ["256비트", "256 bits"]]
  ),
  question(
    ["자기 자신을 가리키는 루프백 주소는?", "Which address is the loopback that points at the machine itself?"],
    ["127.0.0.1", "0.0.0.0", "255.255.255.255", "192.168.0.1"]
  ),
  question(
    ["인터넷에 직접 노출되지 않는 사설 IP 대역은?", "Which range is a private IP block not routed on the internet?"],
    ["192.168.0.0/16", "8.8.8.0/24", "1.1.1.0/24", "203.0.0.0/8"]
  ),
  question(
    ["주소에서 네트워크 부분과 호스트 부분을 나누는 것은?", "What separates the network part of an address from the host part?"],
    [["서브넷 마스크", "The subnet mask"], ["포트 번호", "The port number"], ["MAC 주소", "The MAC address"], ["TTL 값", "The TTL value"]]
  ),
  question(
    ["한 기기 안에서 어떤 프로그램이 통신할지 구분하는 번호는?", "Which number distinguishes which program on a host is communicating?"],
    [["포트 번호", "The port number"], ["IP 주소", "The IP address"], ["MAC 주소", "The MAC address"], ["시퀀스 번호", "The sequence number"]]
  ),
  question(["HTTPS가 기본으로 사용하는 포트는?", "Which port does HTTPS use by default?"], ["443", "80", "22", "53"]),
  question(
    ["사설 IP를 공인 IP로 바꿔 인터넷에 내보내는 기술은?", "Which technique maps private IPs onto a public one for internet access?"],
    ["NAT", "DHCP", "ARP", "VLAN"]
  ),
  question(
    ["기기가 네트워크에 접속할 때 IP를 자동으로 받아오는 방식은?", "How does a device obtain an IP address automatically when it joins a network?"],
    ["DHCP", "DNS", "NAT", "ICMP"]
  ),
];

/** LV.2 router-weaver — DNS */
const routerWeaverQuiz: readonly QuizQuestion[] = [
  question(
    ["DNS가 하는 일은?", "What does DNS do?"],
    [["도메인 이름을 IP 주소로 변환한다", "It translates a domain name into an IP address"], ["패킷의 경로를 선택한다", "It chooses a packet's route"], ["데이터를 암호화한다", "It encrypts data"], ["대역폭을 나눈다", "It divides bandwidth"]]
  ),
  question(["도메인을 IPv4 주소에 연결하는 DNS 레코드는?", "Which DNS record maps a domain to an IPv4 address?"], ["A", "MX", "TXT", "NS"]),
  question(["도메인을 다른 도메인 이름에 연결하는 레코드는?", "Which record points one domain name at another?"], ["CNAME", "A", "AAAA", "SOA"]),
  question(["메일 서버를 지정하는 DNS 레코드는?", "Which DNS record designates a mail server?"], ["MX", "A", "PTR", "SRV"]),
  question(["도메인을 IPv6 주소에 연결하는 레코드는?", "Which record maps a domain to an IPv6 address?"], ["AAAA", "A", "CNAME", "NS"]),
  question(
    ["DNS 레코드의 TTL이 뜻하는 것은?", "What does a DNS record's TTL mean?"],
    [["응답을 캐시해도 되는 시간", "How long the answer may be cached"], ["요청의 최대 크기", "The maximum request size"], ["서버까지의 홉 수", "The hop count to the server"], ["도메인의 만료일", "The domain's expiry date"]]
  ),
  question(
    ["DNS 레코드를 바꿨는데 바로 반영되지 않는 흔한 이유는?", "Why does a changed DNS record often not take effect right away?"],
    [["이전 응답이 TTL 동안 캐시에 남아 있다", "The old answer stays cached for the TTL"], ["레코드가 삭제됐기 때문이다", "The record was deleted"], ["서버가 재시작되지 않아서다", "The server was not restarted"], ["도메인이 만료됐기 때문이다", "The domain expired"]]
  ),
  question(
    ["도메인 이름을 재귀적으로 풀어 주는 서버를 부르는 말은?", "What is a server that resolves a name on your behalf called?"],
    [["리졸버", "A resolver"], ["프록시", "A proxy"], ["게이트웨이", "A gateway"], ["스위치", "A switch"]]
  ),
  question(
    ["도메인 이름 최상위에 있는 서버는?", "Which servers sit at the very top of the DNS hierarchy?"],
    [["루트 네임 서버", "The root name servers"], ["로컬 리졸버", "Local resolvers"], ["권한 없는 캐시 서버", "Non-authoritative caches"], ["CDN 엣지 노드", "CDN edge nodes"]]
  ),
  question(
    ["DNS 조회 결과를 확인하는 대표적인 명령은?", "Which command is commonly used to inspect a DNS lookup?"],
    ["dig", "ping", "netstat", "ifconfig"]
  ),
];

/** LV.3 packet-relay — TCP */
const packetRelayQuiz: readonly QuizQuestion[] = [
  question(
    ["TCP가 제공하는 것은?", "What does TCP provide?"],
    [["순서와 재전송을 보장하는 신뢰성 있는 전송", "Reliable delivery with ordering and retransmission"], ["가장 빠른 무보장 전송", "The fastest possible delivery with no guarantees"], ["데이터 암호화", "Data encryption"], ["도메인 이름 변환", "Domain name translation"]]
  ),
  question(
    ["TCP 연결을 여는 3단계 과정을 부르는 말은?", "What is the three-step process that opens a TCP connection called?"],
    [["3-way 핸드셰이크", "The three-way handshake"], ["브로드캐스트", "A broadcast"], ["폴링", "Polling"], ["멀티플렉싱", "Multiplexing"]]
  ),
  question(
    ["3-way 핸드셰이크에서 주고받는 순서는?", "What is the order of a three-way handshake?"],
    ["SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "SYN → ACK → SYN-ACK", "SYN-ACK → SYN → ACK"]
  ),
  question(
    ["TCP와 달리 UDP의 특징은?", "How does UDP differ from TCP?"],
    [["순서와 도착을 보장하지 않지만 오버헤드가 작다", "It guarantees neither order nor delivery, but has less overhead"], ["항상 더 안전하다", "It is always more secure"], ["연결을 반드시 먼저 맺는다", "It always establishes a connection first"], ["재전송을 자동으로 한다", "It retransmits automatically"]]
  ),
  question(
    ["실시간 영상 통화처럼 지연이 중요한 통신에 어울리는 것은?", "Which suits latency-sensitive traffic such as live video calls?"],
    ["UDP", "TCP", "FTP", "SMTP"]
  ),
  question(
    ["패킷이 무한히 떠도는 것을 막는 필드는?", "Which field stops a packet from circulating forever?"],
    ["TTL", "MTU", "MSS", "CRC"]
  ),
  question(
    ["네트워크 혼잡을 감지해 전송 속도를 조절하는 TCP 기능은?", "Which TCP feature slows transmission when the network is congested?"],
    [["혼잡 제어", "Congestion control"], ["오류 정정 부호", "Error-correcting codes"], ["포트 포워딩", "Port forwarding"], ["로드 밸런싱", "Load balancing"]]
  ),
  question(
    ["수신 측이 감당할 수 있는 양만 보내게 하는 기능은?", "Which feature sends only as much as the receiver can absorb?"],
    [["흐름 제어", "Flow control"], ["혼잡 제어", "Congestion control"], ["분할 전송", "Fragmentation"], ["재정렬", "Reordering"]]
  ),
  question(
    ["연결이 되는지 간단히 확인할 때 쓰는 명령은?", "Which command quickly checks whether a host is reachable?"],
    ["ping", "dig", "chmod", "curl -X POST"]
  ),
  question(
    ["요청이 어떤 경로를 거쳐 가는지 확인하는 명령은?", "Which command shows the path a request takes to a host?"],
    ["traceroute", "ping", "nslookup", "netcat"]
  ),
];

/** LV.4 network-orchestrator — Router */
const networkOrchestratorQuiz: readonly QuizQuestion[] = [
  question(
    ["라우터가 하는 일은?", "What does a router do?"],
    [["서로 다른 네트워크 사이에서 패킷의 경로를 고른다", "It chooses packet paths between different networks"], ["같은 네트워크 안에서만 프레임을 전달한다", "It forwards frames only inside one network"], ["도메인 이름을 변환한다", "It translates domain names"], ["데이터를 암호화한다", "It encrypts data"]]
  ),
  question(
    ["스위치와 라우터의 차이는?", "How does a switch differ from a router?"],
    [["스위치는 같은 네트워크 안, 라우터는 네트워크 사이를 다룬다", "A switch works inside one network, a router between networks"], ["스위치는 IP를, 라우터는 MAC을 본다", "A switch reads IP and a router reads MAC"], ["둘은 완전히 같다", "They are exactly the same"], ["라우터는 케이블만 연결한다", "A router only joins cables"]]
  ),
  question(
    ["목적지가 라우팅 표에 없을 때 패킷을 보내는 경로는?", "Where does a packet go when no routing table entry matches?"],
    [["기본 게이트웨이", "The default gateway"], ["루프백 인터페이스", "The loopback interface"], ["브로드캐스트 주소", "The broadcast address"], ["DNS 서버", "The DNS server"]]
  ),
  question(
    ["라우팅 표에서 여러 경로가 일치할 때 선택되는 것은?", "When several routes match, which one is chosen?"],
    [["가장 구체적인(긴 접두사) 경로", "The most specific route, with the longest prefix"], ["가장 먼저 등록된 경로", "The route added first"], ["가장 짧은 접두사의 경로", "The route with the shortest prefix"], ["무작위로 하나", "One picked at random"]]
  ),
  question(
    ["IP 주소를 MAC 주소로 알아내는 프로토콜은?", "Which protocol resolves an IP address to a MAC address?"],
    ["ARP", "DNS", "DHCP", "ICMP"]
  ),
  question(
    ["ping이 사용하는 프로토콜은?", "Which protocol does ping use?"],
    ["ICMP", "TCP", "UDP", "HTTP"]
  ),
  question(
    ["방화벽이 기본적으로 판단 기준으로 삼는 것은?", "What does a firewall primarily decide on?"],
    [["출발지·목적지 주소와 포트, 프로토콜", "Source and destination address, port and protocol"], ["파일 이름", "File names"], ["사용자의 비밀번호", "The user's password"], ["HTML 내용", "The HTML content"]]
  ),
  question(
    ["한 네트워크를 논리적으로 나누는 기술은?", "Which technique logically divides one physical network?"],
    ["VLAN", "NAT", "CDN", "MTU"]
  ),
  question(
    ["한 번에 보낼 수 있는 최대 패킷 크기를 뜻하는 말은?", "What is the largest packet size that can be sent in one piece called?"],
    ["MTU", "TTL", "RTT", "QoS"]
  ),
  question(
    ["서비스가 안 될 때 네트워크 계층을 확인하는 합리적 순서는?", "What is a sensible order for checking the network when a service is down?"],
    [["IP 연결 → DNS 해석 → 포트 접근 → 애플리케이션 응답", "IP reachability → DNS resolution → port access → application response"], ["애플리케이션 → 케이블 → 전원 → IP", "Application → cables → power → IP"], ["DNS → 전원 → HTML → IP", "DNS → power → HTML → IP"], ["포트 → 비밀번호 → 방화벽 로그만", "Port → password → firewall logs only"]]
  ),
];

/** LV.5 protocol-nexus — Load balancer */
const protocolNexusQuiz: readonly QuizQuestion[] = [
  question(
    ["로드 밸런서의 역할은?", "What is a load balancer for?"],
    [["여러 서버에 요청을 분산한다", "It spreads requests across several servers"], ["요청을 하나의 서버로 고정한다", "It pins every request to one server"], ["데이터베이스를 백업한다", "It backs up the database"], ["도메인을 등록한다", "It registers domains"]]
  ),
  question(
    ["요청을 순서대로 돌아가며 나눠 주는 방식은?", "Which method hands requests to servers in turn?"],
    [["라운드 로빈", "Round robin"], ["최소 연결", "Least connections"], ["해시 기반", "Hash based"], ["가중 무작위", "Weighted random"]]
  ),
  question(
    ["현재 연결이 가장 적은 서버로 보내는 방식은?", "Which method sends traffic to the server with the fewest open connections?"],
    [["최소 연결", "Least connections"], ["라운드 로빈", "Round robin"], ["랜덤", "Random"], ["고정 할당", "Static assignment"]]
  ),
  question(
    ["로드 밸런서가 문제 있는 서버를 빼내기 위해 주기적으로 하는 검사는?", "What periodic check lets a load balancer remove a failing server?"],
    [["헬스 체크", "A health check"], ["로그 회전", "Log rotation"], ["캐시 무효화", "Cache invalidation"], ["인증 갱신", "Credential rotation"]]
  ),
  question(
    ["L4와 L7 로드 밸런싱의 차이는?", "How does L4 load balancing differ from L7?"],
    [["L4는 IP와 포트로, L7은 HTTP 내용까지 보고 분배한다", "L4 routes on IP and port, L7 also inspects HTTP content"], ["L4가 항상 더 느리다", "L4 is always slower"], ["L7은 TCP를 쓰지 않는다", "L7 does not use TCP"], ["둘은 같은 계층이다", "They work at the same layer"]]
  ),
  question(
    ["같은 사용자를 계속 같은 서버로 보내는 설정을 부르는 말은?", "What is it called when one user keeps landing on the same server?"],
    [["세션 고정(스티키 세션)", "Session affinity, or sticky sessions"], ["라운드 로빈", "Round robin"], ["오토스케일링", "Autoscaling"], ["페일오버", "Failover"]]
  ),
  question(
    ["스티키 세션에 의존하면 생기는 문제는?", "What problem comes from relying on sticky sessions?"],
    [["그 서버가 죽으면 사용자 상태를 잃는다", "Losing that server loses the user's state"], ["요청이 암호화되지 않는다", "Requests stop being encrypted"], ["DNS가 동작하지 않는다", "DNS stops working"], ["포트가 고갈된다", "Ports run out"]]
  ),
  question(
    ["로드 밸런서에서 TLS를 종료한다는 말의 뜻은?", "What does terminating TLS at the load balancer mean?"],
    [["암호화를 여기서 풀고 뒤쪽으로 전달한다", "Encryption is unwrapped here before traffic goes to the backends"], ["TLS 인증서를 폐기한다", "The TLS certificate is revoked"], ["연결을 강제로 끊는다", "The connection is forcibly closed"], ["HTTPS를 차단한다", "HTTPS is blocked"]]
  ),
  question(
    ["장애가 난 구성 요소를 대기 중인 예비로 넘기는 것은?", "What is switching from a failed component to a standby called?"],
    [["페일오버", "Failover"], ["롤백", "Rollback"], ["샤딩", "Sharding"], ["스로틀링", "Throttling"]]
  ),
  question(
    ["정적 자원을 사용자와 가까운 곳에서 제공하는 것은?", "What serves static assets from a location close to the user?"],
    ["CDN", ["로드 밸런서", "A load balancer"], ["역방향 프록시만", "A reverse proxy alone"], ["DNS 서버", "A DNS server"]]
  ),
];

const networkQuiz: readonly (readonly QuizQuestion[])[] = [
  packetCrabQuiz,
  routerWeaverQuiz,
  packetRelayQuiz,
  networkOrchestratorQuiz,
  protocolNexusQuiz,
];

export default networkQuiz;
