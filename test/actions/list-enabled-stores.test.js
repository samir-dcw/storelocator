import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/list-enabled-stores/index.js';

describe('list-enabled-stores', () => {
  it('returns only enabled store locations', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:store-locations', {
      value: [
        { id: '1', name: 'Open', enabled: true },
        { id: '2', name: 'Closed', enabled: false },
      ],
      expiresAt: null,
    });

    const result = await main({});
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].name, 'Open');
  });
});
