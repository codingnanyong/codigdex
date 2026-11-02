import Phaser from "phaser";
import { OPEN_SOURCE_FAMILIES, type OpenSourceEntry } from "@codigdex/game-content/domain/openSourceCatalog";
import { lt, sceneLocale } from "./i18n";
import { PALETTE, PALETTE_HEX } from "./palette";
import { pixelText } from "./pixelFont";
import { createButton, drawOrnateFrame, fitTextInside } from "./ui";

/** A request authorizes one ecosystem destination, rather than a free battle shortcut. */
export function drawOpenSourceAtlas(scene: Phaser.Scene, entry: OpenSourceEntry, enter: () => void, leave: () => void) {
  const ko = sceneLocale(scene) === "ko";
  scene.cameras.main.setBackgroundColor(PALETTE_HEX.nightBrown);
  scene.add.rectangle(480, 270, 960, 540, PALETTE.nightBrown);
  drawOrnateFrame(scene, 480, 48, 860, 72, { radius: 10 });
  scene.add.text(480, 31, ko ? "오픈소스 · 생태계 지도" : "OPEN SOURCE · ECOSYSTEM ATLAS", { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
  const subtitle = scene.add.text(480, 64, `${entry.name} → ${lt(scene, OPEN_SOURCE_FAMILIES[entry.family])}`, { ...pixelText("body"), color: PALETTE_HEX.ink }).setOrigin(0.5);
  fitTextInside(subtitle, 810, 24);
  const nav = document.createElement("nav");
  nav.className = "source-atlas-nav";
  nav.setAttribute("aria-label", ko ? "오픈소스 생태계 지도" : "Open-source ecosystem atlas");
  nav.dataset.family = entry.family;
  const links = scene.add.graphics();
  links.lineStyle(3, PALETTE.wood, 0.75);
  Object.entries(OPEN_SOURCE_FAMILIES).forEach(([family, label], index) => {
    const x = 200 + (index % 3) * 280, y = 150 + Math.floor(index / 3) * 112;
    const active = family === entry.family;
    if (index % 3) links.lineBetween(x - 160, y, x - 120, y);
    if (index >= 3) links.lineBetween(x, y - 70, x, y - 42);
    const key = `open-source-arena-${family}`;
    scene.add.image(x, y, key).setDisplaySize(240, 88).setAlpha(active ? 1 : 0.35);
    scene.add.rectangle(x, y + 25, 240, 38, PALETTE.nightBrown, 0.88);
    const name = scene.add.text(x, y + 17, lt(scene, label), { ...pixelText("body"), color: active ? PALETTE_HEX.cream : PALETTE_HEX.sand }).setOrigin(0.5);
    fitTextInside(name, 222, 24);
    scene.add.text(x, y + 36, active ? (ko ? "◆ 현재 의뢰 지역" : "◆ CURRENT DESTINATION") : (ko ? "진행 중 의뢰 없음" : "NO ACTIVE REQUEST"), { ...pixelText("caption"), color: active ? PALETTE_HEX.cream : PALETTE_HEX.sand }).setOrigin(0.5);
    const target = scene.add.rectangle(x, y, 244, 92, PALETTE.cream, 0).setStrokeStyle(active ? 4 : 1, active ? PALETTE.amber : PALETTE.wood);
    if (active) target.setInteractive({ useHandCursor: true }).on("pointerup", enter);
    const button = document.createElement("button");
    button.textContent = lt(scene, label);
    button.dataset.family = family;
    button.disabled = !active;
    button.onclick = enter;
    nav.append(button);
  });
  const hint = scene.add.text(480, 447, ko ? "의뢰가 있는 지역으로 이동해 다섯 성장 단계를 탐험하세요." : "TRAVEL TO YOUR REQUEST'S REGION AND EXPLORE ITS FIVE STAGES.", { ...pixelText("body"), color: PALETTE_HEX.sand }).setOrigin(0.5);
  fitTextInside(hint, 850, 28);
  createButton(scene, 242, 501, 360, 38, ko ? "직무 경로로 돌아가기" : "RETURN TO MY CAREER", leave);
  createButton(scene, 718, 501, 360, 38, ko ? "의뢰 지역으로 이동" : "TRAVEL TO REQUEST REGION", enter);
  const returnButton = document.createElement("button");
  returnButton.dataset.sourceAction = "leave";
  returnButton.textContent = ko ? "직무 경로로 돌아가기" : "RETURN TO MY CAREER";
  returnButton.onclick = leave;
  nav.append(returnButton);
  scene.game.canvas.parentElement!.append(nav);
  const cleanup = () => {
    nav.remove();
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    scene.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}
