import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/sync-store-locations/index.js';

describe('sync-store-locations', () => {
  it('stores provided stores and logs failures', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    const result = await main({ body: { stores: [{ id: '1', name: 'Store' }, { name: 'Bad' }] } });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.synced, 1);
    assert.equal(body.failed, 1);
  });
});
