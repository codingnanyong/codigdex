# Monorepo architecture

[한국어](../kor/MONOREPO_ARCHITECTURE.md) · **English**

Codigdex uses independently owned packages inside one repository. This is a
modular monolith, not a set of networked microservices: web and mobile need the
same deterministic game rules and content, while their rendering and device
integration differ.

```text
codigdex/
├─ web/                       Next.js + Phaser web application
├─ mobile/                    Expo (SDK 57) + React Native application
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
- **mobile** runs `mobile/scripts/generate-asset-map.mjs`, which reads the key
  list from `packages/game-assets/src/manifest.generated.ts` and emits one
  static `require()` per key into the committed `mobile/src/assets.generated.ts`
  — Metro cannot resolve dynamic `require()` calls. `mobile/src/assets.ts`
  resolves a key through that map with `mobileAssetSource()`. The generator runs
  in `prestart` before `npm start`, and with `--check` inside the mobile
  `typecheck`, which fails while the committed map is stale.
- After adding, renaming, or removing art, run
  `npm run generate --workspace @codigdex/game-assets`; `typecheck` fails while
  the manifest is stale.
- Apps own rendering, navigation, input, audio, analytics, and persistence
  adapters. Shared packages must not import Phaser, React, Next.js, Expo,
  `window`, `document`, or a concrete device storage API.
- Prefer a new package only when code has a stable public contract and at least
  two consumers. Keep feature-specific UI inside its app.

## Mobile implementation

`mobile/` is an Expo SDK 57 application (React Native 0.86, React 19) that
consumes the workspace packages directly. See `mobile/README.md` for the full
walkthrough.

- **Navigation** is Expo Router file-based routing under `mobile/app/`, with
  `typedRoutes` enabled in `app.json`. The implemented routes are `/` (intro),
  `/dex` (grid), `/dex/[id]` (monster card), and `/settings` (locale picker).
- **Phaser is not reused.** Mobile screens are plain React Native components;
  there is no canvas, WebView, or Phaser dependency in the workspace. Web scene
  classes stay in `web/`. Behavior that must match both clients belongs in
  `game-core` or `game-content`, not in a ported scene.
- **Shared packages in use:** `game-core` for the save schema, migrations, and
  locale contracts; `game-content` for `DEX_CATALOG`; `game-i18n` for
  `translate()`; `game-assets` for art through the generated `require()` map.
  `quiz-content` is intentionally not a mobile dependency yet — the battle and
  capture-quiz loop is still web-only.
- **Persistence** is `@react-native-async-storage/async-storage` bound to the
  shared `SaveStorage` contract in `mobile/src/storage/`. `load()` reads
  `codigdex:save:v3`, then `:v2`, then `:v1`; `parseSave()` from `game-core`
  migrates v1 and v2 payloads to `StoredGameStateV3`, and a migrated result is
  written back to the v3 key. Corrupt data or a read failure falls back to
  `createEmptySave()`. Writes only ever target the v3 key. Only plain data
  crosses into the shared rules.
- **Typography** is the Galmuri14 bitmap font from the `galmuri` package, loaded
  with `expo-font` in `app/_layout.tsx`; the root layout renders nothing until
  the font resolves.

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

`typecheck` and `test` fan out across every workspace, mobile included. To work
on mobile alone:

```bash
npm run typecheck --workspace @codigdex/mobile   # asset-map --check, then tsc --noEmit
npm test --workspace @codigdex/mobile            # vitest run
npm run generate:assets --workspace @codigdex/mobile
```

Start the Expo dev server and scan the QR code with Expo Go:

```bash
# LAN — device and computer on the same Wi-Fi; regenerates the asset map first
npm run start --workspace @codigdex/mobile

# Tunnel — different networks, or a LAN that blocks the dev server
npm run generate:assets --workspace @codigdex/mobile
npm run start:tunnel --workspace @codigdex/mobile
```

Only `start` regenerates the asset map through `prestart`; `start:tunnel`,
`android`, and `ios` do not, so run `generate:assets` first when the art
changed.

Vercel should use `web` as its Root Directory. Because the web application
imports workspace packages outside that directory, keep **Include source files
outside of the Root Directory in the Build Step** enabled. The default
`npm run build` command is sufficient because the web package's `prebuild`
script synchronizes `@codigdex/game-assets` first.
