import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  calculateCycleProgress,
  statusForCycle,
  syncSprintProgress,
} from "./sync_linear_notion_sprint.mjs";

test("calculates completed issue ratio and excludes canceled issues", () => {
  const result = calculateCycleProgress([
    { state: { type: "completed" } },
    { state: { type: "completed" } },
    { state: { type: "started" } },
    { state: { type: "unstarted" } },
    { state: { type: "canceled" } },
  ]);

  assert.deepEqual(result, { completed: 2, total: 4, progress: 0.5 });
});

test("returns zero progress for an empty cycle", () => {
  assert.deepEqual(calculateCycleProgress([]), { completed: 0, total: 0, progress: 0 });
});

test("maps cycle dates and progress to Sprint Tracker statuses", () => {
  const cycle = { startsAt: "2026-09-14T00:00:00Z", endsAt: "2026-09-20T23:59:59Z" };

  assert.equal(statusForCycle({ ...cycle, progress: 0 }, new Date("2026-09-13T00:00:00Z")), "Planned");
  assert.equal(statusForCycle({ ...cycle, progress: 0.5 }, new Date("2026-09-15T00:00:00Z")), "In Progress");
  assert.equal(statusForCycle({ ...cycle, progress: 0.5 }, new Date("2026-09-21T00:00:00Z")), "Delayed");
  assert.equal(statusForCycle({ ...cycle, progress: 1 }, new Date("2026-09-15T00:00:00Z")), "Completed");
});

test("treats the cycle start as inclusive and its end as exclusive", () => {
  const cycle = { startsAt: "2026-09-14T00:00:00Z", endsAt: "2026-09-20T23:59:59Z" };

  assert.equal(statusForCycle({ ...cycle, progress: 0 }, new Date(cycle.startsAt)), "In Progress");
  assert.equal(statusForCycle({ ...cycle, progress: 0.5 }, new Date(cycle.endsAt)), "Delayed");
});

const env = {
  LINEAR_API_KEY: "test-linear", NOTION_API_KEY: "test-notion",
  LINEAR_TEAM_KEY: "COD", LINEAR_PROJECT_NAME: "Codigdex",
  LINEAR_PROJECT_SLUG: "codigdex", LINEAR_WORKSPACE_SLUG: "test",
  NOTION_SPRINT_DATA_SOURCE_ID: "sprints",
};

function syncFixture(t, { missingCurrent = false, duplicatePrevious = false, paginated = false, previousProgress = 1 } = {}) {
  const updates = [];
  const issueQueries = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    let result;
    if (url.includes("linear.app")) {
      if (!body.variables.cycleId) {
        result = { data: {
          teams: { nodes: [{ cycles: { nodes: [
            { id: "older", number: 7, startsAt: "2026-10-19T00:00:00Z", endsAt: "2026-10-26T00:00:00Z" },
            { id: "current", number: 9, startsAt: "2026-11-02T00:00:00Z", endsAt: "2026-11-09T00:00:00Z" },
            { id: "previous", number: 8, startsAt: "2026-10-26T00:00:00Z", endsAt: "2026-11-02T00:00:00Z" },
          ] } }] },
          projects: { nodes: [{ id: "project", name: "Codigdex", slugId: "codigdex", url: "https://linear.app/test/project/codigdex" }] },
        } };
      } else {
        issueQueries.push(body.variables);
        result = { data: { cycle: { issues: {
          nodes: [{ state: { type: body.variables.cycleId === "previous" ? "completed" : "started" } }],
          pageInfo: { hasNextPage: paginated },
        } } } };
      }
    } else if (url.endsWith("/query")) {
      const number = Number(body.filter.and[0].url.equals.split("/").at(-1));
      assert.equal(body.filter.and[1].url.equals, "https://linear.app/test/project/codigdex");
      result = { results: number === 9 && missingCurrent ? [] : number === 8 && duplicatePrevious ? [{ id: "a" }, { id: "b" }] : [{ id: `sprint-${number}`, properties: { "Completion %": { number: previousProgress } } }] };
    } else {
      updates.push({ url, properties: body.properties });
      result = {};
    }
    return new Response(JSON.stringify(result), { status: 200 });
  });
  return { updates, issueQueries };
}

test("reconciles last week's completed sprint at the exact new-cycle boundary", async (t) => {
  const { updates, issueQueries } = syncFixture(t);
  const result = await syncSprintProgress(env, new Date("2026-11-02T00:00:00Z"));
  assert.deepEqual(issueQueries, [{ cycleId: "current", projectId: "project" }]);
  assert.equal(updates.length, 2);
  assert.ok(updates[0].url.endsWith("/sprint-8"));
  assert.equal(updates[0].properties.Status.select.name, "Completed");
  assert.equal(updates[0].properties["Completion %"], undefined);
  assert.equal(updates[1].properties.Status.select.name, "In Progress");
  assert.equal(result.cycle, 9);
  assert.deepEqual(result.reconciledCycles.map(({ cycle }) => cycle), [8, 9]);
});

test("does not turn a half-finished sprint into 100% after unfinished issues roll over", async (t) => {
  const { updates } = syncFixture(t, { previousProgress: 0.5 });
  const result = await syncSprintProgress(env, new Date("2026-11-03T00:00:00Z"));
  assert.equal(result.reconciledCycles[0].progress, 0.5);
  assert.equal(result.reconciledCycles[0].status, "Delayed");
  assert.equal(updates[0].properties["Completion %"], undefined);
});

test("leaves ended sprint metrics alone when no valid completion snapshot exists", async (t) => {
  const { updates } = syncFixture(t, { previousProgress: null });
  const result = await syncSprintProgress(env, new Date("2026-11-03T00:00:00Z"));
  assert.equal(updates.length, 1);
  assert.equal(result.reconciledCycles[0].reason, "missing-completion-snapshot");
  assert.equal(result.cycle, 9);
});

test("still closes the previous sprint when the current Notion mapping is absent", async (t) => {
  const { updates } = syncFixture(t, { missingCurrent: true });
  const result = await syncSprintProgress(env, new Date("2026-11-03T00:00:00Z"));
  assert.equal(updates.length, 1);
  assert.equal(result.skipped, true);
  assert.equal(result.reconciledCycles[0].status, "Completed");
});

test("refuses duplicate Notion mappings instead of updating an arbitrary sprint", async (t) => {
  const { updates } = syncFixture(t, { duplicatePrevious: true });
  await assert.rejects(syncSprintProgress(env, new Date("2026-11-03T00:00:00Z")), /found 2/);
  assert.equal(updates.length, 0);
});

test("refuses incomplete Linear pages before writing sprint metrics", async (t) => {
  const { updates } = syncFixture(t, { paginated: true });
  await assert.rejects(syncSprintProgress(env, new Date("2026-11-03T00:00:00Z")), /more than 250/);
  assert.equal(updates.length, 0);
});

test("writes current-cycle GitHub outputs as separate actual lines", async (t) => {
  syncFixture(t);
  const directory = mkdtempSync(join(tmpdir(), "codigdex-sync-"));
  const output = join(directory, "outputs");
  t.after(() => { unlinkSync(output); rmdirSync(directory); });
  await syncSprintProgress({ ...env, GITHUB_OUTPUT: output }, new Date("2026-11-03T00:00:00Z"));
  const lines = readFileSync(output, "utf8").trim().split("\n");
  assert.ok(lines.includes("cycle=9"));
  assert.ok(lines.includes("status=In Progress"));
  assert.equal(lines.length, 7);
  assert.ok(!lines.some((line) => line.includes("\\n")));
});
