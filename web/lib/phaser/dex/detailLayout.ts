export const DETAIL_VIEWPORT_MARGIN = 16;

/** Keeps a variable-height dex card wholly inside the fixed 960x540 game viewport. */
export function detailPanelScale(
  panelWidth: number,
  panelHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  margin = DETAIL_VIEWPORT_MARGIN
): number {
  const availableWidth = Math.max(1, viewportWidth - margin * 2);
  const availableHeight = Math.max(1, viewportHeight - margin * 2);
  return Math.min(1, availableWidth / panelWidth, availableHeight / panelHeight);
}
