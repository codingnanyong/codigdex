# Git Branch Strategy

[한국어](../kor/GIT_WORKFLOW.md) · **English**

<!-- This is repo-template's standard policy. If the project has its own
exceptions (binary-file commit rules, release tagging conventions, etc.),
add them after this document. -->

## Branch flow

```text
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

## New repository automation setup checklist

A new repository that uses this project as a template needs the following one-time setup.

1. Create a `develop` branch and use it as the default PR target.
2. Install the Claude GitHub App.
3. Add Actions secrets: `CLAUDE_CODE_OAUTH_TOKEN` (or `ANTHROPIC_API_KEY`), `SLACK_WEBHOOK_URL`, `LINEAR_API_KEY`, `GH_PAT`.
4. Use a fine-grained PAT for `GH_PAT` with Contents read, Issues write, and Pull requests write on this repository.
5. Add Actions variables: `LINEAR_PROJECT_SLUG`, `LINEAR_PROJECT_NAME`.
6. Require the `validate-flow` and `review` checks in the branch protection rules for `develop` and `main`.

Once configured, pushing `feat/<slug>` automatically creates the Linear/GitHub issue pair and Draft PR, then runs the PR policy check, review, and merge notification.

## Linear to Notion sprint progress sync

`.github/workflows/sync-sprint-progress.yml` updates the matching Notion Sprint Tracker row every 15 minutes and after a feature PR is merged into `develop`. It calculates `Completion %` from completed, non-canceled Codigdex issues in the current Linear cycle and also updates `Status`, `Last Synced`, and `Sync Status`.

One-time repository configuration:

1. Create a Notion internal integration with read and update-content capabilities, then share the Sprint Tracker data source with it.
2. Add its token as the Actions secret `NOTION_API_KEY`.
3. Set `LINEAR_TEAM_KEY`, `LINEAR_WORKSPACE_SLUG`, and `NOTION_SPRINT_DATA_SOURCE_ID` as Actions variables. `LINEAR_PROJECT_NAME` is shared with feature-PR automation.
4. Run **Sync Linear sprint progress to Notion** manually once to verify the connection. Without `NOTION_API_KEY`, the workflow safely skips the remote update while still testing its calculations.

Each Sprint Tracker row must contain its Linear cycle URL in the `Linear Cycle` property, for example `https://linear.app/codingnanyong/team/COD/cycle/2`.

See [AGENTS.md](../../AGENTS.md#pr--issue-policy) for the full policy and procedure.
