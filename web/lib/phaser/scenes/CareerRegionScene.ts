import Phaser from "phaser";
import {
  monstersForCareerRegion,
  type CareerRegionMonster,
} from "@/lib/domain/careerRegionMonsters";
import { findJob, guideDisplayName, type JobId } from "@/lib/domain/player/jobs";
import { capturedIds } from "@/lib/domain/dex/capture";
import { PALETTE, PALETTE_HEX } from "../palette";
import { lt, t } from "../i18n";
import { createHomeButton } from "../navigation";
import { createSettingsButton } from "../settings/settingsButton";
import { fitTexture } from "../monsterArt";
import { pixelText } from "../pixelFont";
import { readDexState } from "../registryAdapter";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import {
  careerCheckpointLayout,
} from "../worldMap/careerCheckpointLayout";
import {
  careerChapterWallpaperAssetPath,
  careerChapterWallpaperTextureKey,
  careerPathFor,
  type CareerRegion,
} from "../worldMap/careerPaths";
import { createDialogPortrait } from "../worldMap/dialogPortrait";

interface CareerRegionData {
  careerId: JobId;
  regionId: string;
}

/** A zoomed-in destination between the career atlas and a future chapter battle. */
export class CareerRegionScene extends Phaser.Scene {
  private careerId: JobId = "frontend";
  private regionId = "html-css";

  constructor() {
    super("career-region");
  }

  init(data?: CareerRegionData) {
    if (data?.careerId) this.careerId = data.careerId;
    if (data?.regionId) this.regionId = data.regionId;
  }

  preload() {
    const path = careerPathFor(this.careerId);
    const job = findJob(this.careerId);
    const region = path.regions.find((candidate) => candidate.id === this.regionId) ?? path.regions[0];
    this.load.image(
      careerChapterWallpaperTextureKey(path, region),
      careerChapterWallpaperAssetPath(path, region)
    );
    this.load.image(job.textureKey!, job.assetPath!);
    if (job.guideTextureKey && job.guideAssetPath) {
      this.load.image(job.guideTextureKey, job.guideAssetPath);
    }
    monstersForCareerRegion(region.id).forEach((monster) => {
      this.load.image(monster.textureKey, monster.assetPath);
    });
  }

  create() {
    const { width, height } = this.scale;
    const path = careerPathFor(this.careerId);
    const job = findJob(this.careerId);
    const region = path.regions.find((candidate) => candidate.id === this.regionId) ?? path.regions[0];
    const wallpaperTextureKey = careerChapterWallpaperTextureKey(path, region);

    this.add.image(width / 2, height / 2, wallpaperTextureKey).setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.12);

