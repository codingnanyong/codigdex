export const DETAIL_VIEWPORT_MARGIN = 16;

/** Keeps any fixed or variable-size panel wholly inside the game viewport. */
export function panelScaleToViewport(
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
