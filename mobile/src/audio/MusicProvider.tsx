import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { musicTrack } from "@codigdex/game-assets/music";
import { DEFAULT_MUSIC_PREFERENCES, MUSIC_PREFERENCES_KEY, parseMusicPreferences, type MusicPreferences } from "@codigdex/game-core/domain/musicPreferences";
import { AUDIO_ASSETS } from "../audio.generated";
import { MusicContext } from "./MusicContext";

export function MusicProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [preferences, setLocalPreferences] = useState(DEFAULT_MUSIC_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState(false);
  const [region, setRegion] = useState<string>();
  const [active, setActive] = useState(AppState.currentState === "active");
  const registrations = useRef(new Map<symbol, { region: string; priority: number }>());
  const choose = useCallback(() => {
    const selected = [...registrations.current.values()].sort((a,b) => b.priority - a.priority)[0];
    if (selected) setRegion(selected.region);
  }, []);
  const register = useCallback((id: symbol, next: string | undefined, priority: number) => {
    if (musicTrack(next)) registrations.current.set(id, { region: next!, priority }); else registrations.current.delete(id);
    choose();
  }, [choose]);
  const unregister = useCallback((id: symbol) => { registrations.current.delete(id); choose(); }, [choose]);
  useEffect(() => {
    let live = true;
    void AsyncStorage.getItem(MUSIC_PREFERENCES_KEY).then(raw => { if (live) setLocalPreferences(parseMusicPreferences(raw)); }).catch(() => undefined).finally(() => { if (live) setHydrated(true); });
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, allowsRecording: false, interruptionMode: "mixWithOthers" }).catch(() => { if (live) setError(true); });
    const listener = AppState.addEventListener("change", next => setActive(next === "active"));
    return () => { live = false; listener.remove(); };
  }, []);
  const writes = useRef(Promise.resolve());
  const setPreferences = useCallback((next: MusicPreferences) => {
    const safe = parseMusicPreferences(JSON.stringify(next));
    setLocalPreferences(safe);
    writes.current = writes.current.catch(() => undefined).then(() => AsyncStorage.setItem(MUSIC_PREFERENCES_KEY, JSON.stringify(safe))).catch(() => setError(true));
  }, []);
  useEffect(() => {
    const track = musicTrack(region);
    if (!track) return;
    try { player.pause(); player.replace(AUDIO_ASSETS[track.assetKey]()); player.loop = true; setError(false); }
    catch { setError(true); }
  }, [player, region]);
  useEffect(() => {
    try {
      player.volume = preferences.volume;
      if (hydrated && active && preferences.enabled && preferences.volume > 0 && status.isLoaded) player.play(); else player.pause();
    } catch { setError(true); }
  }, [player, region, hydrated, active, preferences, status.isLoaded]);
  const controls = useMemo(() => ({ preferences, setPreferences, title: musicTrack(region)?.title, error, register, unregister }), [preferences, setPreferences, region, error, register, unregister]);
  return <MusicContext.Provider value={controls}>{children}</MusicContext.Provider>;
}
