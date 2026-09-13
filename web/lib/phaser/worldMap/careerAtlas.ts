import Phaser from "phaser";
import type { CareerPathDefinition, CareerRegion } from "./careerPaths";
import type { JobOption } from "@/lib/domain/player/jobs";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame, fitTextInside } from "../ui";

interface CareerAtlasOptions {
  job: JobOption;
  path: CareerPathDefinition;
  onRegion: (region: CareerRegion) => void;
  onMystery: () => void;
}

/** Turns a painted career wallpaper into a navigable atlas. */
export function drawCareerAtlas(scene: Phaser.Scene, options: CareerAtlasOptions) {
  options.path.regions.forEach((region, index) =>
    drawRegion(scene, options.path.textureKey, region, index + 1, options.onRegion)
  );

  const guideFrame = drawOrnateFrame(scene, 132, 116, 224, 92, { fillAlpha: 0.94, radius: 10 }).setDepth(5);
  const guide = scene.add
    .image(70, 116, options.job.guideTextureKey ?? options.job.textureKey!)
    .setDisplaySize(82, 82)
    .setDepth(6);
  const guideName = scene.add
    .text(110, 87, options.job.guideName, {
      ...pixelText("caption"),
      color: PALETTE_HEX.maroon,
    })
    .setDepth(6);
  fitTextInside(guideName, 124, 16);
  const guideLine = scene.add
    .text(110, 108, "빛나는 지역을 눌러\n수집지를 확인하세요.", {
      ...pixelText("caption"),
      color: PALETTE_HEX.ink,
      lineSpacing: 2,
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
  textureKey: string,
  region: CareerRegion,
  order: number,
  onSelect: (region: CareerRegion) => void
) {
  const { landmark } = region;
  const shadow = scene.add
    .polygon(landmark.x, landmark.y + 5, region.focusPoints, PALETTE.nightBrown, 1)
    .setAlpha(0)
    .setDepth(3);
  const focusTextureKey = createFocusTexture(scene, textureKey, region);
  const liftedRegion = scene.add
    .image(landmark.x, landmark.y, focusTextureKey)
    .setVisible(false)
    .setDepth(4);

  const hitArea = scene.add
    .polygon(landmark.x, landmark.y, region.focusPoints, 0xffffff, 0)
    .setInteractive({ useHandCursor: true })
    .setDepth(6);
  const label = scene.add
    .text(landmark.x, landmark.y - landmark.height / 2 + 10, `${order} · ${region.label}`, {
      ...pixelText("caption"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#2a1d14df",
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5)
    .setDepth(5);

  const activate = () => {
    scene.tweens.killTweensOf([liftedRegion, shadow, label]);
    liftedRegion.setVisible(true);
    scene.tweens.add({
      targets: liftedRegion,
      y: landmark.y - 8,
      duration: 150,
      ease: "Cubic.Out",
    });
    scene.tweens.add({
      targets: shadow,
      alpha: 0.24,
      duration: 120,
      ease: "Sine.Out",
    });
    scene.tweens.add({
      targets: label,
      y: landmark.y - landmark.height / 2 + 4,
      scale: 1.04,
      duration: 150,
      ease: "Cubic.Out",
    });
  };
  const deactivate = () => {
    scene.tweens.killTweensOf([liftedRegion, shadow, label]);
    scene.tweens.add({
      targets: liftedRegion,
      y: landmark.y,
      duration: 130,
      ease: "Cubic.In",
      onComplete: () => liftedRegion.setVisible(false),
    });
    scene.tweens.add({ targets: shadow, alpha: 0, duration: 110 });
    scene.tweens.add({
      targets: label,
      y: landmark.y - landmark.height / 2 + 10,
      scale: 1,
      duration: 130,
      ease: "Cubic.In",
    });
  };
  const select = () => onSelect(region);

  hitArea.on("pointerover", activate);
  hitArea.on("pointerout", deactivate);
  hitArea.on("pointerup", select);
  return hitArea;
}

/**
 * Bakes one transparent texture per painted landmark. Phaser 4 geometry masks
 * only work in the Canvas renderer; Phaser.AUTO normally chooses WebGL and
 * would therefore lift the whole wallpaper. A clipped CanvasTexture renders
 * identically in Canvas and WebGL and makes leaking outside the region bounds
 * impossible even while it is tweened.
 */
function createFocusTexture(
  scene: Phaser.Scene,
  wallpaperTextureKey: string,
  region: CareerRegion
): string {
  const focusTextureKey = `${wallpaperTextureKey}-focus-${region.id}`;
  if (scene.textures.exists(focusTextureKey)) return focusTextureKey;

  const { landmark, focusPoints } = region;
  const width = Math.ceil(landmark.width);
  const height = Math.ceil(landmark.height);
  const texture = scene.textures.createCanvas(focusTextureKey, width, height);
  if (!texture) throw new Error(`Could not create career focus texture: ${focusTextureKey}`);

  const context = texture.context;
  context.imageSmoothingEnabled = false;
  context.save();
  context.beginPath();
  context.moveTo(focusPoints[0][0], focusPoints[0][1]);
  focusPoints.slice(1).forEach(([x, y]) => context.lineTo(x, y));
  context.closePath();
  context.clip();
  context.drawImage(
    scene.textures.get(wallpaperTextureKey).getSourceImage() as CanvasImageSource,
    landmark.x - landmark.width / 2,
    landmark.y - landmark.height / 2,
    width,
    height,
    0,
    0,
    width,
    height
  );
  context.restore();
  texture.refresh();
  return focusTextureKey;
}
