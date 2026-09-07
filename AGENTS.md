# Project Rules

## Project purpose

Codidex Game is a pixel-art educational game that teaches programming/coding concepts. The core game mechanic is Pokédex-style collection: players defeat bug monsters, pass a short capture quiz to prove they understood the concept, and register a graded (bronze/silver/gold) card in their personal "Codidex". Built with Next.js + Phaser.js, targeting deployment on Vercel.

## PR & issue policy

Every PR into `develop` is gated by CI (`.github/workflows/pr-policy.yml`) that requires a mirrored Linear/GitHub issue pair. The normal path is automated — do not do the old manual dance of pre-creating a Linear issue, then a GitHub issue, then baking the id into the branch name; that's exactly the flow that used to get skipped or done out of order:

1. Create a branch named `feat/<slug>` (no id prefix needed) and push it to `origin`.
2. `.github/workflows/prepare-feature-pr.yml` finds or creates a Linear issue in team `COD` (project set by the `LINEAR_PROJECT_SLUG`/`LINEAR_PROJECT_NAME` repo variables — see README setup checklist), finds or creates the matching GitHub mirror issue, and opens a Draft PR into `develop` with both closing references already filled in.
3. `.github/workflows/pr-policy.yml` only validates the branch flow and issue pair on every PR event — it never creates or edits anything.
4. `main` only accepts PRs from `develop`. If this project cuts versioned releases, uncomment `validate-release` in `pr-policy.yml` and adapt it (see `codingnanyong/busan-competition-2026` for a working example); otherwise leave `main` PRs release-gate-free.

Automation uses the `LINEAR_API_KEY` and `GH_PAT` repo secrets. `GH_PAT` must be a fine-grained PAT (not the default `GITHUB_TOKEN`) with Contents:read and Issues/Pull requests:write — edits made with `GITHUB_TOKEN` don't retrigger workflow runs (GitHub's anti-recursion rule), so `pr-policy.yml` would never re-check a PR the automation just fixed up. Provisioning is keyed by `repository:branch`, so rerunning `Prepare feature PR` (or pushing again) after a partial failure reuses whatever Linear/GitHub records already exist instead of duplicating them. A branch named `feat/cod-<n>-<slug>` reuses that existing Linear issue if it belongs to the configured team/project.

**Manual fallback** (if `GH_PAT`/`LINEAR_API_KEY` are missing or expired): create the Linear issue yourself, create an open GitHub issue whose title starts with the same `COD-<n>`, then open the PR with both `Closes COD-<n>` and `Closes #<n>` in the body. Don't create a second issue pair for a branch the automation already provisioned.

On merge into `develop`, CI auto-closes the mirrored GitHub issue; Linear's native GitHub integration then auto-transitions the Linear issue to Done. No manual status update needed after merge.

## Editing constraints

- Do not publish, upload, create a pull request, merge branches, or message external services without explicit user authorization (opening a PR as part of the normal Linear/GitHub flow above is fine; merging and any external-facing action still needs a go-ahead).
- Keep unrelated user changes intact.
- At handoff, report the changed files, any generated assets, and remaining review items.

<!-- Add project-specific sections here: coding style, test commands, domain
vocabulary, content voice, image/asset rules, etc. -->
