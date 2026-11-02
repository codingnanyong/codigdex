"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { WALLPAPERS } from "@codigdex/game-assets/visuals";
import { assetUrl } from "@/lib/assets";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@codigdex/game-core/i18n/locale";
import { trackSceneImageURLs } from "@/lib/phaser/sceneBackdrop";
import { whenPixelFontReady } from "@/lib/phaser/pixelFont";
import { devicePixelsPerGamePixel, imageRenderingFor } from "@/lib/phaser/displayScale";
import { LOCALE_CHANGE_EVENT } from "@/lib/phaser/i18nEvents";
import Link from "next/link";
import GameHeader from "./GameHeader";
import { AccountPanel } from "./AccountPanel";
import { OpenSourcePanel } from "./OpenSourcePanel";

const ACCESSIBLE_COPY: Readonly<
  Record<Locale, { label: string; controls: string; loading: string; ready: string; failed: string }>
> = {
  ko: {
    label: "코딩덱스 코딩 교육 게임",
    controls: "Enter 또는 Space로 시작하고, 방향키나 WASD로 이동합니다.",
    loading: "게임을 불러오는 중입니다.",
    ready: "게임을 시작할 준비가 되었습니다.",
    failed: "게임을 불러오지 못했습니다.",
  },
  en: {
    label: "Codigdex coding education game",
    controls: "Press Enter or Space to start, then move with the arrow keys or WASD.",
    loading: "Loading the game.",
    ready: "The game is ready to play.",
    failed: "The game could not be loaded.",
  },
};

export default function PhaserGame({ qaEnabled = false }: { qaEnabled?: boolean }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [backdrop, setBackdrop] = useState(assetUrl(WALLPAPERS.field));
  const [runtime, setRuntime] = useState<Phaser.Game | null>(null);
  const [activeScene, setActiveScene] = useState("");
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [bootState, setBootState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  const toggleFullscreen = async () => {
    setFullscreenError(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shellRef.current?.requestFullscreen();
    } catch { setFullscreenError(true); }
  };

  useEffect(() => {
    const onLocaleChange = (event: Event) => {
      const next = (event as CustomEvent<unknown>).detail;
      if (isLocale(next)) setLocale(next);
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const stopTracking: (() => void)[] = [];

    // Phaser's FIT mode sizes the canvas box to the container; pick the
    // interpolation that stays even at whatever scale that works out to.
    const syncRendering = () => {
      const canvas = gameRef.current?.canvas;
      if (!canvas) return;
      const scale = devicePixelsPerGamePixel(
        canvas.getBoundingClientRect().width,
        window.devicePixelRatio,
        canvas.width
      );
      canvas.style.imageRendering = imageRenderingFor(scale);
    };

    async function boot() {
      const [{ default: PhaserLib }, { createGameConfig }] = await Promise.all([
        import("phaser"),
        import("@/lib/phaser/config"),
      ]);
      await new Promise<void>((resolve) => whenPixelFontReady(resolve));
      if (cancelled || !containerRef.current) return;
      const game = new PhaserLib.Game(createGameConfig(containerRef.current));
      gameRef.current = game;
      const textureSources = new Map<string, string>();
      let previousScene = "";
      let previousRoot: unknown;
      let previousBackdrop = "";
      game.events.on(PhaserLib.Core.Events.POST_STEP, () => {
        if (cancelled) return;
        const scene = game.scene.getScenes(true).at(-1);
        const current = scene?.sys.settings.key ?? "";
        const root = scene?.children.list[0];
        if (scene && (root !== previousRoot || current !== previousScene)) {
          previousRoot = root;
          const painting = scene.children.list.find((child) => {
            const image = child as Phaser.GameObjects.Image;
            return image.visible && image.displayWidth >= 900 && image.displayHeight >= 500 && image.texture?.source?.[0];
          }) as Phaser.GameObjects.Image | undefined;
          // Phaser may revoke its decoded image's blob URL. Use the loader's
          // original asset URL so CSS can independently fill the viewport.
          const source = painting && textureSources.get(painting.texture.key);
          if (source && source !== previousBackdrop) {
            previousBackdrop = source;
            setBackdrop(source);
          }
        }
        if (!current || current === previousScene) return;
        if (!previousScene) { setBootState("ready"); setRuntime(game); setFullscreenAvailable(Boolean(document.fullscreenEnabled)); }
        previousScene = current;
        setActiveScene(current);
      });
      game.events.once(PhaserLib.Core.Events.READY, () => {
        if (cancelled || !containerRef.current) return;
        for (const scene of game.scene.scenes) {
          stopTracking.push(trackSceneImageURLs(scene, textureSources, {
            fileLoad: PhaserLib.Loader.Events.FILE_LOAD,
            start: PhaserLib.Scenes.Events.START,
            destroy: PhaserLib.Scenes.Events.DESTROY,
          }));
        }
        observer = new ResizeObserver(() => {
          const container = containerRef.current;
          if (!container) return;
          // refresh() re-centers against new bounds but retains the old FIT
          // size. A dock resize must also update Phaser's parent dimensions.
          game.scale.setParentSize(container.clientWidth, container.clientHeight);
          syncRendering();
        });
        observer.observe(containerRef.current);
        game.scale.refresh();
        syncRendering();
      });
    }

    boot().catch((err) => {
      console.error("[PhaserGame] boot failed", err);
      if (!cancelled) setBootState("failed");
    });
    // Browser zoom and moving between monitors change the pixel ratio without
    // necessarily resizing the canvas box.
    window.addEventListener("resize", syncRendering);

    return () => {
      cancelled = true;
      observer?.disconnect();
      stopTracking.forEach((stop) => stop());
      window.removeEventListener("resize", syncRendering);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const copy = ACCESSIBLE_COPY[locale];
  const status = bootState === "ready" ? copy.ready : bootState === "failed" ? copy.failed : copy.loading;

  return (
    <div ref={shellRef} className="game-shell">
      <div className="game-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${JSON.stringify(backdrop)})` }} />
      <GameHeader locale={locale}>
        {qaEnabled ? <Link href="/qa" aria-label={locale === "ko" ? "로컬 QA · 테스트 시작점 바꾸기" : "Local QA · choose a test starting point"}>QA</Link> : null}
        {runtime ? <OpenSourcePanel game={runtime} locale={locale} /> : null}
        {runtime ? <AccountPanel game={runtime} locale={locale} /> : null}
        {fullscreenAvailable ? <button className="fullscreen-toggle" aria-pressed={fullscreen} onKeyDown={(event) => event.stopPropagation()} onClick={() => void toggleFullscreen()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={fullscreen ? "M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6" : "M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"} /></svg>
          {locale === "ko" ? (fullscreen ? "전체화면 종료" : "전체화면") : (fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN")}
        </button> : null}
      </GameHeader>
      {fullscreenError ? <p role="status" className="fullscreen-notice">{locale === "ko" ? "전체화면을 열지 못했습니다. 브라우저에서 다시 시도해 주세요." : "Fullscreen could not open. Try again in your browser."}</p> : null}
      <div
        ref={containerRef}
        className="pixel-canvas"
        role="application"
        tabIndex={0}
        aria-label={copy.label}
        aria-describedby="codigdex-controls codigdex-status"
        aria-busy={bootState === "loading"}
        data-scene={activeScene}
      />
      <p id="codigdex-controls" className="sr-only">
        {copy.controls}
      </p>
      <p id="codigdex-status" className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
