# Git 브랜치 전략

<!-- 이 문서는 repo-template 표준 정책입니다. 프로젝트 고유의 예외(예: 바이너리
파일 커밋 규칙, 릴리스 태깅 규칙)가 있다면 이 문서에 이어서 추가하세요. -->

## 브랜치 흐름

```
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

자세한 정책과 절차는 [AGENTS.md](../../AGENTS.md#pr--issue-policy)를 참고하세요.
