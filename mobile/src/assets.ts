import { MOBILE_ASSETS } from "./assets.generated";

export function mobileAssetSource(key: string): number {
  if (!Object.prototype.hasOwnProperty.call(MOBILE_ASSETS, key)) throw new Error(`Asset is not bundled for mobile: ${key}`);
  return MOBILE_ASSETS[key as keyof typeof MOBILE_ASSETS]();
}
