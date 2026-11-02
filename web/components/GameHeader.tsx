"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import type { Locale } from "@codigdex/game-core/i18n/locale";

/** An in-game HUD; it never reserves space outside the game canvas. */
export default function GameHeader({ children, locale }: PropsWithChildren<{ locale: Locale }>) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const showSaveError = () => setOpen(true);
    window.addEventListener("codigdex-save-error", showSaveError);
    return () => window.removeEventListener("codigdex-save-error", showSaveError);
  }, []);
  return <>
    <header className="game-toolbar" onKeyDown={event => { event.stopPropagation(); if (event.key === "Escape") setOpen(false); }}>
      <button className="game-menu-toggle" aria-expanded={open} aria-controls="game-icon-menu" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"} title={locale === "ko" ? "게임 메뉴" : "Game menu"} onClick={() => setOpen(!open)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M3 5h18M3 12h18M3 19h18" /></svg></button>
      <nav id="game-icon-menu" hidden={!open} className="game-toolbar-actions" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"}>{children}</nav>
    </header>
    <p className="rotate-hint">{locale === "ko" ? "휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요" : "Turn your phone sideways for a bigger game screen"}</p>
  </>;
}
