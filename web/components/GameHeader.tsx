"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locale";
import { LOCALE_CHANGE_EVENT } from "@/lib/phaser/i18nEvents";

const COPY: Readonly<Record<Locale, { tagline: string; rotateHint: string }>> = {
  ko: {
    tagline: "코딩 개념을 도감처럼 수집하는 픽셀 코딩 교육 게임",
    rotateHint: "휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요",
  },
  en: {
    tagline: "A pixel-art coding game where you collect concepts in a dex",
    rotateHint: "Turn your phone sideways for a bigger game screen",
  },
};

/** Page chrome around the canvas. The game announces its language once it boots and on every change. */
export default function GameHeader() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<unknown>).detail;
      if (isLocale(next)) setLocale(next);
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  }, []);

  const copy = COPY[locale];
  return (
    <>
      <header className="game-header text-center">
        <h1
          className="text-2xl tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-pixel-en)" }}
        >
          CODIGDEX
        </h1>
        <p className="mt-2 text-sm text-muted" style={{ fontFamily: "var(--font-pixel)" }}>
          {copy.tagline}
        </p>
      </header>
      <p
        className="rotate-hint text-center text-sm text-muted"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        {copy.rotateHint}
      </p>
    </>
  );
}
