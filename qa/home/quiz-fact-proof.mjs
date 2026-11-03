// Reproduce targeted quiz facts without touching a remote database or app dependencies.
// Install the optional probe dependency once:
// npm install --prefix qa-results/tools/query-proof --no-save --ignore-scripts @tanstack/query-core@5.105.3
// Run: node qa/home/quiz-fact-proof.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const probeRoot = path.join(repo, 'qa-results/tools/query-proof');
const probe = createRequire(path.join(probeRoot, 'package.json'));
const queryVersion = JSON.parse(readFileSync(path.join(probeRoot, 'node_modules/@tanstack/query-core/package.json'), 'utf8')).version;
assert.equal(queryVersion, '5.105.3', 'Use the pinned probe version so the evidence is reproducible');
const { QueryClient, QueryObserver } = probe('@tanstack/query-core');
const checks = [];
const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } } });
const selected = ['orders', 'selected'];
const other = ['orders', 'other'];
let requests = 0;
let unsubscribe;
try {
  client.setQueryData(selected, 0);
  client.setQueryData(other, 0);
  const observer = new QueryObserver(client, { queryKey: selected, queryFn: async () => ++requests });
  unsubscribe = observer.subscribe(() => {});
  assert.equal(requests, 0);

  await client.invalidateQueries({ queryKey: ['orders'], refetchType: 'none' });
  assert.equal(client.getQueryState(selected).isInvalidated, true);
  assert.equal(client.getQueryState(other).isInvalidated, true);
  assert.equal(requests, 0);
  checks.push('Invalidation can mark matching cached queries stale without refetching');

  await client.invalidateQueries({ queryKey: ['orders'] });
  assert.equal(requests, 1);
  assert.equal(client.getQueryData(selected), 1);
  assert.equal(client.getQueryState(other).isInvalidated, true);
  checks.push('Default invalidation also refetches the active matching query');

  client.setQueryData(other, 0);
  await observer.refetch();
  assert.equal(requests, 2);
  assert.equal(client.getQueryData(selected), 2);
  assert.equal(client.getQueryData(other), 0);
  assert.equal(client.getQueryState(other).isInvalidated, false);
  checks.push('Direct selected-query refetch does not invalidate another cached query');
} finally {
  unsubscribe?.();
  client.clear();
}

const db = new PGlite();
let postgresVersion;
try {
  postgresVersion = (await db.query('SELECT version() AS version')).rows[0].version;
  const totals = await db.query(`
    WITH orders(id, amount) AS (VALUES (1, 100), (2, 50)),
    items(order_id) AS (VALUES (1), (1), (2)),
    per_order AS (SELECT order_id, COUNT(*) n FROM items GROUP BY order_id)
    SELECT (SELECT SUM(amount) FROM orders JOIN items ON id = order_id) AS duplicated,
           (SELECT SUM(amount) FROM orders JOIN per_order ON id = order_id) AS fixed
  `);
  assert.equal(totals.rows[0].duplicated, 250);
  assert.equal(totals.rows[0].fixed, 150);
  checks.push('One-to-many join inflates order SUM to 250; per-order aggregation restores 150');

  // Keep setup outside the transaction being rolled back.
  await db.exec('CREATE TABLE balances(id INT PRIMARY KEY, balance INT NOT NULL CHECK(balance >= 0)); INSERT INTO balances VALUES (1, 100), (2, 50);');
  await db.exec('BEGIN; UPDATE balances SET balance = balance - 40 WHERE id = 1; UPDATE balances SET balance = balance + 40 WHERE id = 2; ROLLBACK;');
  assert.deepEqual((await db.query('SELECT * FROM balances ORDER BY id')).rows, [{ id: 1, balance: 100 }, { id: 2, balance: 50 }]);
  checks.push('ROLLBACK restores both sides of a transfer to 100 and 50');
  await assert.rejects(db.query('INSERT INTO balances VALUES (1, 999)'), { code: '23505' });
  checks.push('Primary-key constraint rejects a duplicate order/account identifier');
} finally {
  await db.close();
}

const aggregateRatio = (1 + 900) / (10 + 1000);
const unweightedMean = (1 / 10 + 900 / 1000) / 2;
assert.ok(Math.abs(aggregateRatio - unweightedMean) > 0.3);
checks.push('Unequal populations yield 901/1010 overall, rather than the unweighted 0.5');
const allowedErrors = Math.round(100000 * (1 - 0.999));
assert.equal(allowedErrors, 100);
assert.equal(allowedErrors - 80, 20);
checks.push('A 99.9% request SLO over 100000 requests allows 100 errors; 80 leave 20');

console.log(JSON.stringify({ checkedAt: new Date().toISOString(), queryCoreVersion: queryVersion, postgresVersion, passed: checks.length, checks, limits: 'Targeted local examples only; not execution of every framework, a remote DB, native UI or protected Preview.' }, null, 2));
