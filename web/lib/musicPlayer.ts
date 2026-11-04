import { musicTrack } from "@codigdex/game-assets/music";
import { DEFAULT_MUSIC_PREFERENCES, MUSIC_PREFERENCES_KEY, parseMusicPreferences, type MusicPreferences } from "@codigdex/game-core/domain/musicPreferences";
import { assetUrl } from "./assets";
import { AudioBufferCache } from "./audioBufferCache";

export interface MusicState { region?: string; title?: string; playing: boolean; error: boolean; preferences: MusicPreferences }
/** One game-owned audio graph; the only permitted overlap is a short crossfade. */
export class MusicPlayer {
  private context?: AudioContext;
  private current?: { region: string; source: AudioBufferSourceNode; gain: GainNode };
  private desired?: string;
  private generation = 0;
  private disposed = false;
  private buffers = new AudioBufferCache();
  private loadController?: AbortController;
  private decoding: Promise<void> = Promise.resolve();
  private preferences: MusicPreferences;
  private error = false;
  private listeners = new Set<(state: MusicState) => void>();
  constructor(private createContext = () => new AudioContext()) {
    let raw: string | null = null;
    try { raw = localStorage.getItem(MUSIC_PREFERENCES_KEY); } catch { /* Device settings remain usable in memory. */ }
    this.preferences = parseMusicPreferences(raw);
    window.addEventListener("pointerdown", this.unlock, true);
    window.addEventListener("keydown", this.unlock, true);
    document.addEventListener("visibilitychange", this.visibility);
  }
  snapshot(): MusicState {
    const track = musicTrack(this.desired);
    return { region: track?.region, title: track?.title, playing: !!this.current && this.context?.state === "running" && this.preferences.enabled && this.preferences.volume > 0,
      error: this.error, preferences: { ...this.preferences } };
  }
  subscribe(listener: (state: MusicState) => void) { this.listeners.add(listener); listener(this.snapshot()); return () => { this.listeners.delete(listener); }; }
  private publish() { if (!this.disposed) this.listeners.forEach(listener => listener(this.snapshot())); }
  setRegion(region: string | undefined) {
    if (!region || !musicTrack(region) || region === this.desired) return;
    this.loadController?.abort();
    this.desired = region; this.generation++; this.error = false;
    this.publish(); void this.playDesired();
  }
  setPreferences(next: MusicPreferences) {
    this.preferences = parseMusicPreferences(JSON.stringify(next));
    try { localStorage.setItem(MUSIC_PREFERENCES_KEY, JSON.stringify(this.preferences)); } catch { /* Keep playing with in-memory settings. */ }
    if (this.current && this.context) this.current.gain.gain.setTargetAtTime(this.preferences.volume, this.context.currentTime, .03);
    this.visibility(); this.publish();
  }
  private unlock = () => {
    if (this.disposed || !this.preferences.enabled || !this.preferences.volume || document.hidden) return;
    try {
      this.context ??= this.createContext();
      void this.context.resume().then(() => {
        if (this.disposed) return;
        if (document.hidden || !this.preferences.enabled || !this.preferences.volume) { this.visibility(); return; }
        this.publish(); return this.playDesired();
      }).catch(() => { this.error = true; this.publish(); });
    } catch { this.error = true; this.publish(); }
  };
  private visibility = () => {
    if (document.hidden || !this.preferences.enabled || !this.preferences.volume) {
      void this.context?.suspend().then(() => this.publish()).catch(() => undefined);
    } else if (this.context) this.unlock();
  };
  private loading = new Set<number>();
  private async playDesired() {
    const region = this.desired, context = this.context, track = musicTrack(region);
    if (this.disposed || !context || context.state !== "running" || !track || document.hidden || !this.preferences.enabled || !this.preferences.volume) return;
    if (this.current?.region === region || this.loading.has(this.generation)) return;
    const generation = this.generation;
    this.loading.add(generation);
    const controller = new AbortController();
    this.loadController = controller;
    try {
      let buffer = this.buffers.get(region!);
      if (!buffer) {
        const response = await fetch(assetUrl(track.assetKey), { signal: controller.signal });
        if (!response.ok) throw new Error("Music unavailable");
        const encoded = await response.arrayBuffer();
        await this.decoding;
        if (this.disposed || generation !== this.generation) return;
        const pending = context.decodeAudioData(encoded);
        this.decoding = pending.then(() => undefined, () => undefined);
        buffer = await pending;
        if (this.disposed || generation !== this.generation) return;
        this.buffers.set(region!, buffer);
      }
      if (this.disposed || generation !== this.generation || document.hidden || !this.preferences.enabled || !this.preferences.volume) return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true;
      source.loopEnd = Math.min(buffer.duration, track.duration);
      source.connect(gain); gain.connect(context.destination);
      const now = context.currentTime, previous = this.current;
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(this.preferences.volume, now + .25);
      source.start(); this.current = { region: region!, source, gain };
      if (previous) {
        previous.gain.gain.cancelScheduledValues(now);
        previous.gain.gain.setValueAtTime(previous.gain.gain.value, now);
        previous.gain.gain.linearRampToValueAtTime(0, now + .25);
        previous.source.onended = () => { previous.source.disconnect(); previous.gain.disconnect(); };
        previous.source.stop(now + .26);
      }
      this.error = false; this.publish();
    } catch { if (!this.disposed && generation === this.generation) { this.error = true; this.publish(); } }
    finally { this.loading.delete(generation); }
  }
  dispose() {
    this.disposed = true; this.generation++;
    this.loadController?.abort();
    window.removeEventListener("pointerdown", this.unlock, true); window.removeEventListener("keydown", this.unlock, true);
    document.removeEventListener("visibilitychange", this.visibility);
    this.current?.source.stop(); this.current?.source.disconnect(); this.current?.gain.disconnect();
    void this.context?.close().catch(() => undefined);
    this.buffers.clear(); this.listeners.clear();
  }
}
export const INITIAL_MUSIC_STATE: MusicState = { playing: false, error: false, preferences: DEFAULT_MUSIC_PREFERENCES };
