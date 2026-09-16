import { describe, expect, it } from "vitest";
import {
  DEX_FOOTER,
  DEX_PANEL,
  dexFooterLayout,
  type DexScreen,
} from "@/lib/phaser/dex/shellLayout";

describe("Codigdex footer layout", () => {
  const screen: DexScreen = {
    left: 106,
    top: 56,
    width: DEX_PANEL.width - DEX_PANEL.inset * 2,
    height: DEX_PANEL.height - DEX_PANEL.inset * 2,
    centerX: 480,
    centerY: 270,
  };

  it("keeps the footer buttons clear of the inner screen border", () => {
    const footer = dexFooterLayout(screen);
    const screenBottom = screen.top + screen.height;
    const buttonBottom = footer.buttonY + DEX_FOOTER.buttonHeight / 2;

    expect(buttonBottom).toBe(screenBottom - DEX_FOOTER.bottomPadding);
    expect(buttonBottom).toBeLessThan(screenBottom);
  });

  it("reserves a separate content area above the footer", () => {
    const footer = dexFooterLayout(screen);
    const buttonTop = footer.buttonY - DEX_FOOTER.buttonHeight / 2;

    expect(footer.contentBottom).toBeLessThan(buttonTop);
  });
});
