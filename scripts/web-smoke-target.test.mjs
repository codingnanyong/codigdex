import { test } from 'node:test';
import assert from 'node:assert/strict';
import { smokeTarget, checkSmokeAccess } from './web-smoke-target.mjs';

test('accepts only the exact project origins, without URL credentials or queries', () => {
  assert.equal(smokeTarget('https://codigdex.vercel.app').origin, 'https://codigdex.vercel.app');
  assert.ok(smokeTarget('https://codigdex-abc-codingnanyongs-projects.vercel.app'));
  for (const value of ['http://codigdex.vercel.app', 'https://codigdex.vercel.app.evil.test', 'https://other.vercel.app', 'https://secret@codigdex.vercel.app', 'https://codigdex.vercel.app?token=x', 'https://codigdex.vercel.app/path', 'https://codigdex.vercel.app:4000']) assert.throws(() => smokeTarget(value));
});
test('fails on login redirects without sending credentials to the destination', async () => {
  const calls = [];
  await assert.rejects(checkSmokeAccess('https://codigdex.vercel.app', 'test-secret', async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(null, { status: 302, headers: { location: 'https://vercel.com/login' } });
  }), /redirected outside/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.redirect, 'manual');
  assert.equal(calls[0].options.headers['x-vercel-protection-bypass'], 'test-secret');
});
test('permits bounded same-origin redirects and reports denied access', async () => {
  let count = 0;
  await checkSmokeAccess('https://codigdex.vercel.app', undefined, async () => ++count === 1
    ? new Response(null, { status: 307, headers: { location: '/home' } }) : new Response('ok'));
  assert.equal(count, 2);
  await assert.rejects(checkSmokeAccess('https://codigdex.vercel.app', undefined, async () => new Response(null, { status: 401 })), /access denied/);
});
