import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/manage-store-locations/index.js';

describe('manage-store-locations', () => {
  it('creates, lists, and deletes store locations', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    let result = await main({ __ow_method: 'post', body: { id: '1', name: 'Main', enabled: true } });
    assert.equal(result.statusCode, 200);

    result = await main({ __ow_method: 'get' });
    let body = JSON.parse(result.body);
    assert.equal(body.items.length, 1);

    result = await main({ __ow_method: 'delete', body: { id: '1' } });
    body = JSON.parse(result.body);
    assert.equal(body.removed, true);
  });

  it('rejects invalid payloads', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    const result = await main({ __ow_method: 'post', body: { name: 'Missing ID' } });
    assert.equal(result.statusCode, 400);
  });
});
