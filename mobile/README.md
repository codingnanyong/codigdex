# Codigdex Mobile

Expo (SDK 57) + React Native 0.86 client, entry point `App.tsx`. It renders its
own native game with plain React Native views and a [React Native
Skia](https://shopify.github.io/react-native-skia/) canvas that draws the shared
pixel-art wallpapers. There is no WebView and no Phaser here; the web client's
Phaser canvas and scene classes stay in `web/`. It shares game rules, content,
and the save schema with the web app through the workspace packages; rendering,
navigation, input, and persistence are separate per platform.

> **Release status (2026-11-02):** no EAS build, APK/IPA upload, or store release
> has been made. Run the app locally as described under
> [Running it](#running-it).

## What is implemented

`App.tsx` wraps `PixelFontGate`, `SaveProvider`, and `AccountProvider` around
`NativeGame`. `src/game/NativeGame.tsx` is an in-memory route state machine — not
file-based routing — over the typed `MobileRoute` union in
`src/game/navigation.ts`. Each screen lives in its own file under `src/game/`.

| Route | Screen | What it does |
| --- | --- | --- |
| `title` | `TitleScreen` | Entry to play, careers, open-source notes, dex, and settings; a QA entry appears only in QA runs |
| `world` | `WorldMapScreen` | Tutorial → Git → Linux checkpoints over a shared wallpaper; a cleared stage opens the next one |
| `career` | `CareerScreen` / `CareerWorkshop` | Tier 1 paths, tier 2 regional examples and practice, tier 3 final design projects and explicit promotion |
| `battle` | `BattleScreen` | Loads the monster's pack with `loadQuizPack()` from `@codigdex/quiz-content` and runs the mixed question battle, with hints and a retry when loading fails |
| `result` | `ResultScreen` | Score and capture result: 60% plus all required design decisions for final projects |
| `encounter` | `OpenSourceEventScreen` | The optional career surprise request: accept, later, retry, and a save-retry prompt |
| `open-source` | `OpenSourceScreen` | Notes for tools already discovered through requests. It is a review screen, not a battle entrance |
| `dex` / `detail` | `DexScreen` / `MonsterDetail` | The 451-entry monster dex; uncaptured monsters show `???` |
| `settings` | `SettingsScreen` | Locale (ko/en), account panel, and progress reset |
| `qa` | `QAScreen` | Starting states, one-shot failure controls, and a checklist. Only reachable in QA runs |

### Content available on mobile

- The common path, all five tier 1 careers, and five tier 2 atlases with 25 regions
  and 125 evolution forms. Early evolution captures settle 100 practice records.
  There are 25 worked examples; evolution packs share the existing 500 authored
  secondary questions. These additions await publication and deployment.
- Career surprise requests covering 38 tools, 190 evolution forms and 380 shared
  questions. Original final-form art moves unchanged into `monsters/open-source/`.
  Accepting a request pins its evolution stage through reload and capture. They
  are offered after career and promotion battle wins, and there is no independent
  expedition entrance. Tool details in the dex and notes do not bypass accepting
  a request; old standalone-expedition bookmarks return to the career path, and
  tool cards captured that way stay in the save.
- Five tier 3 final design projects, 25 guardians and 75 required design questions with related review. Complete the matching 25 secondary forms and 20 practice records first, then pass the project and explicitly confirm tier 3. Genuinely completed legacy projects stay valid.

The progression rules are shared with web through `@codigdex/game-content`; see
[Career Path Design](../docs/eng/CAREER_PATH_DESIGN.md). The requirement that a
tier 1 path needs every checkpoint and the preservation of an earned tier 2
career are in this source tree, but mobile has no released build that carries
them.

## Shared packages

- `@codigdex/game-core` — save schema and v1/v2 → v3 migrations
  (`save/schema`, `save/storage`), locale contracts and `localize()`
  (`i18n/locale`), battle, capture, and quiz drawing rules (`domain/dex/*`)
- `@codigdex/game-content` — chapters, careers, progression gates
  (`domain/gameProgress`), the surprise-request session and history parser, and
  the QA starting states (`domain/careerQAPresets`)
- `@codigdex/quiz-content` — `loadQuizPack()` for the battle screen
- `@codigdex/game-i18n` — translated UI message catalogs
- `@codigdex/game-account` — shared account state and provider list used by
  `src/account/`
- `@codigdex/game-assets` — art, resolved from asset keys through a generated
  static `require()` map

Rendering, navigation, input, and persistence adapters live in this directory
because those concerns differ between web and mobile.

## Assets

Shared packages store **asset keys** (paths relative to
`packages/game-assets/files/`), never URLs or bundler imports. Metro cannot
resolve a dynamic `require()`, so `scripts/generate-asset-map.mjs` reads the
key list out of `packages/game-assets/src/manifest.generated.ts` and writes a
static `require()` per key into `src/assets.generated.ts`. The map is filtered
to what the native game draws: monster art, promotion guides, open-source
characters, and the shared wallpapers.

`src/assets.generated.ts` is committed. Regenerate it after adding, renaming,
or removing art:

```bash
npm run generate --workspace @codigdex/game-assets   # refresh the shared manifest first
npm run generate:assets --workspace @codigdex/mobile
```

`npm run typecheck --workspace @codigdex/mobile` runs the generator with
`--check` and fails while the committed map is stale. Every script that feeds
the bundler — `start`, `android`, `ios`, `export:android`, `export:ios` —
regenerates the map first, so a stale map cannot reach Metro.

## Save persistence

`src/storage/asyncStorage.ts` binds `@react-native-async-storage/async-storage`
to `createAsyncSaveStorage()` in `src/storage/saveStorage.ts`, which implements
the shared `SaveStorage` contract. The schema is `StoredGameStateV3`.

### Reading and retry

On `load()` the adapter tries `codigdex:save:v3`, `:v2`, then `:v1` through
`game-core`'s `parseSave()`, which migrates v1/v2 payloads up to v3. The first key
that parses wins; when it was not the v3 key, the migrated result is written back
to `codigdex:save:v3`. An unparseable value falls through to the next key, and
only an exhausted list returns `createEmptySave()`.

A storage **read failure is not treated as an empty save**. `SaveProvider` reports
`loadError` and offers `retryLoad()`, and it rejects local updates until hydration
finishes, so unread progress cannot be overwritten.

### Writing and retry

`save()` only ever writes the v3 key. `SaveProvider` updates memory first, then
persists through `src/storage/saveWriter.ts`, which runs writes in order so a slow
earlier write cannot overwrite a newer one. A failed write sets `saveError`, the
screens show a retry prompt, and `retrySave()` writes the current save and request
history again.

### Surprise-request history

Request and discovery history is stored apart from the save by
`src/storage/sourceEventStore.ts`, under
`codigdex:source-events:v1:<first tutorial capture time>`, so each adventure has
its own history. It follows the same rules: it is read before the game displays
that save or imports another one, a failed read blocks startup for retry instead
of discarding a pending request, and writes are queued and retryable. This history
stays on the device. Captured tool cards are ordinary save-v3 captures.

### QA isolation

QA runs use namespaced keys for both the save and request history, so they never
touch a player's normal data:

| Run | Enabled by | Key namespace |
| --- | --- | --- |
| Normal | Default | None |
| Manual QA | `__DEV__` with `EXPO_PUBLIC_QA=1` | `qa-sprint04:` |
| Automated QA | Manual QA conditions plus `EXPO_PUBLIC_E2E=1` | `qa-home-e2e:` |

Release bundles never enable QA. The failure controls in `src/qa/runtime.ts` and
QA's starting states do nothing outside QA, and QA runs do not create an account
client.

## Orientation and native projects

`app.json` sets `"orientation": "default"`, so the app rotates:
`android:screenOrientation="unspecified"` with `adjustResize` on `MainActivity`,
and portrait plus landscape in `ios/Codigdex/Info.plist`. The status bar is hidden
via `expo-status-bar`'s `<StatusBar hidden />` in `App.tsx`.

iOS uses the UIScene lifecycle: `UIApplicationSceneManifest` names
`EXExpoAppSceneDelegate`, and `app.json` keeps it through prebuild with
`enableSceneSupport`. `scripts/check-native.mjs` statically checks this, the
rotation and keyboard settings, the Android secure-session backup rules, and the
`codigdex` OAuth callback scheme.

Both `android/` and `ios/` are committed source trees — only build output, Pods,
and local IDE state are git-ignored (`mobile/.gitignore`).

## Fonts and theme

`src/ui/theme.ts` exports `colors` and `font = "Galmuri14"`, the pixel font from
`packages/game-assets/files/fonts/`. `src/ui/PixelFontGate.tsx` loads it with
`expo-font` before the game renders and offers a retry if loading fails.

## Running it

Install Node.js 22.x and run `npm ci` once at the repository root.

### Android emulator

Requires Android Studio with the SDK and JDK 17+. Boot an emulator, then run:

```bash
npm run mobile:qa:android                       # build, install, and launch with QA enabled
npm run mobile:qa:android -- --device Pixel_8   # pick an emulator by name
npm run mobile:qa:android -- --port 8083        # pick a Metro port
```

On Windows, `start-mobile-qa.cmd --android` is a shortcut.

If the emulator stalls or cannot reach Metro, the simulator acceptance run recorded
two fixes: disable host GPU and Vulkan, and use `127.0.0.1:8081` with `adb reverse`.

### iOS simulator

Requires macOS and Xcode. Boot a simulator, then run:

```bash
npm run mobile:qa:ios
```

### Other launch paths

```bash
npm run mobile:qa                                # Expo Go QR on the same Wi-Fi, QA enabled
npm run android --workspace @codigdex/mobile     # native build without QA
npm run ios --workspace @codigdex/mobile         # native build without QA
npm run start --workspace @codigdex/mobile       # expo start --dev-client
```

Expo Go exercises the JS and game flow only, so native startup still needs a native
build. `npm run mobile:android` / `npm run mobile:ios` open the native projects in
Android Studio / Xcode and use the macOS `open` command. `prebuild` /
`prebuild:clean` regenerate the `android/`/`ios/` trees from `app.json` if they ever
need to be recreated from scratch.

## QA

There are two separate sets, and their counts should not be compared:

- **23 QA starting states** are picked by hand on the QA screen
  (`careerQAPresets`): a new game, ten career requests, five tier 2 promotions,
  the full dex, one regional workshop and five final projects. The screen also has controls that fail the next quiz load,
  save write, or request-history write once.
- **34 native scenarios** are the automated Maestro flows in
  `qa/home/maestro/flows/`, generated by `npm run qa:generate`: quiz grading and
  hints (2), capture replay, startup and save recovery, world unlocks, restart,
  five career selections, ten career requests, five promotion paths, request-history
  save recovery, failed-request battle retry, four regional practice checkpoints
  with restart, and five final projects with explicit tier 3 confirmation.

```bash
npm run qa:home -- --platform android --feature all   # requires Maestro CLI 2.11+ and Java 17+
npm run qa:home -- --platform ios --feature all
npm run mobile:qa:check                               # typecheck, agent checks, tests, native and bundle checks
```

## Checks

```bash
npm run typecheck --workspace @codigdex/mobile   # asset-map --check, then tsc --noEmit
npm test --workspace @codigdex/mobile            # vitest run
npm run export:android --workspace @codigdex/mobile
npm run export:ios --workspace @codigdex/mobile
```

`typecheck` and `test` are also covered by the root `npm run typecheck` and
`npm test`, which fan out across every workspace.

### Bundler checks (`export:android`, `export:ios`)

Both export scripts regenerate the asset map and then run `expo export` for
one platform:

| Script | Command it runs | Output |
| --- | --- | --- |
| `export:android` | `expo export --platform android --output-dir .tmp-expo-export/android` | `_expo/static/js/android/*.hbc` |
| `export:ios` | `expo export --platform ios --output-dir .tmp-expo-export/ios` | `_expo/static/js/ios/*.hbc` |

Each one produces a full Metro bundle plus Hermes bytecode for its platform.
They are the cheapest way to catch a bundler-level break — an unresolved
`require()` in the generated asset map, a module a shared package pulls in
that Metro cannot resolve, a platform-conditional import that only one
platform takes — without an Android SDK, Xcode, an emulator, or a device.

**What these verify, and what they do not.** `expo export` only bundles and
compiles JavaScript. No native code is compiled for either platform, so both
scripts run on Windows and Linux with no Android SDK installed, and
`export:ios` needs no macOS host, no Xcode, and no CocoaPods install. That
also bounds what a green run proves: it says the JS graph resolves and Hermes
accepts it for that platform. It says nothing about native modules linking,
app startup, layout on a real screen, or anything in either native runtime.
Neither script **replaces** a development build (`expo run:android`,
`expo run:ios`) or a run on an emulator, simulator, or real device — do those
before trusting a change on that platform.

From the repository root, `npm run build:mobile` runs
`scripts/check-native.mjs`, `export:android`, `export:ios`, and
`scripts/check-bundle.mjs` (the image and font size budgets). It is a static and
bundle check, not an APK/IPA build. `.github/workflows/ci.yml` runs it after
`typecheck`, `lint`, and `test`, and before the web build.

## Verified on simulators

Native simulator acceptance ran on commit `ddc1e73` and finished on 2026-10-29 KST.
Details are in the [acceptance record](../qa/home/native-simulator-acceptance.json)
and the [handoff report](../qa/home/native-simulator-acceptance-handoff.txt).

| Platform | Device | Initial full run | Outcome |
| --- | --- | --- | --- |
| Android | Pixel_8 · API 36 | 28/28 passed | All 28 scenarios accepted |
| iOS | iPhone 18 Pro · iOS 27.0 | 27/28 passed, 1 failed | All 28 scenarios accepted after a retest |

The iOS failure is kept on record as a failed initial run. The final Analytics
promotion start button sat at y=842 in the home-indicator region and the tap did
not enter battle. Centering promotion buttons before tapping passed all five
missions plus MASTER and restart in the full-path retest. No gameplay code changed.

Supplemental checks passed on both platforms: landscape short-answer submission and
the full 174/174 dex in portrait and landscape. iOS also confirmed that rotation
keeps battle progress, and Android confirmed hardware-back behavior in battle.
Maestro's landscape submit tap did not activate the button on iOS, so the iOS checks
were made directly with Device Hub rather than by automation.

The acceptance run predates the progression guards in `7a332d2`, and no native
simulator rerun was part of that web-focused change.

## Known limitations

- **No published native build.** EAS, APK/IPA, and store release are excluded so far.
- **Simulator acceptance is not physical-device acceptance.** New IME, touch comfort,
  and accessibility checks on physical devices remain deferred.
- **Real DB, OAuth, and cloud save round trips have not been accepted.** The account
  panel only has a client when `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set. COD-258 (local save attribution
  and merge) and COD-259 (online/offline sync) are postponed until the environment
  is designed.
- **New workshops and tier 3 projects await simulator/device acceptance.** The source adds six native scenarios (34 total) and six manual starting states (23 total); previous acceptance results remain historical.
- **Request and discovery history stays on each device.** It does not travel with
  an exported save, although captured cards do.
