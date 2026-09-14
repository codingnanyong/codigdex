<!-- markdownlint-disable MD033 MD041 -->
<p align="center">
  <img src="web/public/assets/icons/codigdex-main-icon.png" width="120" alt="Codigdex 게임 아이콘">
</p>

<h1 align="center">Codigdex</h1>

<p align="center">버그 몬스터를 물리치고, 캡처 퀴즈를 통과해 나만의 코딩 도감을 완성하는 픽셀 아트 교육 게임</p>
<!-- markdownlint-enable MD033 MD041 -->

[![CI](https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml/badge.svg)](https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml)
[![PR policy](https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml/badge.svg)](https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml)
[![Claude Code Review](https://github.com/codingnanyong/codigdex/actions/workflows/claude-review.yml/badge.svg)](https://github.com/codingnanyong/codigdex/actions/workflows/claude-review.yml)
[![Live demo](https://img.shields.io/badge/demo-codigdex.vercel.app-black?logo=vercel&logoColor=white)](https://codigdex.vercel.app)
[![License](https://img.shields.io/github/license/codingnanyong/codigdex)](LICENSE)

## Codigdex란?

Codigdex는 코딩 개념을 읽는 데서 끝나지 않습니다. 코드 배틀에서 버그 몬스터와 맞서고 짧은 캡처 퀴즈로 이해도를 확인합니다. 정답률 60% 이상이면 몬스터 카드가 개인 도감에 등록되고, 성공이나 실패가 확정되는 순간 배틀 결과로 바로 넘어갑니다.

플레이어는 서버 구름 위 픽셀 마을 `Codeville`의 주니어 개발자로 시작합니다. 튜토리얼과 Git·Linux 공통 과정을 마친 뒤 원하는 직업으로 전직하고, 직업별 상세 지도에서 기술 지역을 돌며 도감을 확장합니다.

![필드 가이드를 든 주니어 개발자와 버그 몬스터 지역](web/public/assets/wallpapers/codigdex-field-guide-wallpaper-v3.png)

## 게임 진행 구조

```text
튜토리얼
  → 주니어 공통 Path (Git → Linux)
  → CH.02 완료와 함께 1차 전직 선택
  → 직업별 상세 지도
  → 기술 지역 → 코드 배틀 → 캡처 퀴즈 → 도감 등록
  → 2차 전직 (두 직업 Path 완성)
  → 3차 전직 (선택한 2차 직업의 마스터 Path 완성)
```

현재 직업 Path는 웹 프론트엔드, 백엔드, DevOps, 데이터 엔지니어, 데이터 분석가로 구성됩니다. 전직 후에는 공통 과정의 루피 대신 이름과 역할을 가진 직업별 선배 NPC가 길을 안내합니다. 풀스택 엔지니어, ML Developer, 플랫폼 엔지니어/SRE 같은 2차 전직은 처음부터 `???`로 보이되, 관련된 두 1차 직업 도감을 완성해야 정체와 조건이 드러납니다. 각 2차 직업 아래에는 소프트웨어 아키텍트, AI 프로덕트 엔지니어 등 대응하는 3차 마스터 직업이 한 갈래로 이어지며, 2차 마스터 Path를 완주한 뒤 해금됩니다.

직업 도감은 사람 캐릭터를 반복해서 보여 주는 대신 주니어부터 3차 직업까지 16종의 고유 심볼을 수집합니다. 플레이어 전신 캐릭터는 필드 이동에, 가이드 NPC의 상반신 초상화는 대화 연출에 사용해 역할을 구분했습니다.

![주니어부터 3차 전직까지 구분한 플레이어 캐릭터와 가이드 NPC 아카이브](web/public/assets/characters/career-path/career-character-guide-v2.png)

![주니어부터 3차 전직까지 한눈에 보는 직업 심볼 아카이브](web/public/assets/career-emblems/career-emblem-archive-v1.png)

## 현재 구현

- 튜토리얼, CH.01 Git, CH.02 Linux의 퀘스트 → 배틀 → 퀴즈 → 포획 루프
- 챕터마다 중앙 Lv.5를 목표로 순환하는 Lv.1~Lv.5 경로와 순차 해금
- 정답률 60% 포획 기준과 성공·실패가 확정되면 즉시 끝나는 코드 배틀
- `000`부터 이어지는 몬스터 번호, 챕터 완성도와 포획 카드를 보여 주는 Codigdex
- CH.02 마지막 포획 직후 열리는 1차 전직 선택과 완료 저장 데이터 복구
- 5개 1차 직업 선택, 직업별 v3 월페이퍼 지도와 기술 지역 표시
- 지역 호버 시 지도 중앙에 나타나는 이름과 포커스 효과
- 작은 필드 플레이어가 경로를 따라 거점 중앙으로 부드럽게 이동하는 연출
- 전직 단계마다 이름이 지정된 가이드 NPC와 하단 상반신 초상화 대화창
- `???`로 미리 보이는 2차·3차 전직 슬롯과 해금 조합
- 아직 배틀이 없는 전문 기술 몬스터를 `???` 도감 슬롯으로 미리 표시
- 몬스터/직업 탭, 16종 직업 심볼, 전직 계보를 갖춘 Codigdex
- 직업별 잠금·전직 가능·현재·마스터 상태와 최초 선택 기록
- 주요 게임 화면의 아이콘형 Home 내비게이션과 저장 상태를 복원하는 이어하기
- 브라우저 로컬 저장 v3와 기존 v1·v2 저장 데이터 자동 마이그레이션
- Phaser와 분리된 `lib/domain` 규칙, Vitest 단위·통합 테스트

직업별 전문 챕터의 몬스터 아트와 지도는 준비되어 있으며, 각 지역의 배틀·퀴즈 콘텐츠는 순차 연결 중입니다. 상세 커리큘럼과 2차 전직 해금 원칙은 [직업 전직 Path 설계](docs/CAREER_PATH_DESIGN.md)를 참고하세요.

## 기술 스택

- Next.js 16, React 19
- Phaser 4
- TypeScript
- Vitest
- Vercel

## 시작하기

```bash
cd web
npm install
npm run dev
```

브라우저에서 [http://localhost:3001](http://localhost:3001)을 엽니다.

```bash
npm run test
npm run lint
npm run build
```

## 프로젝트 구조

```text
web/
├─ app/                         Next.js 진입점
├─ lib/domain/                  챕터, 도감, 직업과 진로 규칙
├─ lib/phaser/scenes/           Phaser 화면
├─ lib/phaser/worldMap/         월드맵, 상세 진로 지도와 상호작용
├─ lib/phaser/save/             버전별 저장 스키마와 마이그레이션
├─ public/assets/
│  ├─ characters/career-path/   직업별 플레이어·안내자 캐릭터
│  ├─ characters/player/        월드맵 이동용 소형 플레이어
│  ├─ career-emblems/           주니어~3차 직업 수집 심볼
│  ├─ monsters/                 챕터별 도감 몬스터
│  └─ wallpapers/career-paths/  직업별 상세 지도
└─ test/                        도메인·Phaser 테스트
```

저장 데이터는 `progress`, `player`, `ui` 영역을 분리합니다. `progress`에는 몬스터 포획 기록과 직업 도감의 해금·선택·마스터 이력을 저장하고, 표시 정보는 현재 카탈로그 정의에서 다시 구성합니다. 직업 완료는 포획 조건으로 검증한 뒤 영구 마스터 이력으로 등록되며, 2차·3차 전직 계보는 이 기록을 기준으로 해금됩니다.

## 문서

- [게임 디자인](docs/GAME_DESIGN.md)
- [직업 전직 Path 설계](docs/CAREER_PATH_DESIGN.md)
- [프로젝트 및 PR 정책](AGENTS.md)
- [Git 작업 흐름 (한국어)](docs/kor/GIT_WORKFLOW.md) / [Git workflow (English)](docs/eng/GIT_WORKFLOW.md)
- [기여 가이드](CONTRIBUTING.md)

## 기여

기능 브랜치는 `feat/<slug>` 형식을 사용하고 `develop`으로 Draft PR을 엽니다. 저장소 자동화가 Linear `COD-n` 이슈와 GitHub 미러 이슈를 생성·연결하며, 모든 PR은 해당 이슈 쌍과 CI 검증을 통과해야 합니다. 자세한 흐름과 수동 복구 절차는 [AGENTS.md의 PR 정책](AGENTS.md#pr--issue-policy)을 확인하세요.

### 새 저장소 자동화 설정 체크리스트

이 프로젝트를 템플릿으로 사용하는 새 저장소에서는 다음 항목을 한 번만 설정합니다.

1. `develop` 브랜치를 만들고 기본 PR 대상으로 사용합니다.
2. Claude GitHub App을 설치합니다.
3. Actions secrets에 `CLAUDE_CODE_OAUTH_TOKEN`(또는 `ANTHROPIC_API_KEY`), `SLACK_WEBHOOK_URL`, `LINEAR_API_KEY`, `GH_PAT`을 등록합니다.
4. `GH_PAT`은 해당 저장소의 Contents 읽기, Issues 쓰기, Pull requests 쓰기 권한을 가진 fine-grained PAT를 사용합니다.
5. Actions variables에 `LINEAR_PROJECT_SLUG`, `LINEAR_PROJECT_NAME`을 등록합니다.
6. `develop`과 `main`의 브랜치 보호 규칙에서 `validate-flow`, `review` 검사를 요구하도록 설정합니다.

설정 후에는 `feat/<slug>` push 시 Linear/GitHub 이슈 쌍과 Draft PR 생성, PR 정책 검사, 리뷰, merge 알림이 자동으로 실행됩니다.

## 라이선스

[MIT](LICENSE) © codingnanyong
