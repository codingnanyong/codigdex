# Git Branch Strategy

<!-- This is repo-template's standard policy. If the project has its own
exceptions (binary-file commit rules, release tagging conventions, etc.),
add them after this document. -->

## Branch flow

```
feat/<slug> ── push ──> Linear issue + mirrored GitHub issue
                              │ automatic Draft PR
                              ▼
                           develop
                              │ PR
                              ▼
                            main
```

Avoid pushing directly to `develop` or `main` — always go through a pull request.

## Branch naming

- Default format: `feat/<slug>`
- Example: `feat/add-login-page`
- To reuse an existing Linear issue: `feat/cod-<linear-id>-<slug>`
- One branch corresponds to one unit of work (= one Linear issue).

## Pull request rules

- `feat/*` → `develop`
  - On first push, automation (`prepare-feature-pr.yml`) creates the paired Linear/GitHub issues and a Draft PR.
  - The PR title includes the related Linear issue number (e.g. `COD-41`).
  - The PR body includes `Closes COD-41` and `Closes #<number>` for the mirrored GitHub issue.
- `develop` → `main`
  - Bundles reviewed changes.
  - Projects that need release tagging/versioning should enable the `validate-release` example in `pr-policy.yml`.

## Linear integration

- Every issue is registered in Linear team `COD` and linked to a mirrored GitHub issue.
- GitHub branches/PRs and Linear issues reference each other for traceability.
- If automation fails, re-run `Prepare feature PR` in Actions on the same branch. Issue creation is keyed by repo+branch, so it reuses existing records.

See [AGENTS.md](../../AGENTS.md#pr--issue-policy) for the full policy and procedure.
