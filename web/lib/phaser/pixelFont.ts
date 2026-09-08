const FALLBACK = "monospace";

export function getPixelFontFamily(): string {
  if (typeof document === "undefined") return FALLBACK;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-pixel")
    .trim();
  return value ? `${value}, ${FALLBACK}` : FALLBACK;
}

export function whenPixelFontReady(callback: () => void) {
  if (typeof document === "undefined" || !document.fonts?.ready) {
    callback();
    return;
  }
  document.fonts.ready.then(callback).catch(callback);
}
