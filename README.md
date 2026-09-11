<p align="center">
  <img src="web/public/assets/icons/codigdex-main-icon.png" width="120" alt="Codigdex 로고">
</p>

<h1 align="center">Codigdex</h1>

<p align="center">
  버그 몬스터를 물리치고, 캡처 퀴즈를 통과해 나만의 코딩 도감을 완성하는 픽셀 아트 교육 게임
</p>

<p align="center">
  <a href="https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml"><img src="https://github.com/codingnanyong/codigdex/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml"><img src="https://github.com/codingnanyong/codigdex/actions/workflows/pr-policy.yml/badge.svg" alt="PR policy"></a>
  <a href="https://github.com/codingnanyong/codigdex/actions/workflows/claude-review.yml"><img src="https://github.com/codingnanyong/codigdex/actions/workflows/claude-review.yml/badge.svg" alt="Claude Code Review"></a>
  <a href="https://codigdex.vercel.app"><img src="https://img.shields.io/badge/demo-codigdex.vercel.app-black?logo=vercel&logoColor=white" alt="Live demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/codingnanyong/codigdex" alt="License"></a>
</p>

## Codigdex란?

Codigdex는 코딩 개념을 읽는 데서 끝나지 않습니다. 코드 배틀에서 버그 몬스터를 쓰러뜨리고 짧은 캡처 퀴즈로 이해도를 확인하면, 결과에 따라 브론즈·실버·골드 카드가 개인 도감에 등록됩니다. 낮은 등급의 카드도 다시 도전해 골드로 성장시킬 수 있습니다.

플레이어는 서버 구름 위 픽셀 마을 `Codeville`의 주니어 개발자로 시작합니다. 튜토리얼과 Git·Linux 공통 과정을 마친 뒤 원하는 직업으로 전직하고, 직업별 상세 지도에서 기술 지역을 돌며 도감을 확장합니다.

<p align="center">
  <img src="web/public/assets/wallpapers/codigdex-field-guide-wallpaper-v3.png" width="720" alt="필드 가이드를 든 주니어 개발자와 버그 몬스터 지역">
</p>

## 게임 진행 구조

```text
튜토리얼
  → 주니어 공통 Path (Git → Linux)
  → 1차 전직 선택
  → 직업별 상세 지도
  → 기술 지역 → 코드 배틀 → 캡처 퀴즈 → 도감 등록
  → ??? (두 직업 Path 완성 후 열리는 2차 전직)
```

현재 직업 Path는 웹 프론트엔드, 백엔드, DevOps, 데이터 엔지니어, 데이터 분석가로 구성됩니다. 전직 후에는 공통 과정의 루피 대신 각 직업의 선배 NPC가 길을 안내합니다. 향후 풀스택 엔지니어, ML Developer, 플랫폼 엔지니어/SRE 같은 2차 전직은 처음부터 `???`로 보이되, 관련된 두 1차 직업 도감을 완성해야 정체와 조건이 드러납니다.

<p align="center">
  <img src="web/public/assets/wallpapers/career-paths/devops-path-map-v1.png" width="720" alt="기술 지역을 따라 이동하는 DevOps 상세 지도">
</p>

## 현재 구현

- 튜토리얼, CH.01 Git, CH.02 Linux의 퀘스트 → 배틀 → 퀴즈 → 포획 루프
- 챕터마다 Lv.1~Lv.5로 이어지는 몬스터와 순차 해금
- 정답률에 따른 브론즈·실버·골드 카드와 골드 재도전
- 완성도와 챕터 마스터 배지를 보여 주는 Codigdex 화면
- 5개 1차 직업 선택, 직업별 월페이퍼 지도와 기술 지역 표시
- 전직에 따라 달라지는 직업별 가이드 NPC
- `???`로 미리 보이는 2차 전직 슬롯
- 아직 배틀이 없는 전문 기술 몬스터를 `???` 도감 슬롯으로 미리 표시
- 브라우저 로컬 저장 v2와 기존 v1 저장 데이터 자동 마이그레이션
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
│  ├─ careers/                  직업 초상과 전직 후 NPC
│  ├─ monsters/                 챕터별 도감 몬스터
│  ├─ npcs/                     공통 과정 NPC
│  └─ wallpapers/career-paths/  직업별 상세 지도
└─ test/                        도메인·Phaser 테스트
```

저장 데이터는 `progress`, `player`, `ui` 영역을 분리합니다. 도감 카드에는 몬스터 ID와 포획 시각만 저장하고 표시 정보는 현재 챕터 정의에서 다시 구성하므로, 콘텐츠가 바뀌어도 오래된 저장 데이터가 화면을 오염시키지 않습니다. 미래 몬스터의 `???` 슬롯은 현재 도감 완성률에서 제외하며, 2차 전직 해금 여부 역시 별도 플래그가 아니라 포획 기록에서 계산하도록 확장할 예정입니다.

## 문서

- [게임 디자인](docs/GAME_DESIGN.md)
- [직업 전직 Path 설계](docs/CAREER_PATH_DESIGN.md)
- [프로젝트 및 PR 정책](AGENTS.md)
- [Git 작업 흐름 (한국어)](docs/kor/GIT_WORKFLOW.md) / [Git workflow (English)](docs/eng/GIT_WORKFLOW.md)
- [기여 가이드](CONTRIBUTING.md)

## 기여

기능 브랜치는 `feat/<slug>` 형식을 사용하고 `develop`으로 Draft PR을 엽니다. 저장소 자동화가 Linear `COD-n` 이슈와 GitHub 미러 이슈를 생성·연결하며, 모든 PR은 해당 이슈 쌍과 CI 검증을 통과해야 합니다. 자세한 흐름과 수동 복구 절차는 [AGENTS.md의 PR 정책](AGENTS.md#pr--issue-policy)을 확인하세요.

<details>
<summary>새 저장소 자동화 설정 체크리스트</summary>

이 프로젝트를 템플릿으로 사용하는 새 저장소에서는 다음 항목을 한 번만 설정합니다.

1. `develop` 브랜치를 만들고 기본 PR 대상으로 사용합니다.
2. Claude GitHub App을 설치합니다.
3. Actions secrets에 `CLAUDE_CODE_OAUTH_TOKEN`(또는 `ANTHROPIC_API_KEY`), `SLACK_WEBHOOK_URL`, `LINEAR_API_KEY`, `GH_PAT`을 등록합니다.
4. `GH_PAT`은 해당 저장소의 Contents 읽기, Issues 쓰기, Pull requests 쓰기 권한을 가진 fine-grained PAT를 사용합니다.
5. Actions variables에 `LINEAR_PROJECT_SLUG`, `LINEAR_PROJECT_NAME`을 등록합니다.
6. `develop`과 `main`의 브랜치 보호 규칙에서 `validate-flow`, `review` 검사를 요구하도록 설정합니다.

설정 후에는 `feat/<slug>` push 시 Linear/GitHub 이슈 쌍과 Draft PR 생성, PR 정책 검사, 리뷰, merge 알림이 자동으로 실행됩니다.

</details>

## 라이선스

[MIT](LICENSE) © codingnanyong
