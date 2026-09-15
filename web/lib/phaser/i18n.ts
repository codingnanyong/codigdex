import type Phaser from "phaser";
import type { Locale, LocalizedText } from "@/lib/i18n/locale";
import { translate, type MessageKey, type MessageParams } from "@/lib/i18n/messages";
import { LOCALE_CHANGE_EVENT } from "./i18nEvents";
import { LOCALE_REGISTRY_KEY, readLocale } from "./registryAdapter";

export function sceneLocale(scene: Phaser.Scene): Locale {
  return readLocale(scene.registry);
}

/** Interface copy in the player's language. */
export function t(scene: Phaser.Scene, key: MessageKey, params?: MessageParams): string {
  return translate(sceneLocale(scene), key, params);
}

/** Content copy (monsters, careers, places) in the player's language. */
export function lt(scene: Phaser.Scene, value: LocalizedText): string {
  return value[sceneLocale(scene)];
}

export function announceLocale(locale: Locale) {
  if (typeof document !== "undefined") document.documentElement.lang = locale;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Locale>(LOCALE_CHANGE_EVENT, { detail: locale }));
  }
}

export function setSceneLocale(scene: Phaser.Scene, locale: Locale) {
  scene.registry.set(LOCALE_REGISTRY_KEY, locale);
  announceLocale(locale);
}
