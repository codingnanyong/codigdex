import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const packageRoot = path.resolve(import.meta.dirname, "..");
const monsterRoot = path.join(packageRoot, "files", "monsters");

const jobs = [
  ["ch10.security-auth", "security-auth-evolution-sheet-v1.png", [[1, "identity-keeper-lv2-v2.png"]]],
  ["ch16.react", "react-evolution-sheet-v1.png", [[5, "component-architect-lv5-v2.png"]]],
  ["ch17.server-framework", "server-framework-evolution-sheet-v1.png", [[4, "framework-orchestrator-lv4-v2.png"], [5, "service-guardian-lv5-v2.png"]]],
  ["ch18.data-pipeline", "data-pipeline-evolution-sheet-v1.png", [[4, "pipeline-conductor-lv4-v2.png"], [5, "flow-architect-lv5-v2.png"]]],
  ["ch19.orchestration", "workflow-orchestration-evolution-sheet-v1.png", [[4, "schedule-conductor-lv4-v2.png"], [5, "workflow-maestro-lv5-v2.png"]]],
  ["ch20.statistics", "statistics-evolution-sheet-v1.png", [[4, "variance-oracle-lv4-v2.png"], [5, "inference-guardian-lv5-v2.png"]]],
  ["ch21.visualization", "visualization-evolution-sheet-v1.png", [[4, "dashboard-storyteller-lv4-v2.png"], [5, "insight-prism-lv5-v2.png"]]],
  ["ch22.bi-tools", "bi-tools-evolution-sheet-v1.png", [[4, "kpi-oracle-lv4-v2.png"], [5, "decision-guardian-lv5-v2.png"]]],
];

const distanceSquared = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

async function readComponents(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const seen = new Uint8Array(width * height);
  const components = [];

  for (let start = 0; start < width * height; start += 1) {
    if (seen[start] || data[start * 4 + 3] === 0) continue;
    const queue = [start];
    const pixels = [];
    seen[start] = 1;
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;

    while (queue.length > 0) {
      const pixel = queue.pop();
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      pixels.push(pixel);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);

      const neighbors = [pixel - 1, pixel + 1, pixel - width, pixel + width];
      for (const neighbor of neighbors) {
        if (neighbor < 0 || neighbor >= width * height || seen[neighbor]) continue;
        if (neighbor === pixel - 1 && x === 0) continue;
        if (neighbor === pixel + 1 && x === width - 1) continue;
        if (data[neighbor * 4 + 3] === 0) continue;
        seen[neighbor] = 1;
        queue.push(neighbor);
      }
    }

    if (pixels.length >= 24) {
      components.push({
        pixels,
        center: { x: (left + right) / 2, y: (top + bottom) / 2 },
      });
    }
  }

  return { data, info, components };
}

async function renderTarget(source, cellIndex, outputPath) {
  const { data, info, components } = source;
  const anchors = [...components].sort((a, b) => b.pixels.length - a.pixels.length).slice(0, 6);
  const cellWidth = info.width / 3;
  const cellHeight = info.height / 2;
  const targetCenter = {
    x: (cellIndex % 3 + 0.5) * cellWidth,
    y: (Math.floor(cellIndex / 3) + 0.5) * cellHeight,
  };
  const targetAnchor = anchors.reduce((best, anchor) =>
    distanceSquared(anchor.center, targetCenter) < distanceSquared(best.center, targetCenter) ? anchor : best
  );
  const selected = components.filter((component) => {
    const nearest = anchors.reduce((best, anchor) =>
      distanceSquared(component.center, anchor.center) < distanceSquared(component.center, best.center)
        ? anchor
        : best
    );
    return nearest === targetAnchor;
  });

  let left = info.width;
  let top = info.height;
  let right = 0;
  let bottom = 0;
  for (const { pixels } of selected) {
    for (const pixel of pixels) {
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  const width = right - left + 1;
  const height = bottom - top + 1;
  const raw = Buffer.alloc(width * height * 4);
  for (const { pixels } of selected) {
    for (const pixel of pixels) {
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      const sourceOffset = pixel * 4;
      const targetOffset = ((y - top) * width + (x - left)) * 4;
      data.copy(raw, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  const { data: resized, info: resizedInfo } = await sharp(raw, {
    raw: { width, height, channels: 4 },
  })
    .resize({ width: 168, height: 168, fit: "inside", kernel: sharp.kernel.nearest })
    .png()
    .toBuffer({ resolveWithObject: true });

  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{
      input: resized,
      left: Math.floor((192 - resizedInfo.width) / 2),
      top: Math.floor((192 - resizedInfo.height) / 2),
    }])
    .png()
    .toFile(outputPath);
}

for (const [folder, sheetName, targets] of jobs) {
  const directory = path.join(monsterRoot, folder);
  const source = await readComponents(path.join(directory, sheetName));
  for (const [cellIndex, outputName] of targets) {
    const outputPath = path.join(directory, outputName);
    await renderTarget(source, cellIndex, outputPath);
    console.log(`Wrote ${path.relative(packageRoot, outputPath)}`);
  }
}
