import Phaser from "phaser";
import {
  careerTerrainTextureKey,
  type CareerPathDefinition,
  type CareerRegion,
} from "./careerPaths";
import { guideDisplayName, type JobOption } from "@codigdex/game-content/domain/player/jobs";
import { lt, t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame, fitTextInside } from "../ui";
import { createDialogPortrait } from "./dialogPortrait";
import { capturedIds } from "@codigdex/game-core/domain/dex/capture";
import { readDexState } from "../registryAdapter";
import { careerRegionProgression, type CareerRegionStatus } from "./careerRegionProgression";
import { drawPixelChainLock } from "./pixelChainLock";

interface CareerAtlasOptions {
  job: JobOption;
  path: CareerPathDefinition;
  onRegion: (region: CareerRegion) => void;
  onLocked: (region: CareerRegion, requiredRegion: CareerRegion) => void;
  onMystery: () => void;
}

const terrainCenters = new Map<string, { x: number; y: number }>();

/** Turns a painted career wallpaper into a navigable atlas. */
export function drawCareerAtlas(scene: Phaser.Scene, options: CareerAtlasOptions) {
  const regionRegistryKey = `career-atlas-region:${options.job.id}`;
  const storedRegionId = scene.registry.get(regionRegistryKey) as string | undefined;
  const progression = careerRegionProgression(options.path, capturedIds(readDexState(scene.registry)));
  const storedProgress = progression.find(({ region }) => region.id === storedRegionId);
  const startingRegion = storedProgress?.status !== "locked"
    ? storedProgress?.region ?? progression.find(({ status }) => status === "available")?.region
    : progression.find(({ status }) => status === "available")?.region;
  const startX = startingRegion?.x ?? scene.scale.width / 2;
  const startY = startingRegion?.y ?? scene.scale.height / 2;
  const playerShadow = scene.add
    .ellipse(startX, startY + 26, 36, 10, PALETTE.nightBrown, 0.28)
    .setDepth(6);
  const player = scene.add
    .image(startX, startY, options.job.overworldTextureKey)
    .setDisplaySize(41, 54)
    .setDepth(7);
  let traveling = false;

  const travelToRegion = (region: CareerRegion) => {
    if (traveling) return;

    const fromX = player.x;
    const fromY = player.y;
    const distance = Phaser.Math.Distance.Between(fromX, fromY, region.x, region.y);
    if (distance < 4) {
      scene.registry.set(regionRegistryKey, region.id);
      options.onRegion(region);
      return;
    }

    traveling = true;
    const progress = { value: 0 };
    const walkCycles = Math.max(4, Math.round(distance / 48));
    player.setFlipX(region.x < fromX);
    scene.tweens.add({
      targets: progress,
      value: 1,
      duration: Phaser.Math.Clamp((distance / 240) * 1_000, 450, 2_400),
      ease: "Linear",
      onUpdate: () => {
        const step = Math.abs(Math.sin(progress.value * Math.PI * walkCycles));
        const x = Phaser.Math.Linear(fromX, region.x, progress.value);
        const y = Phaser.Math.Linear(fromY, region.y, progress.value);
        player.setPosition(x, y - step * 3);
        playerShadow.setPosition(x, y + 26);
        playerShadow.setScale(1 - step * 0.08, 1 - step * 0.04);
      },
      onComplete: () => {
        player.setPosition(region.x, region.y).setFlipX(false);
        playerShadow.setPosition(region.x, region.y + 26).setScale(1);
        scene.registry.set(regionRegistryKey, region.id);
        options.onRegion(region);
      },
    });
  };

  progression.forEach(({ region, status, requiredRegion }, index) =>
    drawRegion(scene, options.path, region, index + 1, status, (selected) => {
      if (status === "locked" && requiredRegion) {
        options.onLocked(selected, requiredRegion);
        return;
      }
      travelToRegion(selected);
    })
  );

  // Keep guidance in a dedicated bottom dock. Region labels live over the
  // upper/middle map, so the guide must never compete with a destination.
  const guideFrame = drawOrnateFrame(scene, 154, 501, 284, 64, { fillAlpha: 0.97, radius: 10 }).setDepth(8);
  const guide = createDialogPortrait(
    scene,
    options.job.guideTextureKey ?? options.job.textureKey!,
    54,
    494,
    64,
    72
  );
  guide.forEach((portrait) => portrait.setDepth(9));
  const guideName = scene.add
    .text(88, 480, lt(scene, guideDisplayName(options.job)), {
      ...pixelText("caption"),
      color: PALETTE_HEX.maroon,
    })
    .setDepth(9);
  fitTextInside(guideName, 184, 16);
  const guideLine = scene.add
    .text(88, 502, t(scene, "world.atlasHint"), {
      ...pixelText("caption"),
      color: PALETTE_HEX.ink,
      lineSpacing: 2,
    })
    .setDepth(9);
  fitTextInside(guideLine, 190, 16);

  const mysteryFrame = drawOrnateFrame(scene, 858, 466, 168, 76, {
    fill: PALETTE.nightBrown,
    fillAlpha: 0.92,
    radius: 10,
  }).setDepth(5);
  const mysteryTitle = scene.add
    .text(858, 451, t(scene, "world.tier2"), { ...pixelText("caption"), color: PALETTE_HEX.sand })
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

  return scene.add.container(0, 0, [
    guideFrame,
    ...guide,
    guideName,
    guideLine,
    mysteryFrame,
    mysteryTitle,
    mystery,
    mysteryHitArea,
  ]);
}

