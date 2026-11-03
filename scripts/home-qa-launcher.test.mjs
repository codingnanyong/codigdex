import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const launcher = fileURLToPath(new URL('../start-home-qa.command', import.meta.url));
const bash = process.platform === 'win32' ? path.join(process.env.ProgramFiles ?? 'C:/Program Files', 'Git/bin/bash.exe') : 'bash';
const shellUnavailable = process.platform === 'win32' && !existsSync(bash);
const launcherTest = (name, fn) => test(name, { skip: shellUnavailable ? 'Git Bash unavailable; Mac shell behavior not checked on this Windows host' : false }, fn);

function fixture(t, overrides = {}, installed = true) {
  const dir = mkdtempSync(path.join(tmpdir(), 'codigdex-home-launcher-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('codigdex-home-launcher-'));
    rmSync(dir, { recursive: true, force: true });
  });
  const root = path.join(dir, 'repo with spaces');
  const bin = path.join(dir, 'bin');
  mkdirSync(root); mkdirSync(bin); mkdirSync(path.join(root, 'scripts'));
  copyFileSync(launcher, path.join(root, 'start-home-qa.command'));
  writeFileSync(path.join(root, 'scripts/home-qa.mjs'), '// runner stub; no native tools are executed\n');
  if (installed) for (const file of ['expo/bin/cli', 'tsx/dist/cli.mjs', '@playwright/test/cli.js']) {
    const target = path.join(root, 'node_modules', file);
    mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, '');
  }
  const log = path.join(dir, 'calls.jsonl');
  const bootstrap = path.join(dir, 'bash-env.sh');
  writeFileSync(bootstrap, 'export PATH="$QA_TEST_BIN:$PATH"\n');
  const probe = path.join(dir, 'probe.cjs');
  writeFileSync(probe, `const fs = require('node:fs'); const path = require('node:path');
const [tool, ...args] = process.argv.slice(2);
if (tool === 'node' && args[0] === '-p') { console.log(process.env.QA_TEST_NODE_MAJOR); process.exit(0); }
fs.appendFileSync(process.env.QA_TEST_LOG, JSON.stringify({ tool, args, cwd: process.cwd() }) + '\\n');
if (tool === 'npx' && args.includes('ci')) {
  const code = Number(process.env.QA_TEST_INSTALL_EXIT ?? 0); if (code) process.exit(code);
  for (const name of ['expo/bin/cli', 'tsx/dist/cli.mjs', '@playwright/test/cli.js']) {
    const file = path.join(process.cwd(), 'node_modules', name); fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, '');
  }
}
if (tool === 'node' && !args.includes('--dry-run')) process.exit(Number(process.env.QA_TEST_RUN_EXIT ?? 0));
`);
  writeFileSync(path.join(bin, 'uname'), '#!/bin/sh\nprintf "%s\\n" "$QA_TEST_OS"\n', { mode: 0o755 });
  for (const tool of ['node', 'npx']) writeFileSync(path.join(bin, tool), `#!/bin/sh\nexec "$QA_TEST_REAL_NODE" "$QA_TEST_PROBE" ${tool} "$@"\n`, { mode: 0o755 });
  const env = { ...process.env, PATH: bin + path.delimiter + process.env.PATH, NVM_DIR: path.join(dir, 'no-nvm'), QA_TEST_OS: 'Darwin', QA_TEST_NODE_MAJOR: '22', QA_TEST_LOG: log,
    BASH_ENV: bootstrap.replaceAll('\\', '/'), QA_TEST_BIN: process.platform === 'win32' ? bin.replaceAll('\\', '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase()) : bin,
    QA_TEST_REAL_NODE: process.execPath.replaceAll('\\', '/'), QA_TEST_PROBE: probe.replaceAll('\\', '/'), ...overrides };
  for (const name of Object.keys(env)) if (name !== 'PATH' && name.toLowerCase() === 'path') delete env[name];
  return {
    nvmDirectory: path.join(dir, 'no-nvm'),
    run(args) { return spawnSync(bash, ['--noprofile', '--norc', path.join(root, 'start-home-qa.command'), ...args], { env, encoding: 'utf8', timeout: 20000, windowsHide: true }); },
    calls() { return existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) : []; },
  };
}

