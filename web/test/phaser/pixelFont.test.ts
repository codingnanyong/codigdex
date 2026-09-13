import { describe, expect, it, vi } from "vitest";
import {
  PixelTextRole,
  fontVariableFor,
  getPixelFontFamily,
  pixelText,
  whenPixelFontReady,
} from "@/lib/phaser/pixelFont";

describe("getPixelFontFamily", () => {
  it("falls back to monospace when there is no document (e.g. server-side)", () => {
    expect(getPixelFontFamily()).toBe("monospace");
  });
});

describe("pixelText", () => {
  // Galmuri7 only stays sharp at 7px and whole multiples of it, so these
  // exact numbers are the point of the role ladder — not arbitrary sizes.
  const EXPECTED: Record<PixelTextRole, string> = {
    micro: "7px",
    caption: "14px",
    body: "14px",
    subtitle: "21px",
    title: "28px",
    hero: "42px",
    display: "70px",
  };

  it.each(Object.entries(EXPECTED))("sizes the %s role at %s", (role, fontSize) => {
    expect(pixelText(role as PixelTextRole).fontSize).toBe(fontSize);
  });

  it("keeps every role on a whole multiple of the 7px bitmap grid", () => {
    for (const role of Object.keys(EXPECTED) as PixelTextRole[]) {
      expect(parseInt(pixelText(role).fontSize, 10) % 7).toBe(0);
    }
  });

  it("draws readable body and caption copy in Galmuri14", () => {
    expect(fontVariableFor("body")).toBe("--font-pixel-body");
    expect(fontVariableFor("caption")).toBe("--font-pixel-body");
    for (const role of (Object.keys(EXPECTED) as PixelTextRole[]).filter(
      (role) => role !== "body" && role !== "caption"
    )) {
      expect(fontVariableFor(role)).toBe("--font-pixel");
    }
    expect(pixelText("body").fontFamily).toBe(getPixelFontFamily("--font-pixel-body"));
  });

  it("rasterizes game text at double resolution for scaled canvases", () => {
    for (const role of Object.keys(EXPECTED) as PixelTextRole[]) {
      expect(pixelText(role).resolution).toBe(2);
    }
  });
});

describe("whenPixelFontReady", () => {
  it("invokes the callback immediately when there is no document", () => {
    const callback = vi.fn();
    whenPixelFontReady(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
