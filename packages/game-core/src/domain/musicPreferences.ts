export interface MusicPreferences { enabled: boolean; volume: number }
export const MUSIC_PREFERENCES_KEY = "codigdex:music:v1";
export const DEFAULT_MUSIC_PREFERENCES: MusicPreferences = { enabled: true, volume: .3 };
export function parseMusicPreferences(raw: string | null): MusicPreferences {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...DEFAULT_MUSIC_PREFERENCES };
    const data = value as Record<string, unknown>;
    return { enabled: typeof data.enabled === "boolean" ? data.enabled : true,
      volume: typeof data.volume === "number" && Number.isFinite(data.volume) ? Math.min(1, Math.max(0, data.volume)) : .3 };
  } catch { return { ...DEFAULT_MUSIC_PREFERENCES }; }
}
