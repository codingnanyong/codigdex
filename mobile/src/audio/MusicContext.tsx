import { createContext, useContext, useEffect, useRef } from "react";
import { DEFAULT_MUSIC_PREFERENCES, type MusicPreferences } from "@codigdex/game-core/domain/musicPreferences";

export interface MusicControls {
  preferences: MusicPreferences;
  title?: string;
  error: boolean;
  setPreferences(next: Partial<MusicPreferences>): void;
  register(id: symbol, region: string | undefined, priority: number): void;
  unregister(id: symbol): void;
}
const noop = () => {};
export const MusicContext = createContext<MusicControls>({ preferences: DEFAULT_MUSIC_PREFERENCES, error: false, setPreferences: noop, register: noop, unregister: noop });
export const useMusic = () => useContext(MusicContext);
export function useRegionMusic(region: string | undefined, priority = 0) {
  const { register, unregister } = useMusic();
  const id = useRef(Symbol("region-music"));
  useEffect(() => { register(id.current, region, priority); }, [region, priority, register]);
  useEffect(() => { const key = id.current; return () => unregister(key); }, [unregister]);
}
