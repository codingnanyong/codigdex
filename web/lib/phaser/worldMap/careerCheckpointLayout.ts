import type { JobId } from "@codigdex/game-content/domain/player/jobs";

export interface CareerCheckpointPoint {
  x: number;
  y: number;
}

type LayoutId = "arch" | "basin" | "ascent" | "orbit" | "wave" | "relay" | "constellation";

const LAYOUTS: Readonly<Record<LayoutId, readonly CareerCheckpointPoint[]>> = {
  arch: [
    { x: 145, y: 310 }, { x: 300, y: 255 }, { x: 480, y: 205 },
    { x: 660, y: 255 }, { x: 815, y: 310 },
  ],
  basin: [
    { x: 145, y: 205 }, { x: 305, y: 260 }, { x: 480, y: 315 },
    { x: 650, y: 265 }, { x: 815, y: 215 },
  ],
  ascent: [
    { x: 145, y: 315 }, { x: 300, y: 285 }, { x: 455, y: 260 },
    { x: 625, y: 220 }, { x: 810, y: 190 },
  ],
  orbit: [
    { x: 245, y: 315 }, { x: 155, y: 225 }, { x: 480, y: 195 },
    { x: 805, y: 225 }, { x: 715, y: 315 },
  ],
  wave: [
    { x: 145, y: 270 }, { x: 285, y: 205 }, { x: 455, y: 295 },
    { x: 630, y: 220 }, { x: 815, y: 285 },
  ],
  relay: [
    { x: 145, y: 300 }, { x: 300, y: 245 }, { x: 465, y: 275 },
    { x: 625, y: 195 }, { x: 815, y: 255 },
  ],
  constellation: [
    { x: 150, y: 230 }, { x: 305, y: 310 }, { x: 470, y: 215 },
    { x: 650, y: 290 }, { x: 810, y: 225 },
  ],
};

const REGION_LAYOUTS: Readonly<Record<string, LayoutId>> = {
  "html-css": "arch",
  javascript: "wave",
  "http-api": "relay",
  react: "orbit",
  "frontend-testing": "basin",
  "server-framework": "ascent",
  sql: "orbit",
  "security-auth": "arch",
  network: "relay",
  docker: "basin",
  cicd: "ascent",
  kubernetes: "orbit",
  "cloud-iac": "ascent",
  monitoring: "constellation",
  python: "wave",
  "data-pipeline": "relay",
  orchestration: "orbit",
  statistics: "constellation",
  visualization: "arch",
  "bi-tools": "basin",
};

/**
 * Keeps checkpoints on each wallpaper's open arena while changing their visual
 * rhythm by technology and career. Shared technologies are mirrored or
 * reshaped so their different career wallpapers do not feel cloned.
 */
export function careerCheckpointLayout(
  careerId: JobId,
  regionId: string
): readonly CareerCheckpointPoint[] {
  const base = LAYOUTS[REGION_LAYOUTS[regionId] ?? "arch"];

  return base.map((point, index) => {
    let adjusted: CareerCheckpointPoint;
    switch (careerId) {
      case "backend":
        adjusted = { x: 960 - point.x, y: point.y };
        break;
      case "devops":
        adjusted = { x: point.x, y: point.y + (index % 2 === 0 ? -12 : 14) };
        break;
      case "data-engineer":
        adjusted = { x: point.x, y: 510 - point.y };
        break;
      case "data-analyst":
        adjusted = { x: 960 - point.x, y: point.y + (index % 2 === 0 ? 12 : -10) };
        break;
      default:
        adjusted = { ...point };
    }
    return { x: adjusted.x, y: Math.min(325, Math.max(185, adjusted.y)) };
  });
}
