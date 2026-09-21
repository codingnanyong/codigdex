const SCREEN_HORIZONTAL_PADDING = 40;
const GRID_GAP = 12;
const TWO_COLUMN_MIN_CARD_WIDTH = 130;
const MAX_CARD_WIDTH = 190;
const MAX_IMAGE_SIZE = 108;
const CARD_HORIZONTAL_PADDING = 24;

export interface DexGridMetrics {
  cardWidth: number;
  columns: 1 | 2;
  imageSize: number;
}

export function dexGridMetrics(viewportWidth: number): DexGridMetrics {
  const contentWidth = Math.max(0, viewportWidth - SCREEN_HORIZONTAL_PADDING);
  const twoColumnWidth = (contentWidth - GRID_GAP) / 2;
  const columns = twoColumnWidth >= TWO_COLUMN_MIN_CARD_WIDTH ? 2 : 1;
  const cardWidth = Math.max(0, Math.min(MAX_CARD_WIDTH, columns === 2 ? twoColumnWidth : contentWidth));
  const imageSize = Math.max(0, Math.min(MAX_IMAGE_SIZE, cardWidth - CARD_HORIZONTAL_PADDING));

  return { cardWidth, columns, imageSize };
}
