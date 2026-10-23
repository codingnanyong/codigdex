import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseAllDocuments } from "yaml";
import { cases, repo, parseOptions, plan, selectDevice, reportCounts, commandFor } from "./home-qa.mjs";
import { matrix } from "./home-qa-report.mjs";

test("selects one feature on each supported platform without modifying branches", () => {
  for (const feature of cases.features) for (const platform of ["web", "android", "ios"]) {
    const options = parseOptions(["--platform", platform, "--feature", feature.id], "darwin");
    const execution = plan(options);
    assert.deepEqual(execution.platforms, [platform]);
    assert.ok(execution.nativeFlows.length > 0);
    assert.ok(execution.nativeFlows.every((file) => file.includes(feature.id)));
    assert.ok(feature.branch.startsWith("test/"));
  }
});

test("rejects ambiguous, unsupported or unsafe requests", () => {
  for (const args of [["--feature", "missing"], ["--device", "x&calc"], ["--platform", "android", "--platform", "ios"], ["--feature"], ["--unknown"], ["--platform", "all", "--device", "x"]]) {
    assert.throws(() => parseOptions(args, "darwin"));
  }
  assert.throws(() => parseOptions(["--platform", "ios"], "win32"), /macOS/);
  assert.throws(() => parseOptions(["--platform", "all"], "linux"), /macOS/);
  assert.equal(parseOptions(["--platform", "ios", "--dry-run"], "win32").dryRun, true);
});

test("never silently chooses the wrong emulator or physical iOS device", () => {
  const android = "List of devices attached\nemulator-5554 device product:sdk\nphone offline\n";
  assert.equal(selectDevice("android", android), "emulator-5554");
  assert.throws(() => selectDevice("android", "phone unauthorized"), /Boot one/);
  assert.throws(() => selectDevice("android", android + "second device\n"), /choose --device/);
  assert.throws(() => selectDevice("android", android, "phone"), /not connected/);
  const ios = JSON.stringify({ devices: { runtime: [{ udid: "sim-1", state: "Booted", isAvailable: true }, { udid: "sim-2", state: "Shutdown", isAvailable: true }] } });
  assert.equal(selectDevice("ios", ios), "sim-1");
  assert.throws(() => selectDevice("ios", ios, "sim-2"), /not connected/);
});

test("a successful process with zero or skipped tests cannot become a pass", () => {
  assert.throws(() => reportCounts('<testsuite tests="0"/>'), /No tests/);
  assert.throws(() => reportCounts('<testcase name="one"><skipped/></testcase>'), /No tests/);
  assert.deepEqual(reportCounts('<testcase name="one"/><testcase name="two"><failure/></testcase>'), { tests: 2, failures: 1, skipped: 0, passed: 1 });
  assert.deepEqual(reportCounts('<testcase name="one"/>'), { tests: 1, failures: 0, skipped: 0, passed: 1 });
});

test("completion cannot mix commits, dirty trees or old passing runs after a failure", () => {
  const passed = (platform) => ({ platform, status: "passed", expectedTests: 1, counts: { tests: 1, passed: 1, failures: 0, skipped: 0 } });
  const base = { commit: "aaa", dirty: false, feature: "cod-235", startedAt: "2026-01-01", results: [passed("web"), passed("android")] };
  const other = { ...base, commit: "bbb", results: [passed("ios")] };
  assert.equal(matrix([base, other], "aaa")[0].complete, false);
  const ios = { ...base, results: [passed("ios")] };
  assert.equal(matrix([base, ios], "aaa")[0].complete, true);
  assert.equal(matrix([base, { ...ios, dirty: true }], "aaa")[0].ios, "NOT_RUN");
  assert.equal(matrix([base, { ...ios, dirtyAtFinish: true }], "aaa")[0].ios, "NOT_RUN");
  assert.equal(matrix([base, { ...ios, sourceChanged: true }], "aaa")[0].ios, "NOT_RUN");
  assert.equal(matrix([base, { ...ios, dirty: true }], "aaa", true)[0].complete, false);
  const failed = { ...base, startedAt: "2026-01-02", results: [{ platform: "web", status: "failed" }] };
  assert.equal(matrix([base, ios, failed], "aaa")[0].web, "FAIL");
  assert.equal(matrix([base, ios, failed], "aaa")[0].complete, false);
});

test("Windows batch arguments preserve spaces and reject shell expansion", () => {
  assert.throws(() => commandFor("C:\\maestro\\maestro.bat", ["%USERNAME%"], "win32"), /metacharacters/);
  assert.throws(() => commandFor("C:\\maestro\\maestro.bat", ["x&echo unsafe"], "win32"), /metacharacters/);
  assert.deepEqual(commandFor("/usr/bin/maestro", ["hello world"], "darwin"), ["/usr/bin/maestro", ["hello world"]]);
  if (process.platform === "win32") {
    const directory = mkdtempSync(path.join(tmpdir(), "codigdex qa command "));
    const fixture = path.join(directory, "probe.cmd");
    writeFileSync(fixture, "@echo off\r\necho %~1\r\necho %~2\r\n");
    const [command, args] = commandFor(fixture, ["hello world", "emulator-5554"]);
    const result = spawnSync(command, args, { encoding: "utf8", windowsHide: true, windowsVerbatimArguments: true });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "hello world\r\nemulator-5554");
  }
});

test("native flows are parseable, reference real subflows and never clear normal app/keychain data", () => {
  const commands = new Set(["runFlow", "launchApp", "stopApp", "extendedWaitUntil", "scrollUntilVisible", "tapOn", "assertVisible", "inputText", "takeScreenshot"]);
  for (const file of [...cases.nativeFlows.map(({ file }) => file), "qa/home/maestro/helpers/start.yaml"]) {
    const source = readFileSync(path.join(repo, file), "utf8");
    const documents = parseAllDocuments(source);
    assert.equal(documents.length, 2, file);
    for (const document of documents) assert.deepEqual(document.errors, [], file);
    const [header, steps] = documents.map((document) => document.toJSON());
    assert.equal(header.appId, cases.appId);
    assert.ok(Array.isArray(steps) && steps.length > 0);
    assert.doesNotMatch(source, /clearState|clearKeychain|clearAppState|clearKeychain/);
    for (const step of steps) {
      const command = typeof step === "string" ? step : Object.keys(step)[0];
      assert.ok(commands.has(command), `${file}: ${command}`);
      if (command === "runFlow") assert.ok(existsSync(path.resolve(repo, path.dirname(file), step.runFlow)));
    }
  }
  const start = readFileSync(path.join(repo, "qa/home/maestro/helpers/start.yaml"), "utf8");
  assert.match(start, /qa-automation/);
  assert.match(start, /\$\{QA_BUILD\}/);
  assert.ok(start.indexOf("qa-automation") < start.indexOf("qa-reset"));
});

test("coverage includes each feature on Web and native plus all five career paths", () => {
  const source = readFileSync(path.join(repo, "web/home-e2e/features.spec.ts"), "utf8");
  for (const feature of cases.features) {
    assert.ok(source.includes(`@${feature.id}`));
    assert.ok(cases.nativeFlows.some((flow) => flow.feature === feature.id));
  }
  assert.equal(cases.careers.length, 5);
  for (const career of cases.careers) assert.ok(cases.nativeFlows.some(({ file }) => file.endsWith(`career-${career.jobId}.yaml`)));
  assert.ok(cases.battles.tutorial.questions.some(({ type }) => type === "freeText"));
  assert.equal(cases.battles.level5.questions.length, 7);
  assert.equal(plan(parseOptions([])).nativeFlows.length, 11);
});
