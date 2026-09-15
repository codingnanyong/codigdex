import Phaser from "phaser";
import { PALETTE } from "../palette";

export interface MapPosition {
  x: number;
  y: number;
}

export interface MapMovementBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const DEFAULT_MAP_MOVEMENT_BOUNDS: MapMovementBounds = {
  left: 38,
  right: 922,
  top: 72,
  bottom: 510,
};

export function clampMapPosition(
  position: MapPosition,
  bounds: MapMovementBounds = DEFAULT_MAP_MOVEMENT_BOUNDS
): MapPosition {
  return {
    x: Math.min(bounds.right, Math.max(bounds.left, position.x)),
    y: Math.min(bounds.bottom, Math.max(bounds.top, position.y)),
  };
}

interface WorldMapPlayerOptions {
  textureKey: string;
  start: MapPosition;
  onInteract: () => void;
  bounds?: MapMovementBounds;
}

/** Keyboard, pointer and touch movement for the character shown on chapter maps. */
export class WorldMapPlayer {
  readonly sprite: Phaser.GameObjects.Image;
  readonly shadow: Phaser.GameObjects.Ellipse;

  private readonly position: Phaser.Math.Vector2;
  private readonly bounds: MapMovementBounds;
  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private target?: Phaser.Math.Vector2;
  private enabled = true;
  private traveling = false;
  private walkPhase = 0;

  constructor(private readonly scene: Phaser.Scene, options: WorldMapPlayerOptions) {
    this.bounds = options.bounds ?? DEFAULT_MAP_MOVEMENT_BOUNDS;
    const start = options.start;
    this.position = new Phaser.Math.Vector2(start.x, start.y);

    this.shadow = scene.add
      .ellipse(start.x, start.y + 26, 36, 10, PALETTE.nightBrown, 0.28)
      .setDepth(2);
    this.sprite = scene.add
      .image(start.x, start.y, options.textureKey)
      .setDisplaySize(41, 54)
      .setDepth(3);

    const movementSurface = scene.add
      .rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width, scene.scale.height, 0xffffff, 0)
      .setInteractive()
      .setDepth(0.5);
    movementSurface.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled || this.traveling) return;
      const destination = clampMapPosition({ x: pointer.worldX, y: pointer.worldY }, this.bounds);
      this.target = new Phaser.Math.Vector2(destination.x, destination.y);
    });

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys("W,A,S,D") as Record<
        "W" | "A" | "S" | "D",
        Phaser.Input.Keyboard.Key
      >;
      const interact = () => {
        if (this.enabled && !this.traveling) options.onInteract();
      };
      scene.input.keyboard.on("keydown-ENTER", interact);
      scene.input.keyboard.on("keydown-SPACE", interact);
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.input.keyboard?.off("keydown-ENTER", interact);
        scene.input.keyboard?.off("keydown-SPACE", interact);
      });
    }

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.target = undefined;
  }

  distanceTo(position: MapPosition): number {
    return Phaser.Math.Distance.Between(this.position.x, this.position.y, position.x, position.y);
  }

  followPath(points: readonly MapPosition[], onComplete?: () => void) {
    if (points.length < 2) {
      onComplete?.();
      return;
    }

    this.traveling = true;
    this.enabled = false;
    this.target = undefined;
    const curve = new Phaser.Curves.Spline(
      points.map((point) => new Phaser.Math.Vector2(point.x, point.y))
    );
    const progress = { value: 0 };
    const travelLength = curve.getLength();
    const walkCycles = Math.max(4, Math.round(travelLength / 54));

    this.scene.tweens.add({
      targets: progress,
      value: 1,
      duration: Phaser.Math.Clamp((travelLength / 240) * 1_000, 900, 3_200),
      ease: "Linear",
      onUpdate: () => {
        const current = curve.getPointAt(progress.value);
        const next = curve.getPointAt(Math.min(1, progress.value + 0.002));
        this.position.set(current.x, current.y);
        this.walkPhase = progress.value * Math.PI * walkCycles;
        this.renderWalking(Boolean(next && next.x < current.x));
      },
      onComplete: () => {
        const destination = points[points.length - 1];
        this.position.set(destination.x, destination.y);
        this.renderIdle();
        this.traveling = false;
        this.enabled = true;
        onComplete?.();
      },
    });
  }

  private update(_time: number, delta: number) {
    if (!this.enabled || this.traveling) return;

    const direction = new Phaser.Math.Vector2(
      Number(Boolean(this.cursors?.right.isDown || this.wasd?.D.isDown)) -
        Number(Boolean(this.cursors?.left.isDown || this.wasd?.A.isDown)),
      Number(Boolean(this.cursors?.down.isDown || this.wasd?.S.isDown)) -
        Number(Boolean(this.cursors?.up.isDown || this.wasd?.W.isDown))
    );
    if (direction.lengthSq() > 0) {
      direction.normalize();
      this.target = undefined;
    } else if (this.target) {
      direction.copy(this.target).subtract(this.position);
      if (direction.length() <= 4) {
        this.position.copy(this.target);
        this.target = undefined;
        this.renderIdle();
        return;
      }
      direction.normalize();
    } else {
      this.renderIdle();
      return;
    }

    const distance = Math.min(170 * (delta / 1_000), this.target?.distance(this.position) ?? Number.POSITIVE_INFINITY);
    const next = clampMapPosition(
      { x: this.position.x + direction.x * distance, y: this.position.y + direction.y * distance },
      this.bounds
    );
    this.position.set(next.x, next.y);
    this.walkPhase += distance / 10;
    this.renderWalking(direction.x < 0);
  }

  private renderWalking(facingLeft: boolean) {
    const step = Math.abs(Math.sin(this.walkPhase));
    this.sprite.setPosition(this.position.x, this.position.y - step * 3).setFlipX(facingLeft);
    this.shadow
      .setPosition(this.position.x, this.position.y + 26)
      .setScale(1 - step * 0.08, 1 - step * 0.04);
  }

  private renderIdle() {
    this.sprite.setPosition(this.position.x, this.position.y);
    this.shadow.setPosition(this.position.x, this.position.y + 26).setScale(1);
  }
}
