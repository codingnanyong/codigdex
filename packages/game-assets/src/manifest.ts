import { ASSET_KEYS } from "./manifest.generated";

export { ASSET_KEYS };

/** A file under `files/`, addressed by its path relative to that folder. */
export type AssetKey = (typeof ASSET_KEYS)[number];

const assetKeys: ReadonlySet<string> = new Set(ASSET_KEYS);

export function isAssetKey(value: string): value is AssetKey {
  return assetKeys.has(value);
}
