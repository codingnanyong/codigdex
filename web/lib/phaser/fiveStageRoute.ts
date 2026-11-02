import Phaser from "phaser";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { lt, sceneLocale } from "./i18n";
import { PALETTE, PALETTE_HEX } from "./palette";
import { pixelText } from "./pixelFont";
import { fitTextInside } from "./ui";

interface RouteStage { monster: MonsterDefinition; status: "locked" | "available" | "cleared" }
export const FIVE_STAGE_POINTS = [128, 304, 480, 656, 832].map((x, i) => ({ x, y: i % 2 ? 224 : 188 }));

/** The same five stops, locks and selection affordances across advanced paths. */
export function drawFiveStageRoute(scene: Phaser.Scene, stages: readonly RouteStage[], selectedId: string | undefined,
  onSelect: (id: string) => void, options: { arena: string; onEnter?: () => void; enterLabel?: string; captions?: readonly string[] } ) {
  const ko = sceneLocale(scene) === "ko";
  const route = scene.add.graphics();
  FIVE_STAGE_POINTS.slice(0, -1).forEach((point, index) => {
    const next = FIVE_STAGE_POINTS[index + 1], reached = stages[index]?.status === "cleared";
    route.lineStyle(8, PALETTE.nightBrown, 0.65).lineBetween(point.x, point.y + 28, next.x, next.y + 28);
    route.lineStyle(3, reached ? PALETTE.amber : PALETTE.sand, reached ? 1 : 0.6).lineBetween(point.x, point.y + 28, next.x, next.y + 28);
  });
  const nav = document.createElement("nav");
  nav.className = "stage-route-nav";
  nav.setAttribute("aria-label", ko ? "1~5단계 경로" : "Five-stage route");
  nav.dataset.arena = options.arena;
  const hint = scene.add.text(480, 322, ko ? "1–5 또는 ← → 선택 · Enter로 학습 · 앞 단계를 마치면 다음 단계가 열립니다" : "1–5 OR ← → TO SELECT · ENTER TO LEARN · COMPLETE EACH STAGE TO UNLOCK THE NEXT", {
    ...pixelText("caption"), color: PALETTE_HEX.cream, backgroundColor: PALETTE_HEX.nightBrown, padding: { x: 8, y: 4 },
  }).setOrigin(0.5);
  fitTextInside(hint, 858, 22);
  const choose = (index: number) => {
    const stage = stages[index];
    if (!stage) return;
    if (stage.status === "locked") {
      hint.setText(ko ? `${index + 1}단계 잠김 · 앞 단계를 먼저 완료하세요.` : `STAGE ${index + 1} LOCKED · COMPLETE THE PREVIOUS STAGE FIRST.`);
      fitTextInside(hint, 858, 22);
      return;
    }
    if (stage.monster.id !== selectedId) onSelect(stage.monster.id);
  };
  stages.forEach(({ monster, status }, index) => {
    const { x, y } = FIVE_STAGE_POINTS[index], selected = monster.id === selectedId;
    const state = status === "cleared" ? (ko ? "완료" : "CLEARED") : status === "locked" ? (ko ? "잠김" : "LOCKED") : (ko ? "도전 가능" : "READY");
    const disk = scene.add.ellipse(x, y + 28, 122, 38, PALETTE.nightBrown, 0.74)
      .setStrokeStyle(selected ? 4 : 2, selected ? PALETTE.amber : status === "cleared" ? PALETTE.cream : PALETTE.wood);
    if (status !== "locked") scene.add.image(x, y - 24, monster.textureKey).setDisplaySize(128, 128);
    else scene.add.text(x, y - 16, "?", { ...pixelText("title"), color: PALETTE_HEX.sand }).setOrigin(0.5);
    const badge = scene.add.text(x, y - 78, `${index + 1}/5 · ${state}`, { ...pixelText("caption"), color: selected ? PALETTE_HEX.cream : PALETTE_HEX.sand, backgroundColor: selected ? PALETTE_HEX.maroon : PALETTE_HEX.nightBrown, padding: { x: 7, y: 4 } }).setOrigin(0.5);
    fitTextInside(badge, 156, 23);
    const label = scene.add.text(x, y + 64, `Lv.${monster.level} · No.${monster.dexNumber}\n${options.captions?.[index] ?? (status === "locked" ? "???" : lt(scene, monster.name))}`, {
      ...pixelText("caption"), color: PALETTE_HEX.cream, backgroundColor: PALETTE_HEX.nightBrown, align: "center", padding: { x: 6, y: 4 },
    }).setOrigin(0.5);
    fitTextInside(label, 166, 42);
    const target = scene.add.rectangle(x, y - 12, 154, 170, PALETTE.cream, 0).setInteractive({ useHandCursor: status !== "locked" });
    target.on("pointerup", () => choose(index));
    target.on("pointerover", () => disk.setStrokeStyle(4, status === "locked" ? PALETTE.wood : PALETTE.amber));
    target.on("pointerout", () => disk.setStrokeStyle(selected ? 4 : 2, selected ? PALETTE.amber : status === "cleared" ? PALETTE.cream : PALETTE.wood));
    const button = document.createElement("button");
    button.textContent = `${index + 1}/5 · ${state} · ${status === "locked" ? "???" : lt(scene, monster.name)}`;
    button.dataset.stageId = monster.id;
    button.disabled = status === "locked";
    button.setAttribute("aria-current", selected ? "step" : "false");
    button.onclick = () => choose(index);
    nav.append(button);
  });
  if (options.onEnter) {
    const start = document.createElement("button");
    start.textContent = options.enterLabel ?? (ko ? "선택 단계 학습 시작" : "LEARN SELECTED STAGE");
    start.dataset.routeAction = "start";
    start.onclick = options.onEnter;
    nav.append(start);
  }
  scene.game.canvas.parentElement!.append(nav);
  const keyboard = scene.input.keyboard;
  const onKey = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|BUTTON)$/.test((event.target as HTMLElement | null)?.tagName ?? "")) return;
    const index = stages.findIndex(({ monster }) => monster.id === selectedId);
    if (/^[1-5]$/.test(event.key)) choose(Number(event.key) - 1);
    else if (event.key === "ArrowLeft") { event.preventDefault(); choose(Math.max(0, index - 1)); }
    else if (event.key === "ArrowRight") { event.preventDefault(); choose(Math.min(4, index + 1)); }
    else if (event.key === "Enter") options.onEnter?.();
  };
  keyboard?.on("keydown", onKey);
  const cleanup = () => {
    keyboard?.off("keydown", onKey); nav.remove();
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    scene.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}
