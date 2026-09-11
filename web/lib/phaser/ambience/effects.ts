import Phaser from "phaser";

type Range = readonly [number, number];

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

function between([min, max]: Range): number {
  return min + Math.random() * (max - min);
}

function wrap(value: number, start: number, length: number): number {
  return ((((value - start) % length) + length) % length) + start;
}

/** Runs `step` every frame until the scene shuts down. */
function everyFrame(scene: Phaser.Scene, step: (deltaMs: number) => void) {
  const onUpdate = (_time: number, delta: number) => step(delta);
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
  });
}

export interface DriftOptions {
  area: Area;
  count: number;
  colors: readonly number[];
  /** Square side in whole pixels. */
  size: Range;
  /** Pixels per second along each axis. */
  velocityX: Range;
  velocityY: Range;
  alpha: Range;
  /** Side-to-side wobble in pixels, for things that float rather than fall. */
  sway?: number;
  /** Fade each mote in and out on its own rhythm, like a firefly. */
  twinkle?: boolean;
  depth?: number;
}

/**
 * Square motes drifting through an area and wrapping at its edges — dust,
 * snow, pollen, fireflies. Positions are rounded every frame so nothing
 * renders between pixels and the art stays crisp.
 */
export function driftMotes(scene: Phaser.Scene, options: DriftOptions) {
  const { area } = options;

  const motes = Array.from({ length: options.count }, () => {
    const size = Math.round(between(options.size));
    const alpha = between(options.alpha);
    const color = options.colors[Math.floor(Math.random() * options.colors.length)];
    const square = scene.add.rectangle(0, 0, size, size, color, alpha).setOrigin(0);
    if (options.depth !== undefined) square.setDepth(options.depth);

    if (options.twinkle) {
      scene.tweens.add({
        targets: square,
        alpha: { from: 0, to: alpha },
        duration: between([700, 1600]),
        delay: between([0, 1600]),
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
    }

    return {
      square,
      x: area.x + Math.random() * area.width,
      y: area.y + Math.random() * area.height,
      vx: between(options.velocityX),
      vy: between(options.velocityY),
      phase: Math.random() * Math.PI * 2,
    };
  });

  const place = (deltaMs: number) => {
    const seconds = deltaMs / 1000;
    for (const mote of motes) {
      mote.x = wrap(mote.x + mote.vx * seconds, area.x, area.width);
      mote.y = wrap(mote.y + mote.vy * seconds, area.y, area.height);
      mote.phase += seconds * 1.5;
      const sway = options.sway ? Math.sin(mote.phase) * options.sway : 0;
      mote.square.setPosition(Math.round(mote.x + sway), Math.round(mote.y));
    }
  };

  place(0);
  everyFrame(scene, place);
}

export interface GlowOptions {
  x: number;
  y: number;
  radius: number;
  color: number;
  /** Overall brightness the light moves between. */
  alpha: Range;
  /** One slow breath, in ms. Flickering lights ignore it. */
  duration?: number;
  delay?: number;
  depth?: number;
}

/**
 * Three stepped rings instead of a smooth gradient — the pixel-art way to
 * draw light — added over the art so it brightens what's underneath.
 */
function steppedGlow(scene: Phaser.Scene, options: GlowOptions): Phaser.GameObjects.Container {
  const rings = [1, 0.62, 0.32].map((scale, index) =>
    scene.add
      .circle(0, 0, Math.max(1, Math.round(options.radius * scale)), options.color, 0.35 + index * 0.3)
      .setBlendMode(Phaser.BlendModes.ADD)
  );
  const glow = scene.add.container(options.x, options.y, rings).setAlpha(options.alpha[0]);
  if (options.depth !== undefined) glow.setDepth(options.depth);
  return glow;
}

/** A light that swells and fades on a slow, steady rhythm — a glowing bulb or the sun. */
export function pulseGlow(scene: Phaser.Scene, options: GlowOptions) {
  const glow = steppedGlow(scene, options);
  scene.tweens.add({
    targets: glow,
    alpha: options.alpha[1],
    scale: 1.12,
    duration: options.duration ?? 1800,
    delay: options.delay ?? 0,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });
  return glow;
}

/** A light that jumps between brightnesses at uneven intervals — a torch or a buzzing lamp. */
export function flickerGlow(scene: Phaser.Scene, options: GlowOptions) {
  const glow = steppedGlow(scene, options);
  const flicker = () => {
    scene.tweens.add({
      targets: glow,
      alpha: between(options.alpha),
      duration: between([50, 160]),
      onComplete: () => {
        scene.time.delayedCall(between([30, 240]), flicker);
      },
    });
  };
  flicker();
  return glow;
}

/** Slow zoom and lift on a full-screen backdrop, so a still painting seems to breathe. */
export function breathe(
  scene: Phaser.Scene,
  image: Phaser.GameObjects.Image,
  { amount = 0.015, lift = 3, duration = 5_000 } = {}
) {
  scene.tweens.add({
    targets: image,
    scaleX: image.scaleX * (1 + amount),
    scaleY: image.scaleY * (1 + amount),
    y: image.y - lift,
    duration,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });
}
