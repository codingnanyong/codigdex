"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { devicePixelsPerGamePixel, imageRenderingFor } from "@/lib/phaser/displayScale";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;

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
      if (cancelled || !containerRef.current) return;
      const game = new PhaserLib.Game(createGameConfig(containerRef.current));
      gameRef.current = game;
      game.events.once(PhaserLib.Core.Events.READY, () => {
        if (cancelled) return;
        observer = new ResizeObserver(syncRendering);
        observer.observe(game.canvas);
        syncRendering();
      });
    }

    boot().catch((err) => console.error("[PhaserGame] boot failed", err));
    // Browser zoom and moving between monitors change the pixel ratio without
    // necessarily resizing the canvas box.
    window.addEventListener("resize", syncRendering);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", syncRendering);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="pixel-canvas mx-auto" />;
}
