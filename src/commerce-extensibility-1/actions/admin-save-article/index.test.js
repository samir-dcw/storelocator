import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { main } from './index.js';

describe('admin-save-article', () => {
  it('rejects invalid payload', async () => {
    const response = await main({ 'x-admin-acl': 'magazine-editorial-hub/admin' });
    assert.equal(response.statusCode, 400);
  });

  it('creates or updates with ACL', async () => {
    const response = await main({ 'x-admin-acl': 'magazine-editorial-hub/admin', id: 'a1', title: 'Article' });
    assert.equal(response.statusCode, 200);
  });
});
