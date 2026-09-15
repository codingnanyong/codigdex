const FALLBACK = "monospace";

/**
 * Galmuri7 is a 7px bitmap face: it only renders crisply at that size and
 * whole multiples of it. Anything in between gets stretched by the browser
 * into blurry mush, which reads as "not a pixel font" on screen — and even
 * at 1x its Latin glyphs are single-pixel strokes that antialias badly, so
 * body copy starts at 2x. Text picks a role here instead of a raw px size.
 */
const PIXEL_SIZES = {
  micro: 7, // 1x — symbols, numbers and short all-caps labels only
  caption: 14, // readable Korean labels and secondary information
  body: 14, // 2x
  subtitle: 21, // 3x
  title: 28, // 4x
  hero: 42, // 6x
  display: 70, // 10x — title screens only
} as const;

export type PixelTextRole = keyof typeof PIXEL_SIZES;

const PIXEL_FONT_VARIABLE = "--font-pixel";
const BODY_FONT_VARIABLE = "--font-pixel-body";
let fontReadyPromise: Promise<void> | undefined;

/**
 * Body copy is where the quiz prompts and answers live, and Galmuri7 at 2x
 * clumps Hangul finals into blocks. Galmuri14 has the same 14px footprint
 * drawn on its own grid, so it swaps in without moving any layout.
 */
export function fontVariableFor(role: PixelTextRole): string {
  return role === "body" || role === "caption" ? BODY_FONT_VARIABLE : PIXEL_FONT_VARIABLE;
}

export function getPixelFontFamily(variable: string = PIXEL_FONT_VARIABLE): string {
  if (typeof document === "undefined") return FALLBACK;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${FALLBACK}` : FALLBACK;
}

/** Font family + size for a text role, sized to stay pixel-sharp and legible when the game canvas shrinks. */
export function pixelText(
  role: PixelTextRole
): { fontFamily: string; fontSize: string; resolution: number } {
  return {
    fontFamily: getPixelFontFamily(fontVariableFor(role)),
    fontSize: `${PIXEL_SIZES[role]}px`,
    // Phaser rasterizes Text to its own canvas. A 2x source keeps strokes and
    // Hangul finals distinct when the 960x540 game is scaled down in CSS.
    resolution: 2,
  };
}

export function whenPixelFontReady(callback: () => void) {
  if (typeof document === "undefined" || !document.fonts?.load) {
    callback();
    return;
  }
  // Canvas text never makes the browser fetch a face the page itself doesn't
  // use, so request each one explicitly. Cache the work: dynamic panels call
  // this helper often, but loading the same font and awaiting document.fonts
  // again adds needless microtasks and font-set scans.
  fontReadyPromise ??= Promise.all(
    [PIXEL_FONT_VARIABLE, BODY_FONT_VARIABLE].map((variable) =>
      document.fonts.load(`14px ${getPixelFontFamily(variable)}`)
    )
  )
    .then(() => document.fonts.ready)
    .then(() => undefined);
  fontReadyPromise.then(callback, callback);
}
