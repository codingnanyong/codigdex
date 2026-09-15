/**
 * Web adapter for @codigdex/game-assets. `scripts/sync-assets.mjs` copies the
 * package's files into public/assets before dev and build, so an asset key
 * is served at /assets/<key>.
 */
export const WEB_ASSET_ROOT = "/assets";

export const assetUrl = (assetKey: string) => `${WEB_ASSET_ROOT}/${assetKey}`;
