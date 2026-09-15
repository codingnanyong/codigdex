export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** The game was written in Korean first, so it is the fallback for unknown languages. */
export const DEFAULT_LOCALE: Locale = "ko";

/** Every player-facing string carries all supported languages, so a missing translation fails type-checking. */
export type LocalizedText = Readonly<Record<Locale, string>>;

/** Each language's name written in that language, as shown in the settings panel. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  ko: "한국어",
  en: "English",
};

const DATE_LOCALE_TAGS: Readonly<Record<Locale, string>> = {
  ko: "ko-KR",
  en: "en-US",
};

export function text(ko: string, en: string): LocalizedText {
  return { ko, en };
}

/** Text that reads the same in every language: commands, code, product names. */
export function same(value: string): LocalizedText {
  return { ko: value, en: value };
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function localize(value: LocalizedText, locale: Locale): string {
  return value[locale];
}

/** Joins localized fragments per language, e.g. a guide's title and name. */
export function joinText(parts: readonly LocalizedText[], separator = " "): LocalizedText {
  return {
    ko: parts.map((part) => part.ko).join(separator),
    en: parts.map((part) => part.en).join(separator),
  };
}

/** Picks the first supported language from the browser's preference list. */
export function detectLocale(languages: readonly string[] | undefined): Locale {
  for (const language of languages ?? []) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE_TAGS[locale]);
}
