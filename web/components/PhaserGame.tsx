"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const [{ default: PhaserLib }, { createGameConfig }] = await Promise.all([
        import("phaser"),
        import("@/lib/phaser/config"),
      ]);
      if (cancelled || !containerRef.current) return;
      gameRef.current = new PhaserLib.Game(
        createGameConfig(containerRef.current)
      );
    }

    boot().catch((err) => console.error("[PhaserGame] boot failed", err));

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="pixel-canvas mx-auto w-full max-w-240" />;
}
