import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";

/** Dark research-board backdrop: a faint grid inside a double frame. */
export function drawMapSurface(scene: Phaser.Scene) {
  const { width, height } = scene.scale;
  scene.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

  const grid = scene.add.graphics();
  grid.lineStyle(1, PALETTE.wood, 0.14);
  for (let x = 0; x <= width; x += 32) grid.lineBetween(x, 0, x, height);
  for (let y = 0; y <= height; y += 32) grid.lineBetween(0, y, width, y);

  const frame = scene.add.graphics();
  frame.lineStyle(2, PALETTE.amber, 0.42);
  frame.strokeRect(14, 14, width - 28, height - 28);
  frame.lineStyle(1, PALETTE.sand, 0.18);
  frame.strokeRect(20, 20, width - 40, height - 40);
}

export function drawHeader(scene: Phaser.Scene, careerName?: string) {
  const { width } = scene.scale;
  const panel = scene.add.graphics();
  panel.fillStyle(PALETTE.ink, 0.95);
  panel.fillRect(170, 18, width - 340, 58);
  panel.lineStyle(2, PALETTE.amber, 0.8);
  panel.strokeRect(170, 18, width - 340, 58);
  panel.fillStyle(PALETTE.amber, 1);
  panel.fillRect(170, 18, width - 340, 4);

  scene.add
    .text(width / 2, 34, careerName ? `${careerName} PATH` : "JUNIOR DEVELOPER PATH", {
      ...pixelText("caption"),
      color: PALETTE_HEX.amber,
      letterSpacing: 2,
    })
    .setOrigin(0.5);

  scene.add
    .text(width / 2, 56, careerName ? "Git과 Linux를 익혀 선택한 직업으로 전직하세요" : "공통 기술을 익히고 원하는 직업으로 전직하세요", {
      ...pixelText("body"),
      color: PALETTE_HEX.cream,
    })
    .setOrigin(0.5);
}

export function drawSectionLabels(scene: Phaser.Scene) {
  drawSectionLabel(scene, 205, "COMMON", "주니어 공통 과정");
  drawSectionLabel(scene, 490, "PROMOTION", "전직 선택");
  drawSectionLabel(scene, 790, "CAREER PATH", "직업별 전문 과정");
}

function drawSectionLabel(scene: Phaser.Scene, x: number, english: string, korean: string) {
  scene.add
    .text(x, 94, english, {
      ...pixelText("caption"),
      color: PALETTE_HEX.amber,
      letterSpacing: 1,
    })
    .setOrigin(0.5);
  scene.add
    .text(x, 110, korean, {
      ...pixelText("caption"),
      color: PALETTE_HEX.mutedBrown,
    })
    .setOrigin(0.5);
}
