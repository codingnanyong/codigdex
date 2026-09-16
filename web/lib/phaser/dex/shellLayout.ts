export const DEX_PANEL = { width: 780, height: 460, inset: 16 };
export const DEX_FOOTER = { height: 48, buttonHeight: 30, bottomPadding: 11 };

export interface DexScreen {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/** Shared footer geometry so content and controls never occupy the bottom bezel. */
export function dexFooterLayout(screen: DexScreen) {
  const bottom = screen.top + screen.height;
  return {
    contentBottom: bottom - DEX_FOOTER.height,
    buttonY: bottom - DEX_FOOTER.bottomPadding - DEX_FOOTER.buttonHeight / 2,
  };
}
