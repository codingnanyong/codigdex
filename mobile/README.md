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
| `/settings` | `app/settings.tsx` | Locale picker (ko / en), persisted to the save |

Navigation is [Expo Router](https://docs.expo.dev/router/introduction/) file-based
routing (`app/`), with `typedRoutes` enabled in `app.json`. `app/_layout.tsx`
loads the pixel font, mounts `SaveProvider`, and renders a headerless `Stack`.

Not implemented yet: the battle and capture-quiz loop. `@codigdex/quiz-content`
is deliberately not a dependency of this workspace, and the app never writes new
captures — it reads whatever captures already exist in the save and only writes
the chosen locale.

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
`--check` and fails while the committed map is stale. `npm start` regenerates it
automatically through the `prestart` hook; `start:tunnel`, `android`, and `ios`
have no such hook, so run `generate:assets` yourself if the art changed.

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
`{ hydrated, locale, save, setLocale }` through `useSave()`. Locale defaults to
`ko` until the player picks one in settings. Screens read captures from
`save.progress.captures`.

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
# LAN — device and computer on the same Wi-Fi; regenerates the asset map first
npm run start --workspace @codigdex/mobile

# Tunnel — different networks, or a LAN that blocks the dev server
npm run generate:assets --workspace @codigdex/mobile
npm run start:tunnel --workspace @codigdex/mobile
```

The first tunnel run may prompt Expo CLI to install its tunnel helper. To open a
local simulator or emulator directly:

```bash
npm run android --workspace @codigdex/mobile
npm run ios --workspace @codigdex/mobile
```

## Checks

```bash
npm run typecheck --workspace @codigdex/mobile   # asset-map --check, then tsc --noEmit
npm test --workspace @codigdex/mobile            # vitest run
```

Both are also covered by the root `npm run typecheck` and `npm test`, which fan
out across every workspace.

Tests are plain Vitest over the platform-free modules — `saveStorage.test.ts`
(migration and fallback behavior against an in-memory storage double) and
`dex/catalog.test.ts` (capture flags and released-only detail lookups). There is
no React Native component or rendering test harness in this workspace yet.
