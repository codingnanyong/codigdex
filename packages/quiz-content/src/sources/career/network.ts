import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

// Facts and boundary conditions: RFC 791/8200 (IP), 1918 (private space),
// 1034/1035/3596 (DNS), 2131 (DHCP), 826 (ARP), 9293/5681 (TCP), 1812 (routing).
// Load balancing: https://nginx.org/en/docs/http/load_balancing.html
// TLS: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html

/** LV.1 packet-crab — IP address */
const packetCrabQuiz: readonly QuizQuestion[] = [
  question(
    ["IP 주소가 하는 일은?", "What does an IP address do?"],
    [["네트워크에서 호스트의 논리적 위치를 식별한다", "It identifies a host's logical location on a network"], ["파일의 저장 위치를 가리킨다", "It points at where a file is stored"], ["사용자의 비밀번호를 담는다", "It holds a user's password"], ["웹 페이지의 제목을 정한다", "It sets a web page title"]], 0,
    ["IP 주소는 패킷을 보낼 논리적 목적지를 나타내요. 파일 경로나 사용자의 신원과는 달라요.", "An IP address identifies a logical packet destination. It is different from a file path or a user's identity."]
  ),
  question(
    ["IPv4 주소의 길이는?", "How long is an IPv4 address?"],
    [["32비트", "32 bits"], ["64비트", "64 bits"], ["128비트", "128 bits"], ["16비트", "16 bits"]], 0,
    ["IPv4 주소는 8비트씩 네 묶음, 총 32비트예요. 192.168.0.1처럼 점으로 구분해 적어요.", "An IPv4 address has four 8-bit octets, totaling 32 bits. Dotted notation writes those octets as in 192.168.0.1."]
  ),
  question(
    ["IPv6 주소의 길이는?", "How long is an IPv6 address?"],
    [["128비트", "128 bits"], ["32비트", "32 bits"], ["64비트", "64 bits"], ["256비트", "256 bits"]], 0,
    ["IPv6는 128비트 주소를 사용해 IPv4보다 넓은 주소 공간을 제공해요. 보통 16진수 묶음을 콜론으로 구분해요.", "IPv6 uses 128-bit addresses, giving it a larger address space than IPv4. Its usual notation separates hexadecimal groups with colons."]
  ),
  question(
    ["다음 중 IPv4에서 자기 자신에게 통신할 때 쓰는 루프백 주소는?", "Which of these is an IPv4 loopback address for communicating with the local host?"],
    ["127.0.0.1", "0.0.0.0", "255.255.255.255", "192.168.0.1"], 0,
    ["127.0.0.1로 보낸 통신은 같은 호스트 안에서 처리돼요. 0.0.0.0은 루프백 주소가 아니고, IPv6의 루프백은 ::1이에요.", "Traffic to 127.0.0.1 stays on the local host. 0.0.0.0 is not a loopback address; the IPv6 loopback is ::1."]
  ),
  question(
    ["다음 중 공용 인터넷에서 전역 라우팅하지 않는 RFC 1918 사설 IPv4 대역은?", "Which is an RFC 1918 private IPv4 block that is not globally routed on the public internet?"],
    ["192.168.0.0/16", "8.8.8.0/24", "1.1.1.0/24", "203.0.0.0/8"], 0,
    ["192.168.0.0/16은 사설 주소 대역이에요. 사설망 내부에서는 통신할 수 있지만, 이 주소를 쓰는 것만으로 보안이 보장되지는 않아요.", "192.168.0.0/16 is private address space. It works within private networks, but using a private address alone does not guarantee security."]
  ),
  question(
    ["IPv4 주소에서 네트워크 부분과 호스트 부분을 구분하는 것은?", "What separates the network and host portions of an IPv4 address?"],
    [["서브넷 마스크", "The subnet mask"], ["포트 번호", "The port number"], ["MAC 주소", "The MAC address"], ["TTL 값", "The TTL value"]], 0,
    ["서브넷 마스크의 1인 비트가 네트워크 부분을 표시해요. /24는 앞의 24비트가 네트워크 접두사라는 뜻이에요.", "The set bits in a subnet mask identify the network portion. /24 means that the first 24 bits form the network prefix."]
  ),
  question(
    ["같은 호스트의 TCP·UDP 통신에서 서비스의 종단점을 구분하는 번호는?", "Which number distinguishes service endpoints for TCP or UDP on the same host?"],
    [["포트 번호", "The port number"], ["IP 주소", "The IP address"], ["MAC 주소", "The MAC address"], ["시퀀스 번호", "The sequence number"]], 0,
    ["IP 주소가 호스트를 찾는 데 쓰인다면 포트는 그 안의 통신 종단점을 구분해요. 같은 숫자여도 TCP 포트와 UDP 포트는 별개예요.", "An IP address locates the host; a port identifies a transport endpoint on it. TCP and UDP have separate port spaces even for the same number."]
  ),
  question(["HTTPS URL에서 포트를 생략했을 때의 기본 포트는?", "What is the default port when an HTTPS URL omits the port?"], ["443", "80", "22", "53"], 0,
    ["HTTPS의 기본 포트는 443이에요. HTTP는 기본 80이며, URL에 포트를 명시하면 다른 포트도 사용할 수 있어요.", "HTTPS defaults to port 443, while HTTP defaults to 80. An explicit port in a URL can select a different port."]),
  question(
    ["사설 IP를 공인 IP로 바꿔 인터넷에 내보내는 기술은?", "Which technique maps private IPs onto a public one for internet access?"],
    ["NAT", "DHCP", "ARP", "VLAN"], 0,
    ["NAT는 경계를 지나는 패킷의 주소를 변환해요. DHCP는 주소 할당, ARP는 같은 링크의 주소 해석으로 역할이 달라요.", "NAT translates packet addresses across a network boundary. DHCP allocates addresses; ARP resolves link-layer addresses on a local link."]
  ),
  question(
    ["서버에서 IPv4 주소와 네트워크 설정을 자동으로 임대받는 방식은?", "Which protocol leases an IPv4 address and network configuration from a server?"],
    ["DHCP", "DNS", "NAT", "ICMP"], 0,
    ["DHCP는 주소를 일정 기간 임대하고 네트워크 설정을 전달해요. 이름을 주소로 찾는 DNS나 주소를 변환하는 NAT와는 달라요.", "DHCP leases an address and supplies network configuration. DNS resolves names, while NAT translates addresses."]
  ),
];

