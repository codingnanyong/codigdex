"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { INITIAL_MUSIC_STATE, type MusicPlayer } from "@/lib/musicPlayer";
import { GameIcon } from "./GameIcon";

export function MusicPanel({ player, locale }: { player: MusicPlayer; locale: Locale }) {
  const [state, setState] = useState(INITIAL_MUSIC_STATE);
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<Element | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const ko = locale === "ko";
  useEffect(() => player.subscribe(setState), [player]);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current, button = launcher.current;
    element?.showModal();
    return () => { element?.close(); button?.focus(); };
  }, [open]);
  const update = (next: Partial<typeof state.preferences>) => player.setPreferences({ ...state.preferences, ...next });
  return <>
    <button ref={launcher} title={ko ? "BGM 설정" : "MUSIC SETTINGS"} aria-haspopup="dialog" data-music-region={state.region} data-music-playing={state.playing} onKeyDown={e => e.stopPropagation()} onClick={e => { setHost(e.currentTarget.closest(".game-shell")); setOpen(true); }}>
      <GameIcon name="music" /><span className="sr-only">{ko ? "BGM 설정" : "MUSIC SETTINGS"}</span>
    </button>
    {host ? createPortal(<dialog ref={dialog} className="music-dialog" aria-labelledby="music-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onKeyDown={e => e.stopPropagation()}>
      <div className="music-heading"><h2 id="music-title">{ko ? "지역의 선율" : "REGIONAL MELODIES"}</h2><button aria-label={ko ? "BGM 설정 닫기" : "Close music settings"} onClick={() => setOpen(false)}>×</button></div>
      <p>{state.title ?? (ko ? "여행을 시작하면 음악이 흐릅니다." : "Music begins with your journey.")}</p>
      <button aria-pressed={!state.preferences.enabled} onClick={() => update({ enabled: !state.preferences.enabled })}>{state.preferences.enabled ? (ko ? "BGM 끄기" : "MUTE MUSIC") : (ko ? "BGM 켜기" : "ENABLE MUSIC")}</button>
      <label className="music-volume">{ko ? "음악 크기" : "Music volume"} · {Math.round(state.preferences.volume * 100)}%
        <input aria-label={ko ? "음악 크기" : "Music volume"} type="range" min="0" max="100" value={Math.round(state.preferences.volume * 100)} onChange={e => update({ volume: Number(e.target.value) / 100 })} />
      </label>
      {state.error ? <p role="status">{ko ? "음악을 불러오지 못했습니다. BGM을 다시 켜 보세요." : "Music could not load. Try enabling it again."}</p> : null}
    </dialog>, host) : null}
  </>;
}
