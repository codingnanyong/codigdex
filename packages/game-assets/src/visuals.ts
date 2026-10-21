/** Shared art direction for web and native renderers. */
export const WALLPAPERS = {
  field: "wallpapers/codigdex-title-archive-v1.png",
  tutorial: "wallpapers/tutorial-loop-forest-v1.png",
  git: "wallpapers/git-battle-arena-v1.png",
  linux: "wallpapers/linux-battle-arena-v1.png",
} as const;

export type Scenery = keyof typeof WALLPAPERS;

export const PALETTE = {
  ink: 0x2a1d14, maroon: 0xa33422, amber: 0xe8834f, wood: 0x6b4226,
  sand: 0xd6bd91, cream: 0xf1e4cb, mutedBrown: 0x7a6248, nightBrown: 0x180f08,
} as const;

export const PALETTE_HEX = {
  ink: "#2a1d14", maroon: "#a33422", amber: "#e8834f", wood: "#6b4226",
  sand: "#d6bd91", cream: "#f1e4cb", mutedBrown: "#7a6248", nightBrown: "#180f08",
} as const;