/** LV.2 router-weaver — DNS */
const routerWeaverQuiz: readonly QuizQuestion[] = [
  question(
    ["브라우저가 도메인 이름에 대응하는 IP 주소를 알아내려 한다. 이때 DNS의 역할은?", "A browser needs the IP addresses associated with a domain name. What is DNS responsible for?"],
    [["도메인 이름을 IP 주소로 변환한다", "It translates a domain name into an IP address"], ["패킷의 경로를 선택한다", "It chooses a packet's route"], ["데이터를 암호화한다", "It encrypts data"], ["대역폭을 나눈다", "It divides bandwidth"]], 0,
    ["DNS는 이름에 연결된 레코드를 조회해요. 주소 조회 외에도 메일 서버 정보 등을 제공하며, 실제 패킷 경로를 고르는 역할은 라우팅이에요.", "DNS looks up records associated with names, including addresses and mail information. Routing, rather than DNS, selects packet paths."]
  ),
  question(["도메인을 IPv4 주소에 연결하는 DNS 레코드는?", "Which DNS record maps a domain to an IPv4 address?"], ["A", "MX", "TXT", "NS"], 0,
    ["A 레코드는 이름에 IPv4 주소를 연결해요. IPv6 주소를 넣으려면 AAAA 레코드를 사용해요.", "An A record associates a name with an IPv4 address. IPv6 addresses use AAAA records instead."]),
  question(["도메인을 다른 도메인 이름에 연결하는 레코드는?", "Which record points one domain name at another?"], ["CNAME", "A", "AAAA", "SOA"], 0,
    ["CNAME은 별칭 이름을 정식 이름에 연결해요. IP 주소 자체를 적는 A·AAAA 레코드와 구분하세요.", "A CNAME maps an alias to a canonical name. A and AAAA records hold addresses rather than an alias target."]),
  question(["메일 서버를 지정하는 DNS 레코드는?", "Which DNS record designates a mail server?"], ["MX", "A", "PTR", "SRV"], 0,
    ["MX 레코드는 해당 도메인의 메일을 받을 서버 이름과 우선순위를 알려줘요. 서버의 IP 주소는 별도로 조회해요.", "An MX record names a domain's mail exchanger and its preference. The server's address is resolved separately."]),
  question(["도메인을 IPv6 주소에 연결하는 레코드는?", "Which record maps a domain to an IPv6 address?"], ["AAAA", "A", "CNAME", "NS"], 0,
    ["AAAA 레코드는 128비트 IPv6 주소를 담아요. A는 IPv4, CNAME은 다른 이름으로의 별칭이에요.", "An AAAA record holds a 128-bit IPv6 address. A is for IPv4, while CNAME points to another name."]),
  question(
    ["DNS 레코드의 TTL이 뜻하는 것은?", "What does a DNS record's TTL mean?"],
    [["응답을 캐시해도 되는 시간", "How long the answer may be cached"], ["요청의 최대 크기", "The maximum request size"], ["서버까지의 홉 수", "The hop count to the server"], ["도메인의 만료일", "The domain's expiry date"]], 0,
    ["DNS의 TTL은 레코드의 캐시 유효 시간을 초 단위로 나타내요. IP 패킷의 홉 제한이나 도메인 등록 만료일과는 다른 값이에요.", "A DNS TTL expresses a record's cache lifetime in seconds. It is different from an IP packet's hop limit or domain registration expiry."]
  ),
  question(
    ["권한 DNS의 주소는 바뀌었지만 재귀 리졸버는 이전 응답을 준다. 이전 레코드의 TTL이 남아 있다면 흔한 원인은?", "The authoritative address changed, but a recursive resolver still returns the old answer. Its cached TTL has not expired. What explains this?"],
    [["이전 응답이 TTL 동안 캐시에 남아 있다", "The old answer stays cached for the TTL"], ["레코드가 삭제됐기 때문이다", "The record was deleted"], ["서버가 재시작되지 않아서다", "The server was not restarted"], ["도메인이 만료됐기 때문이다", "The domain expired"]], 0,
    ["권한 서버의 수정은 이미 저장된 캐시를 즉시 지우지 않아요. 리졸버가 가진 이전 응답의 남은 TTL을 확인해 보세요.", "Changing an authoritative record does not immediately erase existing caches. Check the remaining TTL on the resolver's cached answer."]
  ),
  question(
    ["클라이언트를 대신해 DNS 계층에 질의하고 결과를 캐시하는 재귀 서버는?", "Which recursive DNS server queries the hierarchy and caches answers on behalf of clients?"],
    [["재귀 리졸버", "A recursive resolver"], ["프록시", "A proxy"], ["게이트웨이", "A gateway"], ["스위치", "A switch"]], 0,
    ["재귀 리졸버는 캐시를 확인하고 필요하면 다른 DNS 서버에 질의해 답을 구해요. 권한 서버는 자신이 담당하는 영역의 정보를 제공해요.", "A recursive resolver checks its cache and queries other DNS servers as needed. An authoritative server supplies information for its own zone."]
  ),
  question(
    ["도메인 이름 최상위에 있는 서버는?", "Which servers sit at the very top of the DNS hierarchy?"],
    [["루트 네임 서버", "The root name servers"], ["로컬 리졸버", "Local resolvers"], ["권한 없는 캐시 서버", "Non-authoritative caches"], ["CDN 엣지 노드", "CDN edge nodes"]], 0,
    ["루트 네임 서버는 DNS 이름 공간의 최상위를 담당해요. 보통 최상위 도메인의 서버를 안내하며 모든 웹사이트 주소를 직접 보관하지는 않아요.", "Root name servers serve the top of the DNS namespace. They usually refer queries to top-level-domain servers rather than storing every website's address."]
  ),
  question(
    ["A·MX 같은 DNS 레코드 종류를 지정해 응답을 조사하는 명령은?", "Which command queries and inspects specific DNS record types such as A or MX?"],
    ["dig", "ping", "netstat", "ifconfig"], 0,
    ["dig example.com A처럼 레코드 종류를 지정할 수 있어요. ping은 주로 ICMP 응답을 확인하므로 DNS 레코드 조사와 목적이 달라요.", "A command such as dig example.com A requests a specific record type. ping primarily checks ICMP responses rather than inspecting DNS records."]
  ),
];

