# repo-template

codingnanyong's standard starting point for new repos: Linear/GitHub-issue-gated PR flow, Claude + Codex PR review, Slack merge notifications, and the usual community-health files, all pre-wired.

## What's included

- `.github/workflows/prepare-feature-pr.yml` + `.github/scripts/ensure_linear_issue.py` — push a `feat/<slug>` branch and this finds-or-creates the Linear issue, finds-or-creates the mirrored GitHub issue, and opens a Draft PR into `develop` with both closing references already filled in. No manual issue-pairing steps.
- `.github/workflows/pr-policy.yml` — every PR into `develop` must reference a paired Linear issue (`COD-n`) and a mirrored GitHub issue (`#n`); `main` only accepts PRs from `develop`. Validates only — the provisioning above does the creating. See [AGENTS.md](AGENTS.md#pr--issue-policy).
- `.github/workflows/claude-review.yml` — Claude automatically reviews every PR (needs setup, see below).
- `.github/workflows/notify-slack-on-merge.yml` — posts a summary to Slack when a PR merges into `develop`/`main`.
- `AGENTS.md` / `CLAUDE.md` — agent role & rules (Claude reads `CLAUDE.md`, which imports `AGENTS.md`; Codex and other tools read `AGENTS.md` directly).
- `LICENSE` (MIT default — swap for an "All Rights Reserved" style notice if this is a content-only repo), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.github/pull_request_template.md`.
- `docs/kor/GIT_WORKFLOW.md` / `docs/eng/GIT_WORKFLOW.md` — human-readable branch/PR/Linear policy (same policy `AGENTS.md` and `pr-policy.yml` enforce, written out for people). Add project-specific exceptions after it rather than duplicating the shared parts.

## Setup checklist for a new repo made from this template

Everything below is a **one-time, per-repo** step — things only a human can do or decide (create accounts/keys, name the project, click "Install"). Once done, day-to-day PR/issue/Slack work is fully automated; nobody touches these again unless a key rotates or the project is renamed.

### A. What stays automated after setup (no action needed once wired up)

- Opening a `feat/<slug>` branch → Linear issue created/reused, GitHub mirror issue created/reused, Draft PR opened into `develop` — all handled by `prepare-feature-pr.yml`.
- Every PR event → branch/title/body/issue-pair validated by `pr-policy.yml`; nothing to fill in by hand.
- Merge into `develop` → mirrored GitHub issue auto-closed by `pr-policy.yml`, which auto-transitions the Linear issue to Done via Linear's own GitHub integration.
- Every PR → reviewed by `claude-review.yml` (and Codex, if installed).
- Merge into `develop`/`main` → summary posted to Slack by `notify-slack-on-merge.yml`.

### B. What you must newly do or provide for *this* repo

1. **Rename things**: update this README, `AGENTS.md`'s "Project purpose" section, and the license year/holder if needed.
2. **Create `develop` branch**: `git checkout -b develop && git push -u origin develop`, then set `develop` as the default branch in repo Settings if that's your convention (or keep `main` default and just target `develop` for feature PRs).
3. **Install the Claude GitHub App**: https://github.com/apps/claude → select this repo.
4. **(Optional) Install a Codex review app** (e.g. ChatGPT Codex Connector) via https://github.com/settings/installations if you want a second automated reviewer.
5. **Add repo secrets** (Settings → Secrets and variables → Actions → Secrets) — these are credentials only you can issue:
   - `CLAUDE_CODE_OAUTH_TOKEN` (run `claude setup-token` locally if you have a Claude subscription) or `ANTHROPIC_API_KEY`
   - `SLACK_WEBHOOK_URL` (Slack app → Incoming Webhooks, pick your notifications channel)
   - `LINEAR_API_KEY` (Linear → Settings → API → Create key)
   - `GH_PAT` — a fine-grained PAT (Contents:read, Issues:write, Pull requests:write on this repo), **not** the default `GITHUB_TOKEN`. `prepare-feature-pr.yml` uses it to create the draft PR; PRs created with `GITHUB_TOKEN` don't retrigger `pr-policy.yml` (GitHub's anti-recursion rule), so the PR would stay unchecked.
6. **Add repo variables** (Settings → Secrets and variables → Actions → Variables) — the Linear project this repo's issues live in, since that's different per repo:
   - `LINEAR_PROJECT_SLUG` — from the Linear project's "Copy link" (the last URL segment)
   - `LINEAR_PROJECT_NAME` — the project's display name, used as a fallback lookup if the slug ever changes
7. **Branch protection** (optional but recommended): require the `validate-flow` and `review` checks to pass before merging into `develop`/`main`.

Steps 5–6 are the only inputs the automation actually needs; everything after that (A above) runs itself. For the full day-to-day procedure and manual fallback if a secret expires, see [AGENTS.md](AGENTS.md#pr--issue-policy) or [CONTRIBUTING.md](CONTRIBUTING.md).
