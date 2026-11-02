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
   ├─ game-account/           shared account state and provider list
   ├─ game-assets/            art files + generated asset-key manifest
   ├─ game-core/              rules, domain types, save schema/migrations
   ├─ game-content/           monsters, chapters, careers, surprise-request rules
   ├─ game-i18n/              translated UI message catalogs
   └─ quiz-content/           bilingual quiz packs, loaded on demand
```

## Dependency direction

```text
web ────────┐
mobile ─────┼──> game-account ──> game-content, game-core
            ├──> quiz-content ──> game-content, game-core
            ├──> game-content ──> game-core
            ├──> game-i18n ─────> game-core
            ├───────────────────> game-core
            └───────────────────> game-assets
```

- `game-core` must stay platform-neutral and must not import another workspace.
- `game-content` may import only `game-core`.
- `game-i18n` may import only locale contracts from `game-core`.
- `quiz-content` may import only `game-core` and `game-content`.
- `game-account` may import only `game-core` and `game-content`, plus React.
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
  list from `packages/game-assets/src/manifest.generated.ts`, filters it to the
  art the native game draws, and emits a static `require()` per key into the
  committed `mobile/src/assets.generated.ts` — Metro cannot resolve dynamic
  `require()` calls. `mobile/src/assets.ts`
  resolves a key through that map with `mobileAssetSource()`. Every mobile
  script that feeds the bundler — `start`, `android`, `ios`,
  `export:android`, `export:ios` — regenerates the map first, and the mobile
  `typecheck` runs the generator with `--check`, which fails while the committed
  map is stale.
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
consumes the workspace packages directly. Entry point is `App.tsx`, which
renders `NativeGame` — a native game built from plain React Native views plus a
[React Native Skia](https://shopify.github.io/react-native-skia/) canvas that
draws the shared wallpapers. See `mobile/README.md` for the full walkthrough.

- **Navigation** is an in-memory route state machine in
  `mobile/src/game/NativeGame.tsx`, typed by `MobileRoute` in
  `mobile/src/game/navigation.ts`. It is not file-based routing. Each screen
  (title, world, career, battle, result, surprise request, open-source notes,
  dex, monster detail, settings, and QA) lives in its own file under
  `mobile/src/game/` or `mobile/src/qa/`.
- **Phaser is not reused.** Mobile screens are plain React Native components;
  there is no WebView or Phaser dependency in the workspace. Web scene
  classes stay in `web/`. Behavior that must match both clients belongs in
  `game-core` or `game-content`, not in a ported scene.
- **Shared packages in use:** `game-core` for the save schema, migrations,
  locale contracts, and battle rules; `game-content` for chapters, careers,
  progression gates, the surprise-request session, and QA starting states;
  `quiz-content` for `loadQuizPack()` in the battle screen; `game-i18n` for UI
  messages; `game-account` for account state; `game-assets` for art through the
  generated `require()` map.
- **Persistence** is `@react-native-async-storage/async-storage` bound to the
  shared `SaveStorage` contract in `mobile/src/storage/`. `load()` reads
  `codigdex:save:v3`, then `:v2`, then `:v1`; `parseSave()` from `game-core`
  migrates v1 and v2 payloads to `StoredGameStateV3`, and a migrated result is
  written back to the v3 key. Corrupt values fall through to the next key. A
  storage read failure is not treated as an empty save: the app offers a retry
  and rejects local updates until loading finishes. Writes target only the v3 key
  and run in order, and a failed write shows a retry prompt.
- **Surprise-request history** is stored per adventure and device under
  `codigdex:source-events:v1:<first tutorial capture time>`, separate from the
  save, with the same read-retry and queued, retryable write behavior. Captured
  tool cards are ordinary save-v3 captures.
- **QA data is isolated.** QA requires `__DEV__` and `EXPO_PUBLIC_QA=1`, so release
  bundles never enable it. Manual QA uses the `qa-sprint04:` key namespace and
  automated QA uses `qa-home-e2e:`, for both saves and request history.
- **Native projects are committed.** `android/` and `ios/` are checked-in source
  trees; only build output, Pods, and local IDE state are git-ignored. `app.json`
  uses `"orientation": "default"`, so both platforms rotate. iOS uses the UIScene
  lifecycle through `EXExpoAppSceneDelegate`, and
  `mobile/scripts/check-native.mjs` statically checks these settings.
- **Typography** is the Galmuri14 pixel font (`mobile/src/ui/theme.ts`), loaded by
  `mobile/src/ui/PixelFontGate.tsx` with `expo-font` before the game renders.
- **Release state:** no EAS, APK/IPA, or store release has been made. Native
  simulator acceptance is recorded in
  `qa/home/native-simulator-acceptance.json` (see [Native QA](#native-qa)).

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
npm run export:android --workspace @codigdex/mobile
npm run export:ios --workspace @codigdex/mobile
```

This project is configured for a native dev/build workflow — `expo run` and
`expo start --dev-client`. Build and install a native dev build first, then start
Metro against it:

```bash
npm run android --workspace @codigdex/mobile   # build, install, and launch on Android
npm run ios --workspace @codigdex/mobile       # build, install, and launch on iOS

npm run start --workspace @codigdex/mobile     # expo start --dev-client
```

`start`, `android`, and `ios` all regenerate the asset map before Expo starts,
so a separate `generate:assets` run is no longer needed after changing art.

