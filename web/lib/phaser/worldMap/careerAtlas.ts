import type Phaser from "phaser";
import type { CareerPathDefinition, CareerRegion } from "./careerPaths";
import type { JobOption } from "@/lib/domain/player/jobs";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame } from "../ui";

interface CareerAtlasOptions {
  job: JobOption;
  path: CareerPathDefinition;
  onRegion: (region: CareerRegion) => void;
  onMystery: () => void;
}

/** Turns a painted career wallpaper into a navigable atlas. */
export function drawCareerAtlas(scene: Phaser.Scene, options: CareerAtlasOptions) {
  options.path.regions.forEach((region, index) => drawRegion(scene, region, index + 1, options.onRegion));

  const guideFrame = drawOrnateFrame(scene, 132, 111, 224, 78, { fillAlpha: 0.94, radius: 10 }).setDepth(5);
  const guide = scene.add
    .image(70, 111, options.job.textureKey!)
    .setDisplaySize(72, 72)
    .setDepth(6);
  const guideName = scene.add
    .text(110, 91, options.job.guideName, {
      ...pixelText("caption"),
      color: PALETTE_HEX.maroon,
    })
    .setDepth(6);
  const guideLine = scene.add
    .text(110, 111, "빛나는 지역을 눌러\n도감 수집지를 확인하세요.", {
      ...pixelText("caption"),
      color: PALETTE_HEX.ink,
      lineSpacing: 3,
    })
    .setDepth(6);

  const mysteryFrame = drawOrnateFrame(scene, 858, 466, 168, 76, {
    fill: PALETTE.nightBrown,
    fillAlpha: 0.92,
    radius: 10,
  }).setDepth(5);
  const mysteryTitle = scene.add
    .text(858, 451, "2차 전직", { ...pixelText("caption"), color: PALETTE_HEX.sand })
    .setOrigin(0.5)
    .setDepth(6);
  const mystery = scene.add
    .text(858, 477, "◆  ???", { ...pixelText("subtitle"), color: PALETTE_HEX.cream })
    .setOrigin(0.5)
    .setDepth(6);
  const mysteryHitArea = scene.add
    .rectangle(858, 466, 168, 76, 0xffffff, 0)
    .setInteractive({ useHandCursor: true })
    .setDepth(7);
  mysteryHitArea.on("pointerover", () => mysteryFrame.setAlpha(0.82));
  mysteryHitArea.on("pointerout", () => mysteryFrame.setAlpha(1));
  mysteryHitArea.on("pointerup", options.onMystery);

  return scene.add.container(0, 0, [guideFrame, guide, guideName, guideLine, mysteryFrame, mysteryTitle, mystery, mysteryHitArea]);
}

function drawRegion(
  scene: Phaser.Scene,
  region: CareerRegion,
  order: number,
  onSelect: (region: CareerRegion) => void
) {
  const radius = region.radius;
  const landmark = region.landmark;
  const landmarkHitArea = landmark
    ? scene.add
        .rectangle(landmark.x, landmark.y, landmark.width, landmark.height, 0xffffff, 0.001)
        .setStrokeStyle(3, PALETTE.amber, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(3)
    : undefined;
  // The painted disc remains visible. This transparent circle makes the
  // whole disc clickable, while the ring only signals interactivity.
  const hitArea = scene.add
    .circle(region.x, region.y, radius + 7, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(5);
  const ring = scene.add
    .circle(region.x, region.y, radius, PALETTE.cream, 0)
    .setStrokeStyle(3, PALETTE.amber, 0.95)
    .setDepth(4);
  const number = scene.add
    .text(region.x, region.y, String(order), {
      ...pixelText("caption"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#6f2639dd",
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(4);
  const label = scene.add
    .text(region.x, region.y - 29, region.label, {
      ...pixelText("caption"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#2a1d14df",
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5)
    .setDepth(5);

  const activate = () => {
    ring.setScale(1.12).setStrokeStyle(4, PALETTE.cream, 1);
    landmarkHitArea?.setStrokeStyle(3, PALETTE.cream, 0.95);
    label.setScale(1.04);
  };
  const deactivate = () => {
    ring.setScale(1).setStrokeStyle(3, PALETTE.amber, 0.95);
    landmarkHitArea?.setStrokeStyle(3, PALETTE.amber, 0);
    label.setScale(1);
  };
  const select = () => onSelect(region);

  const entryTargets: Phaser.GameObjects.GameObject[] = [hitArea];
  if (landmarkHitArea) entryTargets.push(landmarkHitArea);
  entryTargets.forEach((entry) => {
    entry.on("pointerover", activate);
    entry.on("pointerout", deactivate);
    entry.on("pointerup", select);
  });
  const objects: Phaser.GameObjects.GameObject[] = [ring, number, label, hitArea];
  if (landmarkHitArea) objects.unshift(landmarkHitArea);
  return scene.add.container(0, 0, objects);
}
