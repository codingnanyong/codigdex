"use client";

import { useLayoutEffect, useRef, type PropsWithChildren } from "react";
import type { Locale } from "@codigdex/game-core/i18n/locale";

/** Utility controls sit over the scene artwork; the game draws its own title. */
export default function GameHeader({ children, locale }: PropsWithChildren<{ locale: Locale }>) {
  const toolbarRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    const shell = toolbar?.closest<HTMLElement>(".game-shell");
    if (!toolbar || !shell) return;
    const measure = () => shell.style.setProperty("--toolbar-height", `${toolbar.getBoundingClientRect().height + 24}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    measure();
    return () => { observer.disconnect(); shell.style.removeProperty("--toolbar-height"); };
  }, []);
  return <>
    <header ref={toolbarRef} className="game-toolbar">
      <nav className="game-toolbar-actions" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"}>{children}</nav>
    </header>
    <p className="rotate-hint">{locale === "ko" ? "휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요" : "Turn your phone sideways for a bigger game screen"}</p>
  </>;
}
