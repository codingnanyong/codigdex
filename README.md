<p align="center">
  <img src="web/public/assets/icons/codigdex-main-icon.png" width="128" alt="Codigdex 로고">
</p>

<h1 align="center">Codigdex</h1>

<p align="center">
  버그 몬스터와 코드로 싸우고, 퀴즈로 포획해 나만의 개발 도감을 완성하는 픽셀 아트 교육 게임
</p>

<p align="center">
  <a href="https://github.com/codingnanyong/codigdex/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-bb5a32" alt="Release v1.0.0"></a>
  <a href="https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml"><img src="https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml"><img src="https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml/badge.svg" alt="PR policy"></a>
  <a href="https://codigdex.vercel.app"><img src="https://img.shields.io/badge/play-codigdex.vercel.app-black?logo=vercel&logoColor=white" alt="Play Codigdex"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/codingnanyong/codigdex" alt="License"></a>
</p>

<p align="center">
  <a href="https://codigdex.vercel.app"><strong>게임 플레이</strong></a>
  ·
  <a href="docs/GAME_DESIGN.md">게임 디자인</a>
  ·
  <a href="docs/CAREER_PATH_DESIGN.md">Career Path 설계</a>
</p>

## 게임 소개

Codigdex는 코딩 개념을 읽는 데서 끝나지 않습니다. 코드 블록을 올바른 순서로 조립해 버그 몬스터를 쓰러뜨리고, 캡처 퀴즈에서 60% 이상 정답을 맞히면 몬스터가 개인 도감에 등록됩니다.

플레이어는 서버 구름 위 픽셀 마을 `Codeville`의 주니어 개발자로 시작합니다. 튜토리얼을 지나 Git과 Linux 공통 과정을 수료한 뒤 다섯 가지 직업 중 하나로 전직하고, 직업별 상세 지도의 원판과 랜드마크를 통해 다음 기술 지역을 탐색합니다.

<p align="center">
  <img src="web/public/assets/wallpapers/codigdex-field-guide-wallpaper-v3.png" width="760" alt="필드 가이드를 든 주니어 개발자와 버그 몬스터 지역">
</p>

## V1.0.0 플레이 흐름

```text
튜토리얼: 반복문의 숲
  → CH.01 Git: 기록의 들판 (Lv.1~Lv.5)
  → CH.02 Linux: 셸 동굴 (Lv.1~Lv.5)
  → 1차 전직 선택
  → 직업별 상세 지도와 기술 지역 탐색
  → ??? 미래 몬스터와 2차 전직 Path 미리 보기
```

V1.0.0에는 튜토리얼 1종과 Git·Linux 각 5종, 총 11종의 포획 가능한 몬스터가 들어 있습니다. 전문 기술 지역의 배틀·퀴즈와 실제 2차 전직 해금은 다음 버전에서 이어집니다.

## 주요 기능

| 영역 | V1.0.0 제공 내용 |
|---|---|
| 코드 배틀 | 섞인 코드 블록을 올바른 순서로 조립하는 전투 |
| 캡처 퀴즈 | 몬스터 레벨에 따라 3~7문항 출제, 60% 이상 정답 시 포획 |
| Codigdex | 포획 카드, 설명, 코드 예제, 챕터 진행도 확인 |
| 챕터 진행 | Lv.1부터 Lv.5까지 순차 해금하고 다음 챕터 개방 |
| 1차 전직 | 프론트엔드, 백엔드, DevOps, 데이터 엔지니어, 데이터 분석가 |
| Career Map | 지도 속 원판과 연결된 랜드마크 전체를 상세 지역 진입점으로 사용 |
| 직업별 NPC | 전직 후 선택한 직업의 선배가 상세 지도를 안내 |
| 미래 콘텐츠 | 전문 몬스터와 2차 전직을 `???` 슬롯 및 Path로 미리 표시 |
| 저장 | 브라우저 로컬 저장 v2, 기존 v1 진행 기록 자동 마이그레이션 |

미래 몬스터 슬롯은 아직 포획할 수 없으며 현재 도감 완성률에도 포함되지 않습니다.

<p align="center">
  <img src="web/public/assets/wallpapers/career-paths/devops-path-map-v1.png" width="760" alt="원판과 랜드마크를 따라 기술 지역으로 이동하는 DevOps 상세 지도">
</p>

## Career Path

