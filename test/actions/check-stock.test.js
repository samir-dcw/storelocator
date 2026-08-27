import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/check-stock/index.js';

describe('check-stock', () => {
  it('validates required inputs', async () => {
    const result = await main({ query: {} });
    assert.equal(result.statusCode, 400);
  });

  it('returns disabled when store locator is off', async () => {
    const result = await main({ enable_store_locator: false });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.enabled, false);
  });

  it('queries commerce and caches the response', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        data: {
          products: {
            items: [{ source_items: [{ quantity: 7, status: 1 }] }],
          },
        },
      }),
    });

    const result = await main({ query: { sku: 'SKU-1', source_code: 'default' } });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.stock.quantity, 7);
  });
});
