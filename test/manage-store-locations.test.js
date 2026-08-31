const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');

const repoPath = '../src/commerce-extensibility-1/actions/utils/store-repository.js';
const actionPath = '../src/commerce-extensibility-1/actions/manage-store-locations/index.js';
const apiPath = '../src/commerce-extensibility-1/actions/admin-store-api/index.js';

let repo;
let action;
let adminApi;

beforeEach(async () => {
  delete globalThis.__storeLocatorMemoryState;
  repo = await import(repoPath);
  action = await import(actionPath);
  adminApi = await import(apiPath);
});

test('repository upserts and lists stores', async () => {
  const repository = repo.createStoreRepository({ IO_STATE_KEY: 'test' }, console);
  const saved = await repository.upsert({ id: 'store-1', name: 'Main Store', amenities: ['Parking'] });
  assert.equal(saved.id, 'store-1');
  assert.equal(saved.name, 'Main Store');
  const items = await repository.getAll();
  assert.equal(items.length, 1);
});

test('manage-store-locations returns validation error on missing id', async () => {
  const response = await action.main({ __ow_method: 'post', body: { name: 'No ID' } });
  assert.equal(response.statusCode, 400);
  assert.match(JSON.parse(response.body).error, /id and name/);
});

test('manage-store-locations creates and updates stores', async () => {
  let response = await action.main({
    __ow_method: 'post',
    body: { id: 'store-1', name: 'Main Store', amenities: '["Parking"]' },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).saved.name, 'Main Store');

  response = await action.main({
    __ow_method: 'put',
    body: { id: 'store-1', name: 'Main Store Updated', enabled: false },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).saved.enabled, false);
});

test('manage-store-locations deletes missing store with 404', async () => {
  const response = await action.main({ __ow_method: 'delete', body: { id: 'missing' } });
  assert.equal(response.statusCode, 404);
});

test('admin-store-api creates, reads, updates and deletes stores', async () => {
  let response = await adminApi.main({ __ow_method: 'post', body: { id: 'store-2', name: 'Second Store' } });
  assert.equal(response.statusCode, 201);

  response = await adminApi.main({ __ow_method: 'get' });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).items.length, 1);

  response = await adminApi.main({ __ow_method: 'patch', body: { id: 'store-2', name: 'Second Store Updated' } });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).saved.name, 'Second Store Updated');

  response = await adminApi.main({ __ow_method: 'delete', body: { id: 'store-2' } });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).removed, true);
});

test('admin-store-api rejects missing required fields', async () => {
  const response = await adminApi.main({ __ow_method: 'post', body: { name: 'Missing ID' } });
  assert.equal(response.statusCode, 400);
});