| 1차 직업 | 전문 지도에 표시되는 주요 기술 |
|---|---|
| 웹 프론트엔드 개발자 | HTML/CSS, JavaScript, 브라우저·HTTP, React, 테스트 |
| 백엔드 개발자 | HTTP/API, 서버 프레임워크, SQL, 인증·보안, 네트워크, Docker |
| DevOps 엔지니어 | 네트워크, Docker, CI/CD, Kubernetes, Cloud·IaC, 모니터링 |
| 데이터 엔지니어 | Python, SQL·모델링, 데이터 파이프라인, Docker, 오케스트레이션 |
| 데이터 분석가 | SQL, 기초 통계, 시각화, BI 도구, 분석용 Python |

전직 화면에는 1차 직업에서 미래 2차 전직으로 이어지는 계보가 표시됩니다. 풀스택 엔지니어, ML Developer, 플랫폼 엔지니어/SRE 등의 이름과 실제 해금 조건은 아직 `???`로 잠겨 있습니다.

## 로컬 실행

요구 사항: Node.js 20 이상, npm

```bash
cd web
npm install
npm run dev
```

[http://localhost:3001](http://localhost:3001)에서 게임을 실행합니다.

```bash
npm run test
npm run lint
npm run build
```

## 기술 스택과 구조

- Next.js 16 · React 19 · TypeScript
- Phaser 4
- Vitest
- Vercel

```text
web/
├─ app/                         Next.js 진입점
├─ lib/domain/                  챕터·퀴즈·도감·직업 규칙
├─ lib/phaser/scenes/           게임 장면
├─ lib/phaser/worldMap/         월드맵·Career Map·진입 영역
├─ lib/phaser/save/             저장 스키마와 마이그레이션
├─ public/assets/
│  ├─ careers/                  직업 초상과 전직 후 NPC
│  ├─ monsters/                 챕터별 도감 몬스터
│  ├─ npcs/                     공통 과정 NPC
│  └─ wallpapers/career-paths/  직업별 상세 지도
└─ test/                        도메인·Phaser 테스트
```

저장 데이터는 `progress`, `player`, `ui`로 분리됩니다. 도감에는 몬스터 ID와 포획 시각만 저장하고 표시 정보와 Path 진행도는 현재 콘텐츠 정의에서 다시 계산합니다.

## 다음 버전

- 전문 기술 지역별 코드 배틀과 캡처 퀴즈
- 포획 결과에 따른 브론즈·실버·골드 카드와 재도전 업그레이드
- 두 개의 1차 직업 Path 완성으로 해금되는 실제 2차 전직
- 2차 전직 전용 통합 챕터, 초상과 도감 배지

## 문서

- [게임 디자인](docs/GAME_DESIGN.md)
- [직업 전직 Path 설계](docs/CAREER_PATH_DESIGN.md)
- [프로젝트 및 PR 정책](AGENTS.md)
- [Git 작업 흐름 (한국어)](docs/kor/GIT_WORKFLOW.md) / [Git workflow (English)](docs/eng/GIT_WORKFLOW.md)
- [기여 가이드](CONTRIBUTING.md)
- [보안 정책](SECURITY.md)

## 기여

기능 브랜치는 `feat/<slug>` 형식을 사용합니다. 브랜치를 push하면 저장소 자동화가 Linear `COD-n` 이슈, GitHub 미러 이슈, `develop` 대상 Draft PR을 생성합니다. 모든 PR은 이슈 연결과 CI 정책을 통과해야 하며 `main`에는 `develop`에서만 병합합니다. 전체 절차와 수동 복구 방법은 [AGENTS.md의 PR 정책](AGENTS.md#pr--issue-policy)을 확인하세요.

<details>
<summary>새 저장소 자동화 설정 체크리스트</summary>

1. `develop` 브랜치를 만들고 기능 PR의 기본 대상으로 사용합니다.
2. Claude GitHub App을 설치합니다.
3. Actions secrets에 `CLAUDE_CODE_OAUTH_TOKEN` 또는 `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`, `LINEAR_API_KEY`, `GH_PAT`을 등록합니다.
4. `GH_PAT`에는 Contents 읽기, Issues 쓰기, Pull requests 쓰기 권한을 부여합니다.
5. Actions variables에 `LINEAR_PROJECT_SLUG`, `LINEAR_PROJECT_NAME`을 등록합니다.
6. 브랜치 보호 규칙에서 `validate-flow`와 `review` 검사를 요구하도록 설정합니다.

</details>

## 라이선스

[MIT](LICENSE) © codingnanyong
