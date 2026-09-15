# Git 브랜치 전략

**한국어** · [English](../eng/GIT_WORKFLOW.md)

<!-- 이 문서는 repo-template 표준 정책입니다. 프로젝트 고유의 예외(예: 바이너리
파일 커밋 규칙, 릴리스 태깅 규칙)가 있다면 이 문서에 이어서 추가하세요. -->

## 브랜치 흐름

```text
feat/<slug> ── push ──> Linear 이슈 + GitHub 미러 이슈
                              │ 자동 Draft PR
                              ▼
                           develop
                              │ PR
                              ▼
                            main
```

`develop`과 `main`에 대한 직접 push는 지양하고, 항상 Pull Request를 통해 반영합니다.

## 브랜치 이름

- 기본 형식: `feat/<slug>`
- 예시: `feat/add-login-page`
- 기존 Linear 이슈를 재사용할 때: `feat/cod-<linear-id>-<slug>`
- 하나의 브랜치는 하나의 작업 단위(=하나의 Linear 이슈)에 대응합니다.

## Pull Request 규칙

- `feat/*` → `develop`
  - 최초 push 시 자동화(`prepare-feature-pr.yml`)가 Linear/GitHub 이슈 쌍과 Draft PR을 생성합니다.
  - PR 제목에는 관련 Linear 이슈 번호가 포함됩니다(예: `COD-41`).
  - PR 본문에는 `Closes COD-41`과 GitHub 미러 이슈의 `Closes #번호`가 포함됩니다.
- `develop` → `main`
  - 검토가 끝난 변경을 모아서 반영합니다.
  - 릴리스 태깅/버전 관리가 필요한 프로젝트는 `pr-policy.yml`의 `validate-release` 예시를 참고해 활성화하세요.

## Linear 연동

- 각 이슈는 Linear `COD` 팀에 등록되고, GitHub에 미러 이슈로 연결됩니다.
- GitHub 브랜치/PR과 Linear 이슈는 서로 참조하여 추적성을 유지합니다.
- 자동화가 실패하면 Actions의 `Prepare feature PR`을 같은 브랜치로 다시 실행합니다. 이슈 생성은 저장소와 브랜치 조합을 기준으로 재사용됩니다.

## 새 저장소 자동화 설정 체크리스트

이 프로젝트를 템플릿으로 사용하는 새 저장소에서는 다음 항목을 한 번만 설정합니다.

1. `develop` 브랜치를 만들고 기본 PR 대상으로 사용합니다.
2. Claude GitHub App을 설치합니다.
3. Actions secrets에 `CLAUDE_CODE_OAUTH_TOKEN`(또는 `ANTHROPIC_API_KEY`), `SLACK_WEBHOOK_URL`, `LINEAR_API_KEY`, `GH_PAT`을 등록합니다.
4. `GH_PAT`은 해당 저장소의 Contents 읽기, Issues 쓰기, Pull requests 쓰기 권한을 가진 fine-grained PAT를 사용합니다.
5. Actions variables에 `LINEAR_PROJECT_SLUG`, `LINEAR_PROJECT_NAME`을 등록합니다.
6. `develop`과 `main`의 브랜치 보호 규칙에서 `validate-flow`, `review` 검사를 요구하도록 설정합니다.

설정 후에는 `feat/<slug>` push 시 Linear/GitHub 이슈 쌍과 Draft PR 생성, PR 정책 검사, 리뷰, merge 알림이 자동으로 실행됩니다.

자세한 정책과 절차는 [AGENTS.md](../../AGENTS.md#pr--issue-policy)를 참고하세요.
