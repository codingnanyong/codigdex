const FALLBACK = "monospace";

/**
 * Galmuri7 is a 7px bitmap face: it only renders crisply at that size and
 * whole multiples of it. Anything in between gets stretched by the browser
 * into blurry mush, which reads as "not a pixel font" on screen — and even
 * at 1x its Latin glyphs are single-pixel strokes that antialias badly, so
 * body copy starts at 2x. Text picks a role here instead of a raw px size.
 */
const PIXEL_SIZES = {
  caption: 7, // 1x — short all-caps labels only
  body: 14, // 2x
  subtitle: 21, // 3x
  title: 28, // 4x
  hero: 42, // 6x
} as const;

export type PixelTextRole = keyof typeof PIXEL_SIZES;

export function getPixelFontFamily(): string {
  if (typeof document === "undefined") return FALLBACK;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-pixel")
    .trim();
  return value ? `${value}, ${FALLBACK}` : FALLBACK;
}

/** Font family + size for a text role, sized to stay pixel-sharp. */
export function pixelText(role: PixelTextRole): { fontFamily: string; fontSize: string } {
  return { fontFamily: getPixelFontFamily(), fontSize: `${PIXEL_SIZES[role]}px` };
}

export function whenPixelFontReady(callback: () => void) {
  if (typeof document === "undefined" || !document.fonts?.ready) {
    callback();
    return;
  }
  document.fonts.ready.then(callback).catch(callback);
}
