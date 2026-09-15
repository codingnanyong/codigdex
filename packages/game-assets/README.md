# @codigdex/game-assets

Platform-neutral game art shared by web and mobile. Files live under `files/`
and are addressed by an **asset key**: the path relative to `files/`, such as
`monsters/ch01.git/sprout-lv1.png`.

- Content packages store asset keys, never URLs or bundler imports.
- Each client resolves keys in its own adapter: web copies `files/` into
  `web/public/assets` (`web/scripts/sync-assets.mjs`) and builds `/assets/<key>`
  URLs; mobile should generate a static `require()` map from the manifest,
  because Metro cannot resolve dynamic `require()` calls.
- This package has no workspace or platform dependencies.

After adding, renaming, or removing a file, regenerate the manifest:

```sh
npm run generate --workspace @codigdex/game-assets
```

`typecheck` fails when `src/manifest.generated.ts` is out of date.

Career evolution sheets are the editable source for their five dex portraits.
On Windows, regenerate all normalized 192×192 portraits after changing a
sheet:

```powershell
./scripts/prepare-monster-evolutions.ps1
```

The extractor trims transparent/generated background, removes detached pieces
that crossed a sheet-cell boundary, and centers the remaining specimen. The
asset test rejects portraits that drift back to raw 256×256 sheet cells.
