import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { main } from './index.js';

describe('sync-master-data', () => {
  it('returns a response object', async () => {
    const response = await main();
    assert.equal(typeof response.statusCode, 'number');
  });
});
