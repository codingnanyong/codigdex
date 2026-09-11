import { unlockAfter } from "@/lib/domain/chapters";
import type { ChapterId } from "@/lib/domain/chapters/types";

/**
 * The line announcing what a first capture opened, plus the chapter whose
 * stage panel the path map should open next so the player can carry on.
 */
export function describeUnlock(monsterId: string): { notice: string; focusChapterId?: ChapterId } {
  const unlock = unlockAfter(monsterId);
  switch (unlock.kind) {
    case "stage":
      return {
        notice: `다음 단계 해금 · Lv.${unlock.monster.level} ${unlock.monster.name}`,
        focusChapterId: unlock.chapter.id,
      };
    case "chapter":
      return {
        notice: `다음 챕터 해금 · ${unlock.chapter.label} ${unlock.chapter.name}`,
        focusChapterId: unlock.chapter.id,
      };
    case "common-path-complete":
      return { notice: "공통 과정 완료! 직업 버튼에서 전직할 수 있어요." };
  }
}
