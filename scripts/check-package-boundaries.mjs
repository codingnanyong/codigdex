import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const packageRules = [
  {
    directory: "packages/game-assets/src",
    allowedWorkspaces: new Set(),
  },
  {
    directory: "packages/game-core/src",
    allowedWorkspaces: new Set(),
  },
  {
    directory: "packages/game-content/src",
    allowedWorkspaces: new Set(["@codigdex/game-core"]),
  },
  {
    directory: "packages/game-i18n/src",
    allowedWorkspaces: new Set(["@codigdex/game-core"]),
  },
];

const platformPackages = new Set(["next", "phaser", "react", "react-dom", "expo", "react-native"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const importPattern = /(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
// Shared packages hold asset keys; turning a key into a URL is each app's job.
const assetUrlPattern = /["'`]\/assets\//;
const violations = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(entryPath);
  }
  return files;
}

function workspaceName(specifier) {
  if (!specifier.startsWith("@codigdex/")) return undefined;
  return specifier.split("/").slice(0, 2).join("/");
}

for (const rule of packageRules) {
  for (const file of await collectFiles(rule.directory)) {
    const source = await readFile(file, "utf8");
    if (assetUrlPattern.test(source)) {
      violations.push(`${file}: use an asset key instead of an /assets/ URL`);
    }
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      const dependency = workspaceName(specifier);
      const topLevelPackage = specifier.startsWith("@")
        ? specifier.split("/").slice(0, 2).join("/")
        : specifier.split("/")[0];

      if (dependency && !rule.allowedWorkspaces.has(dependency)) {
        violations.push(`${file}: workspace dependency ${dependency} is not allowed`);
      }
      if (platformPackages.has(topLevelPackage)) {
        violations.push(`${file}: platform dependency ${topLevelPackage} is not allowed`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Package boundary violations:\n" + violations.map((item) => `- ${item}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Package boundaries are valid.");
}
