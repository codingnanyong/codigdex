/** Nine ecosystem arenas, shared by encounter, battle and result screens. */
export const OPEN_SOURCE_ARENA_FAMILIES = ["hadoop", "orchestration", "streaming", "lakehouse", "quality", "analytics", "ml", "platform", "application"] as const;
export const openSourceArenaArt = (family: string) => `wallpapers/open-source/${family}-arena-v1.png`;
export const OPEN_SOURCE_MOBILE_ART = OPEN_SOURCE_ARENA_FAMILIES.map(openSourceArenaArt);