/** LV.3 packet-relay — TCP */
const packetRelayQuiz: readonly QuizQuestion[] = [
  question(
    ["TCP가 제공하는 것은?", "What does TCP provide?"],
    [["순서 있는 바이트 스트림과 손실 복구", "An ordered byte stream with loss recovery"], ["가장 빠른 무보장 전송", "The fastest possible delivery with no guarantees"], ["데이터 암호화", "Data encryption"], ["도메인 이름 변환", "Domain name translation"]], 0,
    ["TCP는 바이트 순서와 손실 복구를 관리해요. 연결이 영구적으로 끊겨도 전달을 보장하는 것은 아니며, 암호화는 TLS 같은 별도 계층이 맡아요.", "TCP manages byte ordering and recovery from loss. It cannot ensure delivery after a permanent connection failure, and encryption belongs to a separate layer such as TLS."]
  ),
  question(
    ["TCP 연결을 여는 3단계 과정을 부르는 말은?", "What is the three-step process that opens a TCP connection called?"],
    [["3-way 핸드셰이크", "The three-way handshake"], ["브로드캐스트", "A broadcast"], ["폴링", "Polling"], ["멀티플렉싱", "Multiplexing"]], 0,
    ["일반적인 TCP 연결은 세 번의 메시지 교환으로 양쪽의 초기 시퀀스 번호를 확인해요. TCP 연결을 여는 과정과 TLS 협상은 구분해야 해요.", "The usual TCP opening exchanges three messages to acknowledge both initial sequence numbers. Opening TCP and negotiating TLS are separate steps."]
  ),
  question(
    ["클라이언트가 TCP 연결을 시작하고 서버가 응답하는 일반적인 핸드셰이크 순서는?", "What is the usual TCP handshake order when a client opens a connection and a server responds?"],
    ["SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "SYN → ACK → SYN-ACK", "SYN-ACK → SYN → ACK"], 0,
    ["클라이언트의 SYN에 서버가 SYN-ACK으로 답하고, 클라이언트가 ACK으로 확인해요. SYN은 연결 시작, ACK은 수신 확인을 나타내요.", "The client sends SYN, the server replies with SYN-ACK, and the client acknowledges with ACK. SYN opens the exchange; ACK acknowledges receipt."]
  ),
  question(
    ["TCP와 달리 UDP의 특징은?", "How does UDP differ from TCP?"],
    [["순서와 도착을 보장하지 않지만 오버헤드가 작다", "It guarantees neither order nor delivery, but has less overhead"], ["항상 더 안전하다", "It is always more secure"], ["연결을 반드시 먼저 맺는다", "It always establishes a connection first"], ["재전송을 자동으로 한다", "It retransmits automatically"]], 0,
    ["UDP 자체에는 연결 협상이나 순서 보장·자동 재전송이 없어요. 필요한 신뢰성 처리는 응용 프로토콜이 추가할 수 있으며 UDP가 항상 빠르거나 안전한 것은 아니에요.", "UDP itself has no connection handshake, ordering guarantee or automatic retransmission. Applications can add reliability; UDP is not automatically faster or more secure."]
  ),
  question(
    ["통화 앱이 일부 음성 손실을 허용하고 재전송 대기보다 낮은 지연을 우선한다. 앱에서 전송 제어를 설계할 때 적합한 기반은?", "A call app tolerates some audio loss and prioritizes low latency over waiting for retransmission. Which transport is a suitable basis for application-controlled delivery?"],
    ["UDP", "TCP", "FTP", "SMTP"], 0,
    ["이 조건에서는 UDP 위에서 손실·지연 처리를 설계할 수 있어요. 실시간 서비스가 언제나 UDP만 쓰는 것은 아니며, FTP·SMTP는 전송 계층 프로토콜이 아니에요.", "Under these conditions, the app can manage loss and delay over UDP. Real-time services do not always use only UDP; FTP and SMTP are application protocols."]
  ),
  question(
    ["IPv4 패킷이 라우팅 루프를 무한히 도는 것을 제한하는 헤더 필드는?", "Which IPv4 header field limits a packet's lifetime in a routing loop?"],
    ["TTL", "MTU", "MSS", "CRC"], 0,
    ["라우터는 IPv4의 TTL을 줄이고 값이 소진되면 패킷을 버려요. IPv6에서는 Hop Limit이 이 역할을 하며, DNS 레코드의 TTL과는 의미가 달라요.", "Routers decrement the IPv4 TTL and discard packets when it is exhausted. IPv6 uses Hop Limit; a DNS record's TTL has a different meaning."]
  ),
  question(
    ["네트워크 혼잡을 감지해 전송 속도를 조절하는 TCP 기능은?", "Which TCP feature slows transmission when the network is congested?"],
    [["혼잡 제어", "Congestion control"], ["오류 정정 부호", "Error-correcting codes"], ["포트 포워딩", "Port forwarding"], ["로드 밸런싱", "Load balancing"]], 0,
    ["혼잡 제어는 네트워크 경로의 혼잡 신호를 보고 전송량을 조절해요. 수신 버퍼의 여유를 따르는 흐름 제어와 구분하세요.", "Congestion control adjusts sending in response to network congestion. Flow control instead follows the receiver's available capacity."]
  ),
  question(
    ["네트워크 경로에는 여유가 있지만 TCP 수신 버퍼가 가득 차 간다. 수신 윈도에 맞춰 송신량을 제한하는 기능은?", "The path has spare capacity, but a TCP receiver's buffer is filling. Which feature limits sending according to the advertised receive window?"],
    [["흐름 제어", "Flow control"], ["혼잡 제어", "Congestion control"], ["분할 전송", "Fragmentation"], ["재정렬", "Reordering"]], 0,
    ["수신 측이 알린 윈도는 받아들일 수 있는 데이터 양을 나타내요. 송신 측은 이 한도와 별도로 네트워크 혼잡도 고려해야 해요.", "The advertised receive window represents receiver capacity. The sender must also obey a separate congestion limit for the network."]
  ),
  question(
    ["대상 호스트가 ICMP Echo 요청에 응답하는지 확인하는 명령은?", "Which command checks whether a host replies to ICMP Echo requests?"],
    ["ping", "dig", "chmod", "curl -X POST"], 0,
    ["ping은 ICMP Echo 요청과 응답으로 왕복을 확인해요. 응답이 없어도 ICMP가 차단됐을 수 있으므로 웹 서비스 장애라고 단정할 수는 없어요.", "ping checks an ICMP Echo round trip. Missing replies may reflect ICMP filtering, so they do not by themselves prove that a web service is down."]
  ),
  question(
    ["TTL 또는 Hop Limit을 점차 늘린 탐사로 목적지까지의 중간 홉을 조사하는 명령은?", "Which command probes intermediate hops using increasing TTL or Hop Limit values?"],
    ["traceroute", "ping", "nslookup", "netcat"], 0,
    ["traceroute는 중간 장비의 응답으로 경로를 추정해요. 일부 홉의 무응답은 탐사 차단일 수 있고, 실제 애플리케이션 경로나 돌아오는 경로와 다를 수도 있어요.", "traceroute infers hops from probe responses. A missing hop may filter probes, and application traffic or the return path may follow a different route."]
  ),
];

/** LV.4 network-orchestrator — Router */
const networkOrchestratorQuiz: readonly QuizQuestion[] = [
  question(
    ["라우터가 하는 일은?", "What does a router do?"],
    [["서로 다른 네트워크 사이에서 패킷의 경로를 고른다", "It chooses packet paths between different networks"], ["같은 네트워크 안에서만 프레임을 전달한다", "It forwards frames only inside one network"], ["도메인 이름을 변환한다", "It translates domain names"], ["데이터를 암호화한다", "It encrypts data"]], 0,
    ["라우터는 목적지 IP 주소와 라우팅 정보를 이용해 다음 홉을 골라요. 이름 조회나 암호화가 라우터의 기본 경로 선택 역할을 대신하지는 않아요.", "A router uses the destination IP and routing information to choose a next hop. Name resolution and encryption are separate responsibilities."]
  ),
  question(
    ["같은 VLAN 안에서 L2 스위치가 이미 학습한 목적지 MAC의 프레임을 받았다. 일반적인 전달 기준은?", "An L2 switch receives a frame for a learned destination MAC within the same VLAN. What normally determines forwarding?"],
    [["MAC 주소표에서 목적지에 연결된 포트를 찾는다", "Look up the destination's port in the MAC table"], ["DNS에서 목적지 IP 주소를 조회한다", "Look up the destination IP through DNS"], ["IP 라우팅 표의 최장 접두사로 고른다", "Select the longest matching IP route"], ["암호를 풀어 HTML 내용으로 포트를 고른다", "Decrypt and choose a port from HTML content"]], 0,
    ["일반 L2 스위치는 같은 VLAN의 프레임을 MAC 주소표로 전달해요. 네트워크 사이의 IP 라우팅은 L3 기능이며, L3 스위치는 두 기능을 함께 제공할 수 있어요.", "An L2 switch forwards frames within a VLAN using its MAC table. IP routing is a layer-3 function; a multilayer switch can provide both."]
  ),
  question(
    ["호스트에 기본 경로가 설정돼 있고 목적지에 맞는 더 구체적인 경로는 없다. 해당 기본 경로의 다음 홉은?", "A host has a configured default route and no more-specific route to the destination. Which next hop does that default route use?"],
    [["기본 게이트웨이", "The default gateway"], ["루프백 인터페이스", "The loopback interface"], ["브로드캐스트 주소", "The broadcast address"], ["DNS 서버", "The DNS server"]], 0,
    ["이 경우 설정된 기본 경로의 게이트웨이를 사용해요. 기본 경로까지 포함해 사용할 경로가 전혀 없으면 전달할 수 없으며 DNS 서버로 대신 보내지 않아요.", "Here the configured default gateway is used. If no usable route exists, including no default route, forwarding fails rather than falling back to a DNS server."]
  ),
  question(
    ["목적지는 10.1.2.42이고 경로는 10.0.0.0/8, 10.1.0.0/16, 10.1.2.0/24다. 일반적인 최장 접두사 일치로 고를 경로는?", "For destination 10.1.2.42, routes exist for 10.0.0.0/8, 10.1.0.0/16 and 10.1.2.0/24. Which wins longest-prefix matching?"],
    ["10.1.2.0/24", "10.1.0.0/16", "10.0.0.0/8", "0.0.0.0/0"], 0,
    ["세 경로 모두 목적지를 포함하지만 /24가 가장 구체적이에요. 접두사 길이가 같은 경로끼리의 우선순위 판단은 그다음 문제예요.", "All three listed routes contain the destination, but /24 is the most specific. Tie-breaking between equally specific routes is a separate decision."]
  ),
  question(
    ["같은 이더넷 링크에서 다음 홉의 IPv4 주소에 대응하는 MAC 주소를 알아내는 프로토콜은?", "Which protocol resolves a next hop's IPv4 address to its MAC address on the same Ethernet link?"],
    ["ARP", "DNS", "DHCP", "ICMP"], 0,
    ["ARP는 로컬 링크의 IPv4 주소를 MAC 주소에 연결해요. 다른 네트워크로 갈 때는 보통 최종 서버가 아닌 다음 홉 라우터의 MAC 주소를 구해요.", "ARP maps an IPv4 address to a MAC address on the local link. For a remote network, the needed MAC is usually the next-hop router's, not the final server's."]
  ),
  question(
    ["ping이 사용하는 프로토콜은?", "Which protocol does ping use?"],
    ["ICMP", "TCP", "UDP", "HTTP"], 0,
    ["ping은 ICMP Echo 메시지를 사용해요. TCP 포트 연결 성공이나 HTTP 응답 성공을 직접 확인하는 검사는 아니에요.", "ping uses ICMP Echo messages. It does not directly test a TCP port connection or a successful HTTP response."]
  ),
  question(
    ["L3·L4 패킷 필터링 방화벽의 허용·차단 규칙에 사용하는 기본 항목은?", "Which fields are basic inputs to an L3/L4 packet-filtering firewall rule?"],
    [["출발지·목적지 주소와 포트, 프로토콜", "Source and destination address, port and protocol"], ["파일 이름", "File names"], ["사용자의 비밀번호", "The user's password"], ["HTML 내용", "The HTML content"]], 0,
    ["IP 주소, 포트, 전송 프로토콜로 통신을 구분해요. 모든 방화벽이 이 항목만 보는 것은 아니며, 상태 추적이나 애플리케이션 검사 기능도 있을 수 있어요.", "Addresses, ports and transport protocol identify traffic for packet filtering. Other firewall features may additionally track connection state or inspect applications."]
  ),
  question(
    ["같은 물리 스위치의 단말들을 서로 다른 L2 브로드캐스트 도메인으로 나누려면?", "How can devices on the same physical switch be separated into distinct L2 broadcast domains?"],
    ["VLAN", "NAT", "CDN", "MTU"], 0,
    ["VLAN은 물리 장비를 공유하면서 L2 브로드캐스트 영역을 나눠요. 서로 다른 VLAN 사이의 통신에는 라우팅과 적절한 접근 정책이 필요해요.", "VLANs separate L2 broadcast domains while sharing physical equipment. Communication between VLANs requires routing and appropriate access policies."]
  ),
  question(
    ["한 링크에서 단편화 없이 운반할 수 있는 IP 패킷 크기의 한도를 뜻하는 말은?", "What names a link's limit on the IP packet size it can carry without fragmentation?"],
    ["MTU", "TTL", "RTT", "QoS"], 0,
    ["MTU는 해당 링크에서 운반할 IP 패킷의 크기 한도예요. TCP 데이터 부분의 최대 크기인 MSS와 구분하며, 경로 중 더 작은 MTU가 있을 수도 있어요.", "MTU limits the IP packet size on a link. MSS instead limits TCP data, and a path can contain a link with a smaller MTU."]
  ),
  question(
    ["전원·케이블·링크는 정상이다. 도메인으로 접속하는 웹 장애를 하위 네트워크부터 단계적으로 좁히는 순서는?", "Power, cables and link are healthy. Which sequence narrows a domain-based web failure from network reachability toward the application?"],
    [["IP 연결 → DNS 해석 → 포트 접근 → 애플리케이션 응답", "IP reachability → DNS resolution → port access → application response"], ["애플리케이션 → 케이블 → 전원 → IP", "Application → cables → power → IP"], ["DNS → 전원 → HTML → IP", "DNS → power → HTML → IP"], ["포트 → 비밀번호 → 방화벽 로그만", "Port → password → firewall logs only"]], 0,
    ["이 순서는 어느 단계부터 실패하는지 분리하는 한 가지 방법이에요. IP 도달성을 확인한 뒤 이름 해석, 서비스 포트, 실제 응답을 각각 검사하며 ping 하나로 모든 단계를 판정하지 않아요.", "This sequence isolates the failing layer: reachability, name resolution, service port and application response. A single ping result does not establish all of them."]
  ),
];

/** LV.5 protocol-nexus — Load balancer */
const protocolNexusQuiz: readonly QuizQuestion[] = [
  question(
    ["로드 밸런서의 역할은?", "What is a load balancer for?"],
    [["여러 서버에 요청을 분산한다", "It spreads requests across several servers"], ["요청을 하나의 서버로 고정한다", "It pins every request to one server"], ["데이터베이스를 백업한다", "It backs up the database"], ["도메인을 등록한다", "It registers domains"]], 0,
    ["로드 밸런서는 설정된 정책에 따라 여러 서버에 트래픽을 나눠요. 요청을 분산하는 것만으로 세션 상태 공유나 데이터 백업까지 해결되지는 않아요.", "A load balancer distributes traffic according to a policy. Distribution alone does not provide shared session state or data backups."]
  ),
  question(
    ["동일 가중치의 정상 서버 A·B·C에 요청을 A→B→C→A로 순서대로 보낸다. 적용한 분배 방식은?", "Healthy, equally weighted servers A, B and C receive requests in the order A→B→C→A. Which policy is in use?"],
    [["라운드 로빈", "Round robin"], ["최소 연결", "Least connections"], ["해시 기반", "Hash based"], ["가중 무작위", "Weighted random"]], 0,
    ["라운드 로빈은 대상들을 순서대로 순환해요. 현재 연결 수가 가장 적은 대상을 고르는 최소 연결 방식과는 판단 기준이 달라요.", "Round robin cycles through targets in order. Least connections instead chooses based on the current number of active connections."]
  ),
  question(
    ["동일 가중치의 정상 서버 A·B·C의 연결 수가 50·2·12다. 현재 연결 수를 기준으로 B에 새 요청을 보내는 방식은?", "Equally weighted healthy servers A, B and C have 50, 2 and 12 active connections. Which policy selects B based on that count?"],
    [["최소 연결", "Least connections"], ["라운드 로빈", "Round robin"], ["랜덤", "Random"], ["고정 할당", "Static assignment"]], 0,
    ["최소 연결은 활성 연결 수가 가장 적은 B를 골라요. 연결 수는 부하의 한 지표이며, 요청마다 처리 비용이 같다는 뜻은 아니에요.", "Least connections selects B because it has the fewest active connections. Connection count is a load signal, not proof that all requests have equal cost."]
  ),
  question(
    ["로드 밸런서가 문제 있는 서버를 빼내기 위해 주기적으로 하는 검사는?", "What periodic check lets a load balancer remove a failing server?"],
    [["헬스 체크", "A health check"], ["로그 회전", "Log rotation"], ["캐시 무효화", "Cache invalidation"], ["인증 갱신", "Credential rotation"]], 0,
    ["헬스 체크는 정해 둔 조건으로 대상의 상태를 판정해요. 검사 경로가 정상이어도 모든 기능이 정상이라는 뜻은 아니므로 검사 대상과 실패 기준을 잘 설계해야 해요.", "Health checks evaluate targets against configured conditions. A healthy check endpoint does not prove that every feature works; choose useful checks and thresholds."]
  ),
  question(
    ["HTTP 서비스에서 /images와 /api 경로를 서로 다른 서버 그룹으로 보내려 한다. L4와 L7의 차이를 올바르게 설명한 것은?", "An HTTP service must send /images and /api to different target groups. Which statement correctly distinguishes L4 from L7 routing?"],
    [["L4는 IP와 포트로, L7은 HTTP 내용까지 보고 분배한다", "L4 routes on IP and port, L7 also inspects HTTP content"], ["L4가 항상 더 느리다", "L4 is always slower"], ["L7은 TCP를 쓰지 않는다", "L7 does not use TCP"], ["둘은 같은 계층이다", "They work at the same layer"]], 0,
    ["HTTP 경로에 따른 분기는 HTTP를 해석하는 L7 기능이 필요해요. L4는 주소·포트 같은 전송 정보로 분배하며, 계층 번호만으로 속도의 우열이 정해지지는 않아요.", "Routing by HTTP path requires application-layer inspection. L4 uses transport information such as addresses and ports; the layer number alone does not determine speed."]
  ),
  question(
    ["같은 사용자를 계속 같은 서버로 보내는 설정을 부르는 말은?", "What is it called when one user keeps landing on the same server?"],
    [["세션 고정(스티키 세션)", "Session affinity, or sticky sessions"], ["라운드 로빈", "Round robin"], ["오토스케일링", "Autoscaling"], ["페일오버", "Failover"]], 0,
    ["세션 고정은 쿠키나 다른 식별 기준으로 요청을 특정 서버에 이어 보내는 정책이에요. 서버 장애 때 상태까지 다른 서버로 복제해 주는 기능은 아니에요.", "Session affinity uses a cookie or another identifier to keep requests on a target. It does not by itself replicate that target's session state."]
  ),
  question(
    ["세션을 선택된 서버의 메모리에만 저장하고 공유·복제하지 않았다. 스티키 세션으로 사용 중 그 서버가 죽으면 생기는 위험은?", "Session state exists only in the selected server's memory, with no sharing or replication. What risk arises if that server fails while using sticky sessions?"],
    [["그 서버가 죽으면 사용자 상태를 잃는다", "Losing that server loses the user's state"], ["요청이 암호화되지 않는다", "Requests stop being encrypted"], ["DNS가 동작하지 않는다", "DNS stops working"], ["포트가 고갈된다", "Ports run out"]], 0,
    ["이 조건에서는 다른 서버가 해당 세션 상태를 가지고 있지 않아요. 별도 공유 저장소나 복제를 설계하면 위험을 줄일 수 있으므로 스티키 세션이 언제나 상태 손실을 뜻하는 것은 아니에요.", "Under this premise, other servers lack the state. Shared storage or replication can reduce the risk, so affinity alone does not imply inevitable state loss."]
  ),
  question(
    ["로드 밸런서에서 TLS를 종료한다는 말의 뜻은?", "What does terminating TLS at the load balancer mean?"],
    [["클라이언트의 TLS 연결을 여기서 처리하고 백엔드 연결은 별도로 맺는다", "Handle the client's TLS connection here and establish a separate backend connection"], ["TLS 인증서를 폐기한다", "The TLS certificate is revoked"], ["연결을 강제로 끊는다", "The connection is forcibly closed"], ["HTTPS를 차단한다", "HTTPS is blocked"]], 0,
    ["로드 밸런서는 클라이언트와의 TLS 연결을 처리해 복호화된 요청을 볼 수 있어요. 백엔드 연결에 다시 TLS를 사용할 수도 있으므로 이후 구간이 반드시 평문인 것은 아니에요.", "The balancer handles client-side TLS and can inspect decrypted requests. It may use TLS again to the backend; termination does not require a plaintext backend connection."]
  ),
  question(
    ["장애가 난 구성 요소를 대기 중인 예비로 넘기는 것은?", "What is switching from a failed component to a standby called?"],
    [["페일오버", "Failover"], ["롤백", "Rollback"], ["샤딩", "Sharding"], ["스로틀링", "Throttling"]], 0,
    ["페일오버는 장애 난 구성 요소의 역할을 다른 구성 요소로 넘기는 일이에요. 이전 배포로 되돌리는 롤백과 다르며, 상태 보존은 별도의 복구 설계가 필요해요.", "Failover transfers a failed component's role to another component. Rollback restores an earlier release; preserving state also requires a recovery design."]
  ),
  question(
    ["정적 자원을 사용자와 가까운 곳에서 제공하는 것은?", "What serves static assets from a location close to the user?"],
    ["CDN", ["로드 밸런서", "A load balancer"], ["역방향 프록시만", "A reverse proxy alone"], ["DNS 서버", "A DNS server"]], 0,
    ["CDN은 분산된 엣지 위치에서 캐시된 자원을 제공해 지연과 원본 서버 부하를 줄일 수 있어요. 캐시 미스나 갱신 정책도 함께 고려해야 해요.", "A CDN can serve cached resources from distributed edge locations, reducing latency and origin load. Cache misses and freshness policies still matter."]
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
