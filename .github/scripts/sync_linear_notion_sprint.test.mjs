import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCycleProgress,
  statusForCycle,
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
