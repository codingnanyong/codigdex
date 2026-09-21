# Codigdex Mobile

Expo (SDK 57) + React Native client for Codigdex. It shares the game rules,
content, translations, and art with the web app, but renders its own native,
touch-first screens.

**Phaser scenes are not reused here.** The web client's Phaser canvas and its
scene classes stay in `web/`; there is no canvas, WebView, or Phaser dependency
in this workspace. Mobile screens are plain React Native components. When
behavior must match, share it through `@codigdex/game-core` or
`@codigdex/game-content` instead of porting a scene.

## What is implemented

The current vertical slice covers the read-only Codigdex archive:

| Route | File | Screen |
| --- | --- | --- |
| `/` | `app/index.tsx` | Intro / title screen with save-hydration status |
| `/dex` | `app/dex/index.tsx` | Responsive two-column dex grid with capture stats |
| `/dex/[id]` | `app/dex/[id].tsx` | Monster card: art, trait, code note, snippet |
| `/settings` | `app/settings.tsx` | Locale picker (ko / en) plus the dev-only home test panel |

Navigation is [Expo Router](https://docs.expo.dev/router/introduction/) file-based
routing (`app/`), with `typedRoutes` enabled in `app.json`. `app/_layout.tsx`
loads the pixel font, mounts `SaveProvider`, and renders a headerless `Stack`.

Not implemented yet: the battle and capture-quiz loop. `@codigdex/quiz-content`
is deliberately not a dependency of this workspace, and no gameplay path earns a
capture — the screens read whatever captures already exist in the save. Outside
of the development-only controls described under [Home testing](#home-testing),
the only field the app writes is the chosen locale.

## Shared packages

The mobile client reuses:

- `@codigdex/game-core` — save schema and v1/v2 → v3 migrations
  (`save/schema`, `save/storage`), locale contracts (`i18n/locale`)
- `@codigdex/game-content` — `DEX_CATALOG` (released and planned dex slots),
  monsters, chapters, careers
- `@codigdex/game-i18n` — `translate()` UI message catalogs
- `@codigdex/game-assets` — art files, resolved from asset keys through a
  generated static `require()` map

Rendering, navigation, input, audio, and persistence adapters live in this
directory because those concerns differ between web and mobile.

## Assets

Shared packages store **asset keys** (paths relative to
`packages/game-assets/files/`), never URLs or bundler imports. Metro cannot
resolve a dynamic `require()`, so `scripts/generate-asset-map.mjs` reads the key
list out of `packages/game-assets/src/manifest.generated.ts` and writes one
static `require()` per key into `src/assets.generated.ts`, typed as
`Readonly<Record<AssetKey, ImageSourcePropType>>`.

`src/assets.ts` exposes `mobileAssetSource(key)`, which validates the key with
`isAssetKey()` and throws on an unknown one.

`src/assets.generated.ts` is committed. Regenerate it after adding, renaming, or
removing art:

```bash
npm run generate --workspace @codigdex/game-assets   # refresh the shared manifest first
npm run generate:assets --workspace @codigdex/mobile
```

`npm run typecheck --workspace @codigdex/mobile` runs the generator with
`--check` and fails while the committed map is stale. Every launch script —
`start`, `start:tunnel`, `android`, `ios` — and both export scripts,
`export:android` and `export:ios`, regenerate the map before Expo starts, so a
stale map cannot reach the bundler.

## Save persistence

`src/storage/asyncStorage.ts` binds `@react-native-async-storage/async-storage`
to `createAsyncSaveStorage()` in `src/storage/saveStorage.ts`, which implements
the shared `SaveStorage` contract. The schema is `StoredGameStateV3` — captures
and career milestones under `progress`, job ids under `player`, onboarding flag
and locale under `ui`.

On `load()` the adapter tries the AsyncStorage keys in order:

1. `codigdex:save:v3` (`SAVE_STORAGE_KEYS.current`)
2. `codigdex:save:v2` (`SAVE_STORAGE_KEYS.previous`)
3. `codigdex:save:v1` (`SAVE_STORAGE_KEYS.legacy`)

Each candidate goes through `parseSave()`, which migrates v1 and v2 payloads up
to v3 (v1's `selectedJob` becomes `player.primaryJobId`, and career milestones
are backfilled from the captures and job ids). The first key that parses wins;
when it was not the v3 key, the migrated result is written back to
`codigdex:save:v3` so the next launch reads the current layout directly. An
unparseable value falls through to the next key, and a storage read failure or
an exhausted list returns `createEmptySave()` rather than throwing.

`save()` only ever writes `codigdex:save:v3`. `clear()` removes all three keys.

`src/state/SaveProvider.tsx` hydrates the save once on mount and exposes
`{ hydrated, locale, save, clearCaptures, loadDemoCaptures, setLocale }` through
`useSave()`. Locale defaults to `ko` until the player picks one in settings.
Screens read captures from `save.progress.captures`. Every mutator updates the
in-memory save optimistically and then attempts to persist the whole save
through `mobileSaveStorage.save()`. That write is asynchronous and its failures
are currently swallowed, so a rejected write leaves memory ahead of disk with
nothing surfaced to the player.

## Fonts and theme

The pixel font is **Galmuri14**, loaded by `expo-font`'s `useFonts()` in
`app/_layout.tsx` from the `galmuri` npm package's bitmap TTF
(`galmuri/dist/Galmuri14Bitmap-Regular-2.40.3.ttf`). The layout renders `null`
until the font is ready and rethrows a load error, so no screen paints in a
fallback system font. `src/ui/theme.ts` exports the family name as `font` plus
the shared `colors` palette; `src/ui/Screen.tsx` and `src/ui/PixelButton.tsx`
are the shared layout and button primitives.

## Running it in Expo Go

Install once from the repository root (`npm ci`, Node 22.x). Then start the dev
server and scan the QR code with Expo Go on a device:

```bash
# LAN — device and computer on the same Wi-Fi
npm run start --workspace @codigdex/mobile

# Tunnel — different networks, or a LAN that blocks the dev server
npm run start:tunnel --workspace @codigdex/mobile
```

Each script regenerates the asset map first. The first tunnel run may prompt
Expo CLI to install its tunnel helper. To open a local simulator or emulator
directly:

```bash
npm run android --workspace @codigdex/mobile
npm run ios --workspace @codigdex/mobile
```

## Home testing

Because no gameplay path writes a capture yet, the dex would otherwise always
render every slot as unobserved. Settings carries a **home test panel** — the
dashed amber block titled "홈 테스트 도구" / "Home test tools" — to put the save
into either state on demand. It is guarded by `__DEV__`, so it appears in the
dev-server builds started above and is absent from a production bundle
(including both `export:android` and `export:ios`). Open it from the home
screen's settings button, or the ⚙ button in the dex header.

Two controls, both backed by `src/testing/demoSave.ts` and applied through
`useSave()`:

- **LOAD SAMPLE CAPTURES** — registers the first three monsters of `DEX_MONSTERS`
  with a fixed `capturedAt` of `2026-01-01T00:00:00.000Z`. It is deterministic
  and additive: the same three ids every run, and captures already in the save
  are kept as they are, so pressing it twice changes nothing.
- **CLEAR CAPTURES** — empties `progress.captures`, returning every dex slot to
  its unobserved state.

Neither control touches anything else in the save. Locale, job ids, career
milestones, and the onboarding flag survive both actions, so you can switch to
`en`, load samples, and still be in `en`. The panel prints the live capture
count above the buttons as a quick confirmation.

To verify both card states and that persistence holds across a reload:

1. Press **CLEAR CAPTURES**, go back to `/dex`, and confirm every card shows the
   `?` portrait with the `UNOBSERVED` badge, and that the stats line counts zero
   captured. Planned (unreleased) slots stay `???` and remain untappable.
2. Press **LOAD SAMPLE CAPTURES** and confirm the first three released cards now
   show monster art, a localized name, the cyan `REGISTERED` badge, and open
   their `/dex/[id]` detail screen.
3. Reload the app — shake the device and pick **Reload**, or press `r` in the
   Expo CLI terminal — and wait for the home screen to report "SAVE DATA LINKED"
   (`hydrated`). The three captures should still be there, and the locale you
   picked should still be applied.
4. For a cold-start check, fully close and reopen the app in Expo Go. Every
   mutation attempts a write to `codigdex:save:v3` in AsyncStorage, so a state
   that persisted survives that too; only reinstalling or clearing the app's
   storage resets it.

If a reload comes back empty, the AsyncStorage write is the thing to inspect,
not the panel — `SaveProvider` swallows save failures rather than surfacing them.

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

Both export scripts regenerate the asset map and then run `expo export` for one
platform:

| Script | Command it runs | Output |
| --- | --- | --- |
| `export:android` | `expo export --platform android --output-dir .tmp-expo-export/android` | `_expo/static/js/android/entry-*.hbc` |
| `export:ios` | `expo export --platform ios --output-dir .tmp-expo-export/ios` | `_expo/static/js/ios/entry-*.hbc` |

Each one produces a full Metro bundle plus Hermes bytecode for its platform.
They are the cheapest way to catch a bundler-level break — an unresolved
`require()` in the generated asset map, a module a shared package pulls in that
Metro cannot resolve, a platform-conditional import that only one platform
takes — without an Android SDK, Xcode, an emulator, or a device.

**What these verify, and what they do not.** `expo export` only bundles and
compiles JavaScript. No native code is compiled for either platform, so both
scripts run on Windows and Linux with no Android SDK installed, and `export:ios`
needs no macOS host, no Xcode, and no CocoaPods install. That also bounds what a
green run proves: it says the JS graph resolves and Hermes accepts it for that
platform. It says nothing about native modules linking, `AndroidManifest.xml` or
`Info.plist` / entitlement and permission configuration, app startup, layout on
a real screen, or anything in either native runtime. Neither script **replaces**
a development build (`expo run:android`, `expo run:ios`, or EAS Build) or a run
on an emulator, simulator, or real device — do those before trusting a change on
that platform.

The two scripts write to sibling directories under `.tmp-expo-export/`, so they
are independent and can run in either order without one clobbering the other's
bundle. Expo CLI replaces its own output directory at the start of every run, so
no manual pre-clean is needed; the bundle stays there afterward, and
`.tmp-expo-export/` is git-ignored in full. Neither command prompts for
anything; CI additionally pins `CI=true`.

`.github/workflows/ci.yml` runs **both** exports on every pull request touching
`mobile/`, `packages/`, or `web/` — after `typecheck`, `lint`, and `test`, and
before the web build. They are two steps in the same job rather than a matrix,
so the iOS run reuses the Metro transform cache the Android run just warmed
instead of paying for a second checkout and `npm ci`.

Tests are plain Vitest over the platform-free modules — `saveStorage.test.ts`
(migration and fallback behavior against an in-memory storage double) and
`dex/catalog.test.ts` (capture flags and released-only detail lookups). There is
no React Native component or rendering test harness in this workspace yet.