    drawOrnateFrame(this, width / 2, 48, 430, 66, { fillAlpha: 0.96, radius: 12 });
    this.add
      .text(width / 2, 35, t(this, "region.title", { region: lt(this, region.label) }), {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5);
    const careerTitle = this.add
      .text(width / 2, 60, t(this, "region.subtitle", { career: lt(this, job.name) }), {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
    fitTextInside(careerTitle, 390, 16);

    this.drawMonsterCheckpoints(region);
    this.drawGuide(job.guideTextureKey ?? job.textureKey!, lt(this, guideDisplayName(job)), region);
    createButton(this, 88, height - 28, 136, 34, t(this, "region.detailMap"), () => this.scene.start("world-map"));
    createButton(this, width - 88, height - 28, 136, 34, t(this, "region.viewPath"), () =>
      this.scene.start("path-map", { careerId: this.careerId })
    );
    createHomeButton(this).setDepth(30);
    createSettingsButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }

  private drawMonsterCheckpoints(region: CareerRegion) {
    const monsters = monstersForCareerRegion(region.id);
    const captured = capturedIds(readDexState(this.registry));
    const firstUncaptured = monsters.findIndex((monster) => !captured.has(monster.id));
    const activeIndex = firstUncaptured === -1 ? monsters.length - 1 : firstUncaptured;
    const checkpoints = careerCheckpointLayout(this.careerId, region.id).map(
      (point) => new Phaser.Math.Vector2(point.x, point.y)
    );
    const route = this.add.graphics().setDepth(2);

    checkpoints.slice(0, -1).forEach((point, index) => {
      const next = checkpoints[index + 1];
      const reached = index < activeIndex;
      route.lineStyle(7, PALETTE.nightBrown, reached ? 0.42 : 0.22);
      route.lineBetween(point.x, point.y, next.x, next.y);
      route.lineStyle(3, reached ? PALETTE.amber : PALETTE.mutedBrown, reached ? 0.92 : 0.42);
      route.lineBetween(point.x, point.y, next.x, next.y);
    });

    monsters.forEach((monster, index) => {
      const point = checkpoints[index];
      if (!point) return;
      const isCaptured = captured.has(monster.id);
      const isActive = index === activeIndex;
      if (isCaptured || isActive) {
        this.drawMonsterCheckpoint(monster, point.x, point.y, isActive, isCaptured, region);
      } else {
        this.add
          .circle(point.x, point.y + 24, 19, PALETTE.nightBrown, 0.6)
          .setStrokeStyle(2, PALETTE.mutedBrown, 0.55)
          .setDepth(3);
        this.add
          .text(point.x, point.y + 24, "?", { ...pixelText("subtitle"), color: PALETTE_HEX.sand })
          .setOrigin(0.5)
          .setAlpha(0.55)
          .setDepth(4);
      }
    });
  }

  private drawMonsterCheckpoint(
    monster: CareerRegionMonster,
    x: number,
    y: number,
    isActive: boolean,
    isCaptured: boolean,
    region: CareerRegion
  ) {
    const size = isActive ? 104 : 76;
    const marker = this.add
      .circle(x, y + 28, isActive ? 28 : 22, PALETTE.nightBrown, isActive ? 0.88 : 0.68)
      .setStrokeStyle(isActive ? 4 : 3, isActive ? PALETTE.amber : PALETTE.sand, 1)
      .setDepth(3);
    const shadow = this.add
      .ellipse(x, y + 30, isActive ? 74 : 56, 16, PALETTE.nightBrown, 0.34)
      .setDepth(4);
    const fit = fitTexture(this, monster.textureKey, size, size);
    const image = this.add
      .image(x, y, monster.textureKey)
      .setScale(fit.scale)
      .setAlpha(isCaptured && !isActive ? 0.72 : 1)
      .setDepth(5);
    const name = this.add
      .text(x, y + 48, `${lt(this, monster.name)}${isCaptured ? " ✓" : ""}`, {
        ...pixelText("caption"),
        color: PALETTE_HEX.cream,
        backgroundColor: PALETTE_HEX.nightBrown,
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(6);
    fitTextInside(name, 142, 14);
    const nameScale = name.scaleX;

    const activate = () => {
      this.tweens.killTweensOf([image, marker, name]);
      this.tweens.add({ targets: image, y: y - 8, scale: fit.scale * 1.08, duration: 130, ease: "Quad.Out" });
      this.tweens.add({ targets: marker, scale: 1.08, duration: 130, ease: "Quad.Out" });
      this.tweens.add({ targets: name, scale: nameScale * 1.08, duration: 130, ease: "Quad.Out" });
    };
    const deactivate = () => {
      this.tweens.killTweensOf([image, marker, name]);
      this.tweens.add({ targets: image, y, scale: fit.scale, duration: 120, ease: "Quad.In" });
      this.tweens.add({ targets: marker, scale: 1, duration: 120, ease: "Quad.In" });
      this.tweens.add({ targets: name, scale: nameScale, duration: 120, ease: "Quad.In" });
    };
    const select = () => this.startCareerBattle(monster, region);

    if (isActive) {
      image.setInteractive({ useHandCursor: true });
      image.on("pointerover", activate);
      image.on("pointerout", deactivate);
      image.on("pointerup", select);
      marker.setInteractive({ useHandCursor: true }).on("pointerup", select);
      shadow.setInteractive({ useHandCursor: true }).on("pointerup", select);
    }
  }

  private startCareerBattle(monster: CareerRegionMonster, region: CareerRegion) {
    const path = careerPathFor(this.careerId);
    this.scene.start("code-battle", {
      monsterId: monster.id,
      returnTo: {
        scene: "career-region",
        data: { careerId: this.careerId, regionId: region.id },
      },
      arena: {
        textureKey: careerChapterWallpaperTextureKey(path, region),
        assetPath: careerChapterWallpaperAssetPath(path, region),
      },
    });
  }

  private drawGuide(textureKey: string, guideName: string, region: CareerRegion) {
    const { width, height } = this.scale;
    drawOrnateFrame(this, width / 2, height - 112, 590, 118, { fillAlpha: 0.96, radius: 14 });
    createDialogPortrait(this, textureKey, width / 2 - 230, height - 117, 106, 118);
    this.add
      .text(width / 2 - 230, height - 68, "GUIDE NPC", {
        ...pixelText("micro"),
        color: PALETTE_HEX.cream,
        backgroundColor: PALETTE_HEX.maroon,
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5);
    this.add.text(width / 2 - 165, height - 148, guideName, {
      ...pixelText("body"),
      color: PALETTE_HEX.maroon,
    });
    this.add.text(
      width / 2 - 165,
      height - 120,
      t(this, "region.monsterHint", { region: lt(this, region.label) }),
      {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
        lineSpacing: 5,
      }
    );
  }
}