launcherTest('help is available without macOS, Node or installation', (t) => {
  const f = fixture(t, { QA_TEST_OS: 'Linux', QA_TEST_NODE_MAJOR: '24' });
  const r = f.run(['--help']); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /prepare/); assert.deepEqual(f.calls(), []);
});
launcherTest('non-Mac and wrong-Node launches stop before any installation', (t) => {
  const nonMac = fixture(t, { QA_TEST_OS: 'Linux' }); assert.notEqual(nonMac.run(['ios']).status, 0); assert.deepEqual(nonMac.calls(), []);
  const wrongNode = fixture(t, { QA_TEST_NODE_MAJOR: '24' }); const r = wrongNode.run(['ios']); assert.notEqual(r.status, 0); assert.match(r.stderr, /Node.js 22/); assert.deepEqual(wrongNode.calls(), []);
});
launcherTest('noninteractive launch requires a selection rather than silently testing all platforms', (t) => {
  const f = fixture(t); assert.notEqual(f.run([]).status, 0); assert.deepEqual(f.calls(), []);
});
launcherTest('runner help, list and dry-run never install dependencies or browsers', (t) => {
  for (const flag of ['--help', '--list', '--dry-run']) {
    const f = fixture(t, {}, false); const r = f.run(['all', flag]); assert.equal(r.status, 0, r.stderr);
    assert.equal(f.calls().length, 1); assert.equal(f.calls()[0].tool, 'node'); assert.ok(f.calls()[0].args.includes(flag));
  }
});
launcherTest('ready iOS launch forwards the selected device from a repository path with spaces', (t) => {
  const f = fixture(t); const r = f.run(['ios', '--device', 'sim-123']); assert.equal(r.status, 0, r.stderr);
  const calls = f.calls(); assert.ok(calls.every(c => c.tool === 'node')); assert.ok(calls[0].args.includes('--dry-run'));
  assert.deepEqual(calls.at(-1).args, ['scripts/home-qa.mjs', '--platform', 'ios', '--feature', 'all', '--device', 'sim-123']);
  assert.ok(calls.at(-1).cwd.includes('repo with spaces'));
});
launcherTest('prepare installs pinned local dependencies and runs only the doctor', (t) => {
  const f = fixture(t, {}, false); const r = f.run(['prepare', 'ios']); assert.equal(r.status, 0, r.stderr);
  const calls = f.calls(); assert.deepEqual(calls.find(c => c.tool === 'npx').args, ['--yes', 'npm@10.9.2', 'ci', '--no-audit', '--no-fund']);
  assert.ok(calls.filter(c => c.tool === 'node').every(c => c.args.includes('--doctor')));
  assert.ok(!calls.some(c => c.args.includes('chromium'))); assert.match(r.stdout, /아직 실행하지 않았습니다/);
});
launcherTest('default prepare includes Chromium readiness and only checks all-platform tools', (t) => {
  const f = fixture(t, {}, false); const r = f.run(['prepare']); assert.equal(r.status, 0, r.stderr);
  const calls = f.calls(); assert.ok(calls.some(c => c.tool === 'npx' && JSON.stringify(c.args) === JSON.stringify(['--no-install', 'playwright', 'install', 'chromium'])));
  assert.deepEqual(calls.at(-1).args, ['scripts/home-qa.mjs', '--platform', 'all', '--feature', 'all', '--doctor']);
});
launcherTest('an existing nvm Node 22 installation can be selected without installing Node', (t) => {
  const f = fixture(t, { QA_TEST_NODE_MAJOR: '24' }); mkdirSync(f.nvmDirectory);
  writeFileSync(path.join(f.nvmDirectory, 'nvm.sh'), 'nvm() { [ "$1" = use ] && [ "$2" = 22 ] || return 1; export QA_TEST_NODE_MAJOR=22; }\n');
  const r = f.run(['ios']); assert.equal(r.status, 0, r.stderr); assert.ok(!f.calls().some(c => c.tool === 'npx'));
  assert.deepEqual(f.calls().at(-1).args, ['scripts/home-qa.mjs', '--platform', 'ios', '--feature', 'all']);
});
launcherTest('failed installation cannot start tests or report preparation success', (t) => {
  const f = fixture(t, { QA_TEST_INSTALL_EXIT: '19' }, false); const r = f.run(['prepare', 'ios']); assert.equal(r.status, 19, r.stderr);
  assert.ok(f.calls().filter(c => c.tool === 'node').every(c => c.args.includes('--dry-run'))); assert.doesNotMatch(r.stdout, /점검을 마쳤습니다/);
});
launcherTest('runner failure propagates instead of becoming a successful preparation or test', (t) => {
  const f = fixture(t, { QA_TEST_RUN_EXIT: '7' }); const r = f.run(['ios', '--doctor']); assert.equal(r.status, 7, r.stderr);
  assert.doesNotMatch(r.stdout, /점검을 마쳤습니다/); assert.ok(!f.calls().some(c => c.tool === 'npx'));
});

test('the real runner can plan a fresh checkout without third-party dependencies', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'codigdex-home-launcher-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('codigdex-home-launcher-'));
    rmSync(dir, { recursive: true, force: true });
  });
  mkdirSync(path.join(dir, 'scripts')); mkdirSync(path.join(dir, 'qa/home'), { recursive: true });
  copyFileSync(fileURLToPath(new URL('./home-qa.mjs', import.meta.url)), path.join(dir, 'scripts/home-qa.mjs'));
  copyFileSync(fileURLToPath(new URL('../qa/home/cases.json', import.meta.url)), path.join(dir, 'qa/home/cases.json'));
  const r = spawnSync(process.execPath, ['scripts/home-qa.mjs', '--platform', 'ios', '--feature', 'all', '--dry-run'], { cwd: dir, encoding: 'utf8', timeout: 10000, windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  const planned = JSON.parse(r.stdout); assert.deepEqual(planned.platforms, ['ios']); assert.ok(planned.nativeFlows.length > 0);
  assert.equal(existsSync(path.join(dir, 'node_modules')), false);
});
