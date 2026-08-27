import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { main } from './index.js';

describe('admin-list-articles', () => {
  it('denies access without ACL', async () => {
    const response = await main({});
    assert.equal(response.statusCode, 403);
  });

  it('returns articles when ACL is present', async () => {
    const response = await main({ 'x-admin-acl': 'magazine-editorial-hub/admin' });
    assert.equal(response.statusCode, 200);
  });
});
