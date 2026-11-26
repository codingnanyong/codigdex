import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import type { Locale } from "@codigdex/game-core/i18n/locale";

/** A readout of the scoring state, never a second scoring implementation. */
export function battleReadout(battle: BattleState, locale: Locale, questionNumber = Math.min(battle.questionIndex + 1, battle.questions.length)) {
  const ko = locale === "ko";
  const total = battle.questions.length, required = Math.ceil(total * 0.6);
  const mistakes = battle.attempts.filter(attempt => !attempt.correct).length;
  const remainingCorrect = Math.max(0, required - battle.correctCount);
  const mistakeAllowance = Math.max(0, total - required - mistakes);
  const threshold = battle.status === "passed" ? (ko ? "포획 준비 완료 · 결과를 확인하세요." : "READY TO CAPTURE · Show the result.")
    : battle.status === "failed" ? (ko ? "통과하지 못했습니다 · 결과에서 다시 도전할 수 있습니다." : "NOT PASSED · You can retry from the result.")
    : remainingCorrect === 0 ? (ko ? "정답 수 충족 · 남은 필수 설계 판단을 확인하세요." : "ANSWER TARGET MET · Complete the remaining required design checks.")
    : (ko ? `포획까지 정답 ${remainingCorrect}개 더 필요` : `${remainingCorrect} more correct ${remainingCorrect === 1 ? "answer" : "answers"} to capture`);
  const caption = battle.status === "active" && remainingCorrect === 0
    ? (ko ? "필수 판단 남음" : "REQUIRED CHECKS LEFT")
    : battle.status === "active" ? (ko ? `정답 ${remainingCorrect}개 더 필요` : `${remainingCorrect} correct answers left`)
    : threshold.split(" · ")[0];
  return { caption, required, remainingCorrect, mistakeAllowance, health: remainingCorrect / required, threshold,
    progress: ko ? `문제 ${questionNumber}/${total} · 정답 ${battle.correctCount}개 · 목표 ${required}개 (60%) · 오답 여유 ${mistakeAllowance}회`
      : `QUESTION ${questionNumber}/${total} · CORRECT ${battle.correctCount} · TARGET ${required} (60%) · MISTAKES LEFT ${mistakeAllowance}` };
}
