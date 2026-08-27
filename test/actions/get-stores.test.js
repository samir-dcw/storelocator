import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/get-stores/index.js';

describe('get-stores', () => {
  it('returns sorted stores from cached state', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:stores', {
      value: [
        { id: '2', name: 'Far', latitude: 40, longitude: -75 },
        { id: '1', name: 'Near', latitude: 41, longitude: -75 },
      ],
      expiresAt: null,
    });

    const result = await main({ query: { lat: 41, lng: -75, radius: 500, unit: 'mi' } });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.stores[0].name, 'Near');
  });

  it('returns disabled when store locator is off', async () => {
    const result = await main({ enable_store_locator: false });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.enabled, false);
  });

  it('rejects requests without a location', async () => {
    const result = await main({ query: {} });
    assert.equal(result.statusCode, 400);
  });
});
