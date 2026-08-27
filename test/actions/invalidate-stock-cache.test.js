import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/invalidate-stock-cache/index.js';

describe('invalidate-stock-cache', () => {
  it('invalidates cache idempotently', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    await main({ event: { product_id: '1', website_id: '2', event_id: 'evt-1' } });
    const result = await main({ event: { product_id: '1', website_id: '2', event_id: 'evt-1' } });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.skipped, true);
  });
});
