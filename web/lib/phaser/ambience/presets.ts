import type Phaser from "phaser";
import type { AmbienceId } from "@/lib/domain/chapters/types";
import { driftMotes, flickerGlow, pulseGlow } from "./effects";

type Preset = (scene: Phaser.Scene) => void;
type Point = readonly [number, number];

/**
 * Where each painting's own lights are, in 960x540 space. These were measured
 * from the images (clusters of bright warm pixels), so the glows sit on the
 * lamps and bulbs they belong to — repaint a background and re-measure.
 */
const LIGHTS = {
  gitSun: [830, 88] as Point,
  gitBulbs: [[485, 81], [671, 71], [705, 84], [74, 63]] as Point[],
  linuxLamps: [[155, 120], [85, 238], [316, 146], [803, 115], [900, 285]] as Point[],
  linuxPillarStrips: [[42, 190], [248, 108], [678, 105], [912, 188]] as Point[],
  archiveDoorway: [478, 415] as Point,
  archiveCandles: [[170, 455], [859, 440]] as Point[],
  archiveBeetles: [[181, 256], [251, 299], [745, 284]] as Point[],
};

/** Title-screen text sits at depth 4-5; its ambience stays just underneath. */
const TITLE_AMBIENCE_DEPTH = 3;

const loopForest: Preset = (scene) => {
  const { width, height } = scene.scale;
  const everywhere = { x: 0, y: 0, width, height };

  // Fireflies wandering over the clearing.
  driftMotes(scene, {
    area: everywhere,
    count: 22,
    colors: [0xf6e27a, 0xd8f08a],
    size: [2, 3],
    velocityX: [-6, 6],
    velocityY: [-8, -2],
    alpha: [0.7, 1],
    sway: 8,
    twinkle: true,
  });
  // A few leaves tumbling across on the breeze.
  driftMotes(scene, {
    area: everywhere,
    count: 8,
    colors: [0x8a9a3c, 0xb07a3a, 0x6f7d2e],
    size: [3, 4],
    velocityX: [10, 22],
    velocityY: [14, 28],
    alpha: [0.75, 0.95],
    sway: 10,
  });
};

const gitField: Preset = (scene) => {
  const { width, height } = scene.scale;
  const [sunX, sunY] = LIGHTS.gitSun;

  pulseGlow(scene, { x: sunX, y: sunY, radius: 72, color: 0xffb46b, alpha: [0.18, 0.34], duration: 3200 });
  LIGHTS.gitBulbs.forEach(([x, y], index) =>
    pulseGlow(scene, { x, y, radius: 12, color: 0xff9a4a, alpha: [0.25, 0.6], duration: 1400, delay: index * 350 })
  );
  // Warm pollen rising off the field in the evening light.
  driftMotes(scene, {
    area: { x: 0, y: 120, width, height: height - 120 },
    count: 26,
    colors: [0xffc27a, 0xe8834f, 0xfff1c2],
    size: [1, 2],
    velocityX: [-4, 8],
    velocityY: [-16, -6],
    alpha: [0.5, 0.95],
    sway: 4,
    twinkle: true,
  });
  // Autumn leaves drifting down from the trees.
  driftMotes(scene, {
    area: { x: 0, y: 0, width, height },
    count: 7,
    colors: [0xc8642a, 0xe8a04a, 0x9a4a22],
    size: [3, 3],
    velocityX: [12, 24],
    velocityY: [18, 30],
    alpha: [0.8, 1],
    sway: 12,
  });
};

const linuxCave: Preset = (scene) => {
  const { height } = scene.scale;

  // Snow falling in through the cave mouth.
  driftMotes(scene, {
    area: { x: 260, y: 0, width: 440, height },
    count: 44,
    colors: [0xffffff, 0xdce8f2],
    size: [1, 2],
    velocityX: [-5, 5],
    velocityY: [16, 32],
    alpha: [0.45, 0.9],
    sway: 5,
  });
  // Cursor-arrow lamps buzzing on their posts.
  LIGHTS.linuxLamps.forEach(([x, y]) =>
    flickerGlow(scene, { x, y, radius: 18, color: 0xffc861, alpha: [0.3, 0.6] })
  );
  // Status-light strips on the terminal pillars, breathing slowly.
  LIGHTS.linuxPillarStrips.forEach(([x, y], index) =>
    pulseGlow(scene, { x, y, radius: 14, color: 0xff9a3d, alpha: [0.2, 0.45], duration: 1600, delay: index * 400 })
  );
};

const titleArchive: Preset = (scene) => {
  const depth = TITLE_AMBIENCE_DEPTH;
  const [doorX, doorY] = LIGHTS.archiveDoorway;

  // Dust glittering up out of the archive doors.
  driftMotes(scene, {
    area: { x: 330, y: 220, width: 300, height: 260 },
    count: 28,
    colors: [0xe8834f, 0xf3c27a, 0xfff1c2],
    size: [1, 2],
    velocityX: [-3, 3],
    velocityY: [-16, -6],
    alpha: [0.45, 0.95],
    sway: 4,
    twinkle: true,
    depth,
  });
  flickerGlow(scene, { x: doorX, y: doorY, radius: 46, color: 0xffcf7a, alpha: [0.22, 0.42], depth });
  LIGHTS.archiveCandles.forEach(([x, y]) =>
    flickerGlow(scene, { x, y, radius: 16, color: 0xffb04a, alpha: [0.3, 0.6], depth })
  );
  LIGHTS.archiveBeetles.forEach(([x, y], index) =>
    pulseGlow(scene, { x, y, radius: 14, color: 0xfff0a0, alpha: [0.15, 0.45], duration: 1500, delay: index * 500, depth })
  );
};

export const AMBIENCE_PRESETS: Record<AmbienceId, Preset> = {
  "loop-forest": loopForest,
  "git-field": gitField,
  "linux-cave": linuxCave,
  "title-archive": titleArchive,
};
