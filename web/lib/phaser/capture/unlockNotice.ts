import { unlockAfter } from "@codigdex/game-content/domain/chapters";
import type { ChapterId } from "@codigdex/game-core/domain/chapters/types";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";

/**
 * The line announcing what a first capture opened, plus the chapter whose
 * stage panel the path map should open next so the player can carry on.
 */
export function describeUnlock(
  monsterId: string,
  locale: Locale
): { notice: string; focusChapterId?: ChapterId } {
  const unlock = unlockAfter(monsterId);
  switch (unlock.kind) {
    case "stage":
      return {
        notice: translate(locale, "unlock.stage", {
          level: unlock.monster.level,
          name: unlock.monster.name[locale],
        }),
        focusChapterId: unlock.chapter.id,
      };
    case "chapter":
      return {
        notice: translate(locale, "unlock.chapter", {
          label: unlock.chapter.label,
          name: unlock.chapter.name[locale],
        }),
        focusChapterId: unlock.chapter.id,
      };
    case "common-path-complete":
      return { notice: translate(locale, "unlock.commonPath") };
    case "career-region-complete":
      return { notice: translate(locale, "unlock.careerRegion") };
  }
}
