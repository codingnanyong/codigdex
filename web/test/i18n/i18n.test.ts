import { describe, expect, it } from "vitest";
import { CAREER_CATALOG } from "@/lib/domain/careerDex";
import { CHAPTERS } from "@/lib/domain/chapters";
import { TUTORIAL_ONBOARDING_LINES } from "@/lib/domain/chapters/tutorial";
import { JOB_OPTIONS, SECONDARY_JOB_OPTIONS, TERTIARY_JOB_OPTIONS } from "@/lib/domain/player/jobs";
import { TECHNOLOGY_SPECIMENS } from "@/lib/domain/technologySpecimens";
import { detectLocale, formatDate, isLocale, joinText, LOCALES } from "@/lib/i18n/locale";
import { messageCatalog, translate } from "@/lib/i18n/messages";
import { ALL_NODES } from "@/lib/phaser/pathMap/layout";
import { CAREER_PATHS } from "@/lib/phaser/worldMap/careerPaths";
import { WORLD_BACKDROPS } from "@/lib/phaser/worldMap/progression";

const HANGUL = /[가-힣]/;
const placeholders = (copy: string) => [...copy.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();

/** Every { ko, en } pair reachable from `value`, labelled with where it was found. */
function collectLocalizedText(value: unknown, path = "content", found: [string, Record<string, unknown>][] = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLocalizedText(item, `${path}[${index}]`, found));
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (LOCALES.every((locale) => locale in record)) {
      found.push([path, record]);
    } else {
      Object.entries(record).forEach(([key, child]) => collectLocalizedText(child, `${path}.${key}`, found));
    }
  }
  return found;
}

describe("locale helpers", () => {
  it("picks the first supported browser language and falls back to Korean", () => {
    expect(detectLocale(["en-US", "ko-KR"])).toBe("en");
    expect(detectLocale(["fr-FR", "ko"])).toBe("ko");
    expect(detectLocale(["fr-FR", "de"])).toBe("ko");
    expect(detectLocale(undefined)).toBe("ko");
  });

  it("recognizes only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("joins fragments per language", () => {
    expect(joinText([{ ko: "버그 연구원", en: "Bug Researcher" }, { ko: "루피", en: "Lupi" }])).toEqual({
      ko: "버그 연구원 루피",
      en: "Bug Researcher Lupi",
    });
  });

  it("formats dates for the chosen language", () => {
    expect(formatDate("2026-09-15T12:00:00.000Z", "en")).toMatch(/2026/);
    expect(formatDate("2026-09-15T12:00:00.000Z", "ko")).toMatch(/2026/);
  });
});

describe("interface messages", () => {
  const ko = messageCatalog("ko");
  const en = messageCatalog("en");

  it("defines the same keys in every language", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
  });

  it.each(Object.keys(ko))("keeps %s's placeholders identical across languages", (key) => {
    const expected = placeholders(ko[key as keyof typeof ko]);
    for (const locale of LOCALES) {
      const copy = messageCatalog(locale)[key as keyof typeof ko];
      expect(copy.trim()).not.toBe("");
      expect(placeholders(copy)).toEqual(expected);
    }
  });

  it("keeps Hangul out of the English catalog", () => {
    expect(Object.entries(en).filter(([, copy]) => HANGUL.test(copy))).toEqual([]);
  });

  it("fills placeholders and leaves unknown ones visible", () => {
    expect(translate("en", "battle.defeated", { name: "Git Sprout" })).toBe("Git Sprout defeated!");
    expect(translate("ko", "battle.defeated", { name: "깃새싹" })).toBe("깃새싹 격파!");
    expect(translate("en", "battle.defeated")).toBe("{name} defeated!");
  });
});

describe("game content", () => {
  const content = {
    chapters: CHAPTERS,
    onboarding: TUTORIAL_ONBOARDING_LINES,
    jobs: [...JOB_OPTIONS, ...SECONDARY_JOB_OPTIONS, ...TERTIARY_JOB_OPTIONS],
    careers: CAREER_CATALOG,
    specimens: TECHNOLOGY_SPECIMENS,
    careerPaths: CAREER_PATHS,
    backdrops: WORLD_BACKDROPS,
    pathNodes: ALL_NODES,
  };
  const pairs = collectLocalizedText(content);

  it("finds every chapter, quiz and career string", () => {
    // 11 monsters x 20 questions x (1 prompt + 4 choices) alone is 1100 pairs.
    expect(pairs.length).toBeGreaterThan(1100);
  });

  it("gives every string a non-empty translation", () => {
    const missing = pairs.filter(([, pair]) => LOCALES.some((locale) => String(pair[locale] ?? "").trim() === ""));
    expect(missing.map(([path]) => path)).toEqual([]);
  });

  it("never leaves Korean in an English string", () => {
    const untranslated = pairs.filter(([, pair]) => HANGUL.test(String(pair.en)));
    expect(untranslated.map(([path, pair]) => `${path}: ${pair.en}`)).toEqual([]);
  });
});
