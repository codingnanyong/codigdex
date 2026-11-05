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
  const latestPreferences = useRef(DEFAULT_MUSIC_PREFERENCES);
  const earlyChanges = useRef<Partial<MusicPreferences>>({});
  const preferencesReady = useRef(false);
  const writes = useRef(Promise.resolve());
  const persist = useCallback((next: MusicPreferences) => {
    writes.current = writes.current.catch(() => undefined).then(() => AsyncStorage.setItem(MUSIC_PREFERENCES_KEY, JSON.stringify(next))).catch(() => setError(true));
  }, []);
  const registrations = useRef(new Map<symbol, { region: string; priority: number }>());
  const choose = useCallback(() => {
    const selected = [...registrations.current.values()].sort((a,b) => b.priority - a.priority)[0];
    if (selected) setRegion(selected.region); // Keep music through settings/loading when no screen claims a region.
  }, []);
  const register = useCallback((id: symbol, next: string | undefined, priority: number) => {
    if (musicTrack(next)) registrations.current.set(id, { region: next!, priority }); else registrations.current.delete(id);
    choose();
  }, [choose]);
  const unregister = useCallback((id: symbol) => { registrations.current.delete(id); choose(); }, [choose]);
  useEffect(() => {
    let live = true;
    void AsyncStorage.getItem(MUSIC_PREFERENCES_KEY).catch(() => null).then(raw => {
      if (!live) return;
      // Override only fields explicitly changed while the saved snapshot was loading.
      const restored = parseMusicPreferences(JSON.stringify({ ...parseMusicPreferences(raw), ...earlyChanges.current }));
      latestPreferences.current = restored;
      preferencesReady.current = true;
      setLocalPreferences(restored);
      if (Object.keys(earlyChanges.current).length) persist(restored);
      earlyChanges.current = {};
      setHydrated(true);
    });
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, allowsRecording: false, interruptionMode: "mixWithOthers" }).catch(() => { if (live) setError(true); });
    const listener = AppState.addEventListener("change", next => setActive(next === "active"));
    return () => { live = false; listener.remove(); };
  }, [persist]);
  const setPreferences = useCallback((next: Partial<MusicPreferences>) => {
    const safe = parseMusicPreferences(JSON.stringify({ ...latestPreferences.current, ...next }));
    if (!preferencesReady.current) {
      if (Object.prototype.hasOwnProperty.call(next, "enabled")) earlyChanges.current.enabled = safe.enabled;
      if (Object.prototype.hasOwnProperty.call(next, "volume")) earlyChanges.current.volume = safe.volume;
    }
    latestPreferences.current = safe;
    setLocalPreferences(safe);
    persist(safe);
  }, [persist]);
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
