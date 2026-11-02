"use client";

import type { PropsWithChildren } from "react";
import type { Locale } from "@codigdex/game-core/i18n/locale";

/** Utility controls sit over the scene artwork; the game draws its own title. */
export default function GameHeader({ children, locale }: PropsWithChildren<{ locale: Locale }>) {
  return <>
    <header className="game-toolbar">
      <nav className="game-toolbar-actions" aria-label={locale === "ko" ? "게임 메뉴" : "Game menu"}>{children}</nav>
    </header>
    <p className="rotate-hint">{locale === "ko" ? "휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요" : "Turn your phone sideways for a bigger game screen"}</p>
  </>;
}
