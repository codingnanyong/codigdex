import { PALETTE_HEX } from "@codigdex/game-assets/visuals";

export const colors = {
  background: PALETTE_HEX.cream,
  panel: "#fff2d5",
  panelRaised: PALETTE_HEX.sand,
  cyan: PALETTE_HEX.wood,
  blue: PALETTE_HEX.wood,
  amber: PALETTE_HEX.maroon,
  text: PALETTE_HEX.ink,
  muted: PALETTE_HEX.mutedBrown,
  border: PALETTE_HEX.mutedBrown,
  danger: PALETTE_HEX.maroon,
  shadow: PALETTE_HEX.ink,
  highlight: "#fff9e8",
  grass: "#bdd1a2",
  path: "#c5a56b"
} as const;

export const font = "Galmuri14";

export const pixelPanel = {
  backgroundColor: colors.panel,
  borderColor: colors.shadow,
  borderWidth: 2,
  borderBottomWidth: 4,
  borderRadius: 0,
} as const;
