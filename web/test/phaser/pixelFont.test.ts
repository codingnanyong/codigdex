import { describe, expect, it, vi } from "vitest";
import { PixelTextRole, getPixelFontFamily, pixelText, whenPixelFontReady } from "@/lib/phaser/pixelFont";

describe("getPixelFontFamily", () => {
  it("falls back to monospace when there is no document (e.g. server-side)", () => {
    expect(getPixelFontFamily()).toBe("monospace");
  });
});

describe("pixelText", () => {
  // Galmuri7 only stays sharp at 7px and whole multiples of it, so these
  // exact numbers are the point of the role ladder — not arbitrary sizes.
  const EXPECTED: Record<PixelTextRole, string> = {
    caption: "7px",
    body: "14px",
    subtitle: "21px",
    title: "28px",
    hero: "42px",
  };

  it.each(Object.entries(EXPECTED))("sizes the %s role at %s", (role, fontSize) => {
    expect(pixelText(role as PixelTextRole).fontSize).toBe(fontSize);
  });

  it("keeps every role on a whole multiple of the 7px bitmap grid", () => {
    for (const role of Object.keys(EXPECTED) as PixelTextRole[]) {
      expect(parseInt(pixelText(role).fontSize, 10) % 7).toBe(0);
    }
  });

  it("uses one family for every role", () => {
    const families = (Object.keys(EXPECTED) as PixelTextRole[]).map((role) => pixelText(role).fontFamily);
    expect(new Set(families).size).toBe(1);
    expect(families[0]).toBe(getPixelFontFamily());
  });
});

describe("whenPixelFontReady", () => {
  it("invokes the callback immediately when there is no document", () => {
    const callback = vi.fn();
    whenPixelFontReady(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
