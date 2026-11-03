"use client";

import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { GameIcon } from "./GameIcon";

/** An in-game HUD; it never reserves space outside the game canvas. */
export default function GameHeader({ children, locale, onClose, compact = false }: PropsWithChildren<{ locale: Locale; compact?: boolean; onClose(): void }>) {
  const [open, setOpen] = useState(!compact);
  const [previousCompact, setPreviousCompact] = useState(compact);
  if (previousCompact !== compact) { setPreviousCompact(compact); if (compact) setOpen(false); }
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); onClose(); toggle.current?.focus(); };
  useEffect(() => {
    const showSaveError = () => setOpen(true);
    window.addEventListener("codigdex-save-error", showSaveError);
    return () => window.removeEventListener("codigdex-save-error", showSaveError);
  }, []);
  return <>
    <header className="game-toolbar" onKeyDown={event => { event.stopPropagation(); if (event.key === "Escape") close(); }}>
      <button ref={toggle} className="game-menu-toggle" aria-expanded={open} aria-controls="game-icon-menu" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"} title={locale === "ko" ? "게임 메뉴 접기·펼치기" : "Collapse or expand game menu"} onClick={() => open ? close() : setOpen(true)}><GameIcon name="menu" /></button>
      <nav id="game-icon-menu" hidden={!open} className="game-toolbar-actions" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"}>{children}</nav>
    </header>
    <p className="rotate-hint">{locale === "ko" ? "휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요" : "Turn your phone sideways for a bigger game screen"}</p>
  </>;
}
