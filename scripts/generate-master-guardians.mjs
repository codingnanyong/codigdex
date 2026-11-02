import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Repo-native pixel geometry is the editable source; SVG and PNG are emitted together.
const palettes = [
  ['software-architect', '#b95446', '#ed9b65', '#ffe6a4'],
  ['cloud-platform-architect', '#436a9a', '#87b8ca', '#e4f4e7'],
  ['ai-product-engineer', '#738b47', '#b5c570', '#fff0b6'],
  ['ai-platform-architect', '#715a9e', '#b49bc4', '#f5dba7'],
  ['data-architect', '#368982', '#82c8b4', '#fff0b6'],
];
const shapes = [
  ['M20 20h24v28H20z', 'M12 12h12v16H12z M40 12h12v16H40z M16 44h12v12H16z M36 44h12v12H36z'],
  ['M16 24h32v24H16z M24 16h16v8H24z', 'M8 28h8v16H8z M48 28h8v16H48z M20 48h8v8H20z M36 48h8v8H36z'],
  ['M20 16h24v32H20z M16 24h32v16H16z', 'M8 20h12v8H8z M44 20h12v8H44z M12 48h16v8H12z M36 48h16v8H36z'],
  ['M24 12h16v8H24z M16 20h32v28H16z', 'M8 24h8v24H8z M48 24h8v24H48z M20 48h8v8H20z M36 48h8v8H36z'],
  ['M20 16h24v8H20z M16 24h32v24H16z', 'M8 12h12v12H8z M44 12h12v12H44z M4 28h12v12H4z M48 28h12v12H48z M12 48h16v8H12z M36 48h16v8H36z'],
];
for (const [career, dark, light, glow] of palettes) {
  const dir = `packages/game-assets/files/monsters/mastery/${career}`;
  await mkdir(dir, { recursive: true });
  for (const [index, [body, limbs]] of shapes.entries()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64" shape-rendering="crispEdges"><path fill="#312b36" d="${limbs}"/><path fill="${dark}" stroke="#312b36" stroke-width="4" d="${body}"/><path fill="${light}" d="M24 24h16v8H24z M20 36h24v8H20z"/><path fill="#312b36" d="M24 28h4v4H24z M36 28h4v4H36z M28 40h8v4H28z"/><path fill="${glow}" d="M28 ${4 + index * 2}h8v8h-8z M4 ${44 - index * 2}h4v4H4z M56 ${20 + index * 3}h4v4H56z"/><path fill="${glow}" d="M28 48h8v4h-8z"/></svg>`;
    await writeFile(`${dir}/guardian-${index + 1}.svg`, svg);
    await sharp(Buffer.from(svg)).png().toFile(`${dir}/guardian-${index + 1}.png`);
  }
}
console.log('Generated 25 distinct master guardian sprites (SVG source and PNG).');
