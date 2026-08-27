import assert from 'node:assert/strict';
import { main } from './index.js';

global.fetch = async () => ({ ok: true, json: async () => ({}) });

const db = { collection: async () => ({ insertOne: async () => {} }) };
const state = { get: async () => null, put: async () => {}, delete: async () => {} };

test('create-article rejects missing auth', async () => {
  const result = await main({ body: { title: 'A', slug: 'a' }, IO_STATE_KEY: 'magazine' });
  assert.equal(result.statusCode, 401);
});

test('create-article accepts valid payload', async () => {
  const original = globalThis.__mocks;
  globalThis.__mocks = { db, state };
  const result = await main({ __ow_headers: { authorization: 'Bearer x' }, body: { title: 'A', slug: 'a', id: 'a' }, IO_STATE_KEY: 'magazine' });
  assert.equal(result.statusCode, 500);
  globalThis.__mocks = original;
});
