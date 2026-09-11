import type Phaser from "phaser";
import type { MonsterDefinition } from "@/lib/domain/chapters/types";
import { fitTexture } from "../monsterArt";
import { PALETTE } from "../palette";
import { MONSTER_SPOT } from "./layout";

/** The monster being fought, standing GBC-style on a flat oval shadow rather than floating. */
export class Opponent {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly baseScale: number;

  constructor(scene: Phaser.Scene, monster: MonsterDefinition) {
    this.scene = scene;
    const fit = fitTexture(scene, monster.textureKey, MONSTER_SPOT.maxWidth, MONSTER_SPOT.maxHeight);

    scene.add.ellipse(
      MONSTER_SPOT.x,
      MONSTER_SPOT.y + fit.height / 2 - 8,
      fit.width * 0.8,
      22,
      PALETTE.nightBrown,
      0.35
    );

    this.sprite = scene.add.image(MONSTER_SPOT.x, MONSTER_SPOT.y, monster.textureKey).setScale(fit.scale);
    this.baseScale = fit.scale;
  }

  /** A quick swell when an answer lands. */
  flinch() {
    this.scene.tweens.add({
      targets: this.sprite,
      scale: this.baseScale * 1.15,
      duration: 120,
      yoyo: true,
    });
  }

  faint(onComplete: () => void) {
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      onComplete,
    });
  }
}
