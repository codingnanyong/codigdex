# Monorepo architecture

[한국어](../kor/MONOREPO_ARCHITECTURE.md) · **English**

Codigdex uses independently owned packages inside one repository. This is a
modular monolith, not a set of networked microservices: web and mobile need the
same deterministic game rules and content, while their rendering and device
integration differ.

```text
codigdex/
├─ web/                       Next.js + Phaser web application
├─ mobile/                    future Expo/React Native application
└─ packages/
   ├─ game-assets/            art files + generated asset-key manifest
   ├─ game-core/              rules, domain types, save schema/migrations
   ├─ game-content/           monsters, quizzes, chapters, careers
   └─ game-i18n/              translated UI message catalogs
```

## Dependency direction

```text
web ────────┐
mobile ─────┼──> game-content ──> game-core
            ├──> game-i18n ─────> game-core
            ├───────────────────> game-core
            └───────────────────> game-assets
```

- `game-core` must stay platform-neutral and must not import another workspace.
- `game-content` may import only `game-core`.
- `game-i18n` may import only locale contracts from `game-core`.
- `game-assets` must not import another workspace.

## Assets

Art lives in `packages/game-assets/files/` and is referenced by an **asset
key**, the path relative to that folder (for example
`monsters/ch01.git/sprout-lv1.png`). Shared packages store asset keys only —
never `/assets/...` URLs or bundler imports — so each client can decide how to
serve them. `check:boundaries` rejects URL-style asset paths in shared
packages.

- **web** runs `web/scripts/sync-assets.mjs` before `dev` and `build`, which
  mirrors the files into the git-ignored `web/public/assets/`, and resolves
  keys with `assetUrl()` from `web/lib/assets.ts`.
- **mobile** should generate a static `require()` map from `ASSET_KEYS` in
  `@codigdex/game-assets/manifest`, since Metro cannot resolve dynamic
  `require()` calls.
- After adding, renaming, or removing art, run
  `npm run generate --workspace @codigdex/game-assets`; `typecheck` fails while
  the manifest is stale.
- Apps own rendering, navigation, input, audio, analytics, and persistence
  adapters. Shared packages must not import Phaser, React, Next.js, Expo,
  `window`, `document`, or a concrete device storage API.
- Prefer a new package only when code has a stable public contract and at least
  two consumers. Keep feature-specific UI inside its app.

## Mobile implementation

Create the Expo application in `mobile/` and consume the workspace packages
directly. Mobile should implement its own screens and touch-first layout; it
should not wrap or reuse the Phaser canvas. Persist the shared save snapshot
through a mobile adapter (for example AsyncStorage) and pass plain data into
the shared rules.

## Commands

Run commands from the repository root:

```bash
npm ci
npm run check:boundaries
npm run typecheck
npm run lint
npm test
npm run build:web
```

Vercel should use `web` as its Root Directory. Because the web application
imports workspace packages outside that directory, keep **Include source files
outside of the Root Directory in the Build Step** enabled. The default
`npm run build` command is sufficient because the web package's `prebuild`
script synchronizes `@codigdex/game-assets` first.
