import {
  findSecondaryJob,
  isSecondaryJobUnlocked,
  type JobId,
  type SecondaryJobOption,
  type TertiaryJobOption,
} from "@codigdex/game-content/domain/player/jobs";

/**
 * Returns the required tier-2 job only after its card has been revealed.
 * Locked tier-3 feedback must not disclose a name still shown as ???.
 */
export function revealedTertiaryRequirement(
  job: TertiaryJobOption,
  completedJobIds: ReadonlySet<JobId>
): SecondaryJobOption | undefined {
  const required = findSecondaryJob(job.requires);
  return required && isSecondaryJobUnlocked(required, completedJobIds) ? required : undefined;
}
