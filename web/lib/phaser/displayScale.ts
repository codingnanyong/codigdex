/** Device pixels each game pixel covers once the browser stretches the canvas. */
export function devicePixelsPerGamePixel(cssWidth: number, devicePixelRatio: number, gameWidth: number): number {
  return gameWidth > 0 ? (cssWidth * devicePixelRatio) / gameWidth : 0;
}

/**
 * Nearest-neighbour scaling keeps pixel art sharp only at whole-number
 * scales. At 1.25x or 1.5x (common Windows display settings, and most phone
 * layouts) it doubles some pixel rows and not others, so glyph strokes come
 * out uneven; smoothing reads better there.
 */
export function imageRenderingFor(scale: number): "pixelated" | "auto" {
  const whole = Math.round(scale);
  return whole >= 1 && Math.abs(scale - whole) < 0.02 ? "pixelated" : "auto";
}
