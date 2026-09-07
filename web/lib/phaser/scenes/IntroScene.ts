import Phaser from "phaser";

const INTRO_DURATION_MS = 8_000;
const ACCENT = 0xc76537;

type RouteLight = {
  sprite: Phaser.GameObjects.Rectangle;
  points: Phaser.Math.Vector2[];
  phase: number;
  speed: number;
};

export class IntroScene extends Phaser.Scene {
  private routeLights: RouteLight[] = [];
  private leaving = false;

  constructor() {
    super("intro");
  }

  preload() {
    this.load.image(
      "codidex-intro",
      "/assets/wallpapers/codidex-field-guide-wallpaper-v3.png"
    );
  }

  create() {
    const { width, height } = this.scale;
    const background = this.add
      .image(width / 2, height / 2, "codidex-intro")
      .setDisplaySize(width, height)
      .setAlpha(0);

    const baseScaleX = background.scaleX;
    const baseScaleY = background.scaleY;

    this.tweens.add({
      targets: background,
      alpha: 1,
      duration: 900,
      ease: "Quad.Out",
    });

    this.tweens.add({
      targets: background,
      scaleX: baseScaleX * 1.012,
      scaleY: baseScaleY * 1.012,
      y: height / 2 - 2,
      duration: 4_000,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.createDiscoveryPulses();
    this.createRouteLights();

    this.input.once("pointerdown", () => this.finishIntro());
    this.input.keyboard?.once("keydown-ENTER", () => this.finishIntro());
    this.input.keyboard?.once("keydown-SPACE", () => this.finishIntro());
    this.time.delayedCall(INTRO_DURATION_MS, () => this.finishIntro());
  }

  update(_time: number, delta: number) {
    for (const light of this.routeLights) {
      light.phase = (light.phase + (delta / 1_000) * light.speed) % 1;
      const position = this.pointAlongRoute(light.points, light.phase);
      light.sprite.setPosition(position.x, position.y);
    }
  }

  private createDiscoveryPulses() {
    const locations = [
      [85, 296],
      [203, 354],
      [318, 265],
      [684, 281],
      [775, 354],
      [884, 298],
    ];

    locations.forEach(([x, y], index) => {
      const pulse = this.add.rectangle(x, y, 5, 5, ACCENT, 0.25).setDepth(2);
      this.tweens.add({
        targets: pulse,
        alpha: { from: 0.2, to: 0.9 },
        scale: { from: 1, to: 2.2 },
        duration: 900,
        delay: index * 260,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 650,
      });
    });
  }

  private createRouteLights() {
    const routes = [
      [
        new Phaser.Math.Vector2(480, 430),
        new Phaser.Math.Vector2(420, 402),
        new Phaser.Math.Vector2(322, 365),
        new Phaser.Math.Vector2(205, 354),
        new Phaser.Math.Vector2(90, 297),
      ],
      [
        new Phaser.Math.Vector2(480, 430),
        new Phaser.Math.Vector2(552, 395),
        new Phaser.Math.Vector2(675, 365),
        new Phaser.Math.Vector2(778, 354),
        new Phaser.Math.Vector2(891, 298),
      ],
      [
        new Phaser.Math.Vector2(480, 424),
        new Phaser.Math.Vector2(476, 360),
        new Phaser.Math.Vector2(486, 300),
        new Phaser.Math.Vector2(481, 248),
      ],
    ];

    routes.forEach((points, index) => {
      const sprite = this.add
        .rectangle(points[0].x, points[0].y, 4, 4, ACCENT, 0.9)
        .setDepth(3);

      this.tweens.add({
        targets: sprite,
        alpha: { from: 0.35, to: 1 },
        duration: 450,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });

      this.routeLights.push({
        sprite,
        points,
        phase: index * 0.27,
        speed: 0.075 + index * 0.012,
      });
    });
  }

  private pointAlongRoute(points: Phaser.Math.Vector2[], progress: number) {
    const scaled = progress * (points.length - 1);
    const index = Math.min(Math.floor(scaled), points.length - 2);
    const localProgress = scaled - index;

    return points[index].clone().lerp(points[index + 1], localProgress);
  }

  private finishIntro() {
    if (this.leaving) return;
    this.leaving = true;

    this.cameras.main.fadeOut(450, 241, 228, 203);
    this.time.delayedCall(450, () => this.scene.start("world-map"));
  }
}
