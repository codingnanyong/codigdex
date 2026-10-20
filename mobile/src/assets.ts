import { isAssetKey } from "@codigdex/game-assets/manifest";
import type { ImageSourcePropType } from "react-native";
import { MOBILE_ASSETS } from "./assets.generated";

export function mobileAssetSource(key: string): ImageSourcePropType {
  if (!isAssetKey(key)) throw new Error(`Unknown Codigdex asset key: ${key}`);
  if (!Object.prototype.hasOwnProperty.call(MOBILE_ASSETS, key)) throw new Error(`Asset is not bundled for mobile: ${key}`);
  return MOBILE_ASSETS[key as keyof typeof MOBILE_ASSETS];
}