function drawRegion(
  scene: Phaser.Scene,
  path: CareerPathDefinition,
  region: CareerRegion,
  order: number,
  status: CareerRegionStatus,
  onSelect: (region: CareerRegion) => void
) {
  const { width, height } = scene.scale;
  const { landmark } = region;
  const terrainTextureKey = careerTerrainTextureKey(path, region);
  const labelCenter = findTerrainCenter(scene, terrainTextureKey, landmark);
  const shadow = scene.add
    .image(width / 2, height / 2 + 5, terrainTextureKey)
    .setTint(PALETTE.nightBrown)
    .setAlpha(0)
    .setVisible(false)
    .setDepth(3);
  const liftedRegion = scene.add
    .image(width / 2, height / 2, terrainTextureKey)
    .setAlpha(0)
    .setVisible(false)
    .setDepth(4);

  const hitArea = scene.add
    .image(width / 2, height / 2, terrainTextureKey)
    .setAlpha(0.001)
    .setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 16 })
    .setDepth(6);
  const label = scene.add
    .text(
      labelCenter.x,
      labelCenter.y + 6,
      `${status === "completed" ? "✓" : order} · ${lt(scene, region.label)}`,
      {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#2a1d14eb",
      stroke: PALETTE_HEX.ink,
      strokeThickness: 3,
      padding: { x: 10, y: 6 },
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: PALETTE_HEX.maroon,
        blur: 0,
        stroke: true,
        fill: true,
      },
      }
    )
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(0.96)
    .setDepth(5);

  if (status === "locked") {
    const lock = drawPixelChainLock(scene, labelCenter.x, labelCenter.y);
    const scale = Phaser.Math.Clamp(Math.min(landmark.width / 150, landmark.height / 110), 0.78, 1.12);
    lock.setScale(scale);
  }

  const activate = () => {
    if (status === "locked") {
      scene.tweens.add({ targets: label, alpha: 1, scale: 1, duration: 120 });
      return;
    }
    scene.tweens.killTweensOf([shadow, liftedRegion, label]);
    shadow.setVisible(true);
    liftedRegion.setVisible(true);
    scene.tweens.add({
      targets: shadow,
      alpha: 0.32,
      y: height / 2 + 8,
      duration: 140,
      ease: "Cubic.Out",
    });
    scene.tweens.add({
      targets: liftedRegion,
      alpha: 1,
      y: height / 2 - 9,
      duration: 150,
      ease: "Cubic.Out",
    });
    scene.tweens.add({
      targets: label,
      alpha: 1,
      y: labelCenter.y,
      scale: 1,
      duration: 150,
      ease: "Cubic.Out",
    });
  };
  const deactivate = () => {
    if (status === "locked") {
      scene.tweens.add({ targets: label, alpha: 0, scale: 0.96, duration: 100 });
      return;
    }
    scene.tweens.killTweensOf([shadow, liftedRegion, label]);
    scene.tweens.add({
      targets: shadow,
      alpha: 0,
      y: height / 2 + 5,
      duration: 120,
      ease: "Cubic.In",
      onComplete: () => shadow.setVisible(false),
    });
    scene.tweens.add({
      targets: liftedRegion,
      alpha: 0,
      y: height / 2,
      duration: 130,
      ease: "Cubic.In",
      onComplete: () => liftedRegion.setVisible(false),
    });
    scene.tweens.add({
      targets: label,
      alpha: 0,
      y: labelCenter.y + 6,
      scale: 0.96,
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

/** Centers hover labels on the visible v3 terrain instead of legacy map geometry. */
function findTerrainCenter(
  scene: Phaser.Scene,
  textureKey: string,
  fallback: { x: number; y: number }
): { x: number; y: number } {
  const cached = terrainCenters.get(textureKey);
  if (cached) return cached;
  if (typeof document === "undefined") return fallback;

  try {
    const source = scene.textures.get(textureKey).getSourceImage() as CanvasImageSource & {
      width: number;
      height: number;
    };
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return fallback;

    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width;
    let right = -1;
    let top = canvas.height;
    let bottom = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 16) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }

    if (right < left || bottom < top) return fallback;
    const center = { x: (left + right) / 2, y: (top + bottom) / 2 };
    terrainCenters.set(textureKey, center);
    return center;
  } catch {
    return fallback;
  }
}
