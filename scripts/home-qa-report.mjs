import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cases, repo } from "./home-qa.mjs";

export function matrix(runs, commit, includeDirty = false) {
  const rows = cases.features.map((feature) => ({ feature: feature.id, branch: feature.branch, web: "NOT_RUN", android: "NOT_RUN", ios: "NOT_RUN" }));
  const selected = runs.filter((run) => run.commit === commit && !run.sourceChanged && (includeDirty || (!run.dirty && !run.dirtyAtFinish))).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const run of selected) for (const result of run.results ?? []) {
    if (!["web", "android", "ios"].includes(result.platform)) continue;
    const passing = result.status === "passed" && result.expectedTests > 0 && result.counts?.tests === result.expectedTests && result.counts.passed === result.expectedTests && result.counts.failures === 0 && result.counts.skipped === 0;
    const status = passing ? (run.dirty || run.dirtyAtFinish ? "PASS_DIRTY" : "PASS") : result.status === "failed" || result.status === "passed" ? "FAIL" : "INCOMPLETE";
    for (const row of rows) if (run.feature === "all" || run.feature === row.feature) row[result.platform] = status;
  }
  return rows.map((row) => ({ ...row, complete: [row.web, row.android, row.ios].every((status) => status === "PASS") }));
}

export function main(args) {
  let commit = "HEAD";
  let includeDirty = false;
  const sources = [path.join(repo, "qa-results")];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--include-dirty") includeDirty = true;
    else if (args[i] === "--from" && args[i + 1] && !args[i + 1].startsWith("--")) sources.push(path.resolve(args[++i]));
    else if (args[i] === "--commit" && /^[a-f0-9]{7,40}$/i.test(args[i + 1] ?? "")) commit = args[++i];
    else throw new Error("Usage: npm run qa:report -- [--commit SHA] [--from OTHER_COMPUTER_QA_RESULTS] [--include-dirty]");
  }
  const resolved = spawnSync("git", ["rev-parse", "--verify", `${commit}^{commit}`], { cwd: repo, encoding: "utf8", windowsHide: true });
  if (resolved.status !== 0) throw new Error("Cannot resolve the requested commit.");
  const sha = resolved.stdout.trim();
  const directory = path.join(repo, "qa-results");
  const runs = [];
  for (const source of new Set(sources)) if (existsSync(source)) {
    const direct = path.join(source, "run.json");
    if (existsSync(direct)) runs.push(JSON.parse(readFileSync(direct, "utf8")));
    else for (const entry of readdirSync(source, { withFileTypes: true })) {
      const file = path.join(source, entry.name, "run.json");
      if (entry.isDirectory() && existsSync(file)) runs.push(JSON.parse(readFileSync(file, "utf8")));
    }
  }
  const rows = matrix(runs, sha, includeDirty);
  console.log(`Feature QA for ${sha}${includeDirty ? " (including explicitly marked dirty runs)" : " (clean checkout runs only)"}`);
  console.table(rows);
  console.log("A feature is complete only when Web, Android and iOS pass on the same clean commit. NOT_RUN is not a pass.");
  if (existsSync(directory)) writeFileSync(path.join(directory, `report-${sha.slice(0, 7)}.json`), JSON.stringify({ commit: sha, includeDirty, rows }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