### Native QA

After `npm ci`, boot a device and start a QA build. Android needs an Android
emulator, and iOS needs an Xcode simulator on macOS:

```bash
npm run mobile:qa:android
npm run mobile:qa:ios
npm run qa:home -- --platform android --feature all   # automated flows; requires Maestro CLI 2.11+
```

The October acceptance used 17 manual QA starting states and 28 automated native
scenarios. The current source has 23 starting states and 34 flows; the additions
still need simulator/device acceptance. Acceptance on commit `ddc1e73`, finished on
2026-10-29 KST:

| Platform | Device | Initial full run | Outcome |
| --- | --- | --- | --- |
| Android | Pixel_8 · API 36 | 28/28 passed | All 28 scenarios accepted |
| iOS | iPhone 18 Pro · iOS 27.0 | 27/28 passed, 1 failed | All 28 accepted after the Analytics promotion path passed a full retest with centered taps |

No gameplay code changed for the retest. The run predates the progression guards
in `7a332d2`. Physical-device IME and accessibility acceptance, real DB, OAuth, and
cloud round trips, and any EAS or store release remain deferred. COD-258 and
COD-259 are postponed until the environment is designed.

`export:android` and `export:ios` are the bundler-level checks for mobile. Each
regenerates the asset map and then runs `expo export` for one platform, into its
own sibling directory under `.tmp-expo-export/`:

| Script | Command it runs | Output |
| --- | --- | --- |
| `export:android` | `expo export --platform android --output-dir .tmp-expo-export/android` | `_expo/static/js/android/entry-*.hbc` |
| `export:ios` | `expo export --platform ios --output-dir .tmp-expo-export/ios` | `_expo/static/js/ios/entry-*.hbc` |

Each produces a full Metro bundle plus Hermes bytecode for its platform and
catches what `typecheck` and Vitest never exercise — an unresolved `require()`,
a shared-package import Metro cannot follow, a platform-conditional import only
one platform takes. `expo export` compiles JavaScript only: no native build
happens, so both run with no Android SDK installed and `export:ios` needs no
macOS host, Xcode, or CocoaPods. That bounds what a green run proves — the JS
graph resolves and Hermes accepts it for that platform, and nothing more. It
says nothing about native module linking, manifest/entitlement or permission
configuration, app startup, or on-device layout, and it does **not** replace a
native development build (`expo run:android`, `expo run:ios`) or a run on an
emulator, simulator, or real device.

Because the two output directories are siblings, the scripts are independent and
can run in either order without clobbering each other. Expo CLI replaces its own
output directory at the start of every run, so no manual pre-clean is needed;
the generated bundles remain there afterward and `.tmp-expo-export/` is
git-ignored in full. `.github/workflows/ci.yml` runs `npm run build:mobile` —
`check-native.mjs`, **both** exports sequentially, then the `check-bundle.mjs` size
budgets — after `typecheck`, `lint`, and `test` and before the web build, so the
iOS run reuses the Metro transform cache the Android run warmed.

Vercel should use `web` as its Root Directory. Because the web application
imports workspace packages outside that directory, keep **Include source files
outside of the Root Directory in the Build Step** enabled. The default
`npm run build` command is sufficient because the web package's `prebuild`
script synchronizes `@codigdex/game-assets` first.

## Regional workshops and final projects

`promotionWorkshops.ts` owns 25 bilingual worked examples and references.
`secondaryExploration.ts` defines five atlases and 25 regional evolution families.
Capturing each of the first four forms settles one practice record, saving 100
checkpoints across the five careers. Early packs reuse the existing tier 2 pools.
`masterChapters.ts` adds
five final projects with five milestones each; `quiz-content/sources/master.ts`
combines 75 new required design questions with related foundation review. The
shared draw and battle reducer always include and require all design criteria.

Save v3 adds optional `progress.projects` entries (`id`, `completedAt`). Missing
records are recovered from early evolution captures after an interrupted write;
otherwise missing entries mean unfinished practice. Existing captures remain. Schema,
parser, creation, merge, Web registry snapshots and native queued writes preserve
the field, including unknown IDs. `gameProgress.ts` derives eligibility and
settles final projects; explicit confirmation equips tier 3. The source now has
451 monster entries, 23 manual QA starting states and 34 generated native flows.
The October acceptance above remains a historical result for the older build;
new flows need simulator/device acceptance. This expansion awaits publication.

OSS encounter history optionally pins `stageId` when accepted. One request captures
one form and returns to the original career; its next meeting offers the next
uncaptured form. `monsters/open-source/<family>/<tool>/` owns all five forms,
including byte-identical relocated final art. Native wallpaper keys map to
640×360 derivatives; the bundle checker measures the files actually imported.
`generate-dex-art-archive.mts` emits the 451-entry archive and canonical hash audit.

`web-smoke.yml` supports production and same-repository PR Preview deployment
events. Tests and scripts for deployment events come from the default branch.
Protected Preview access uses an authorized `VERCEL_AUTOMATION_BYPASS_SECRET`
repository secret, the official Vercel automation header and a browser cookie.
URLs must be exact project origins; external redirects are rejected and
authenticated traces are disabled. Without a valid credential, protected Preview
checks fail with a setup diagnostic. Live authenticated Preview verification is
still required; see [Vercel's automation access documentation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).
