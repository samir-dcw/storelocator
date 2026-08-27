import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { main } from './index.js';

describe('get-magazine-articles', () => {
  it('returns a response object for valid params', async () => {
    const response = await main({ category: 'trends' });
    assert.equal(typeof response.statusCode, 'number');
    assert.ok(response.body);
  });

  it('rejects invalid params', async () => {
    const response = await main({ category: 'bad!' });
    assert.equal(response.statusCode, 400);
  });
});
