import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { main } from './index.js';

describe('sync-shoppable-product', () => {
  it('requires a product id', async () => {
    const response = await main({});
    assert.equal(response.statusCode, 400);
  });

  it('handles a product payload', async () => {
    const response = await main({ id: 'sku-1', name: 'Product', price: 1, salable: true });
    assert.equal(typeof response.statusCode, 'number');
  });
});
