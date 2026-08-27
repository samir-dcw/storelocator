import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateMagazineParams } from './validate-params.js';

describe('validateMagazineParams', () => {
  it('accepts safe inputs', () => {
    const result = validateMagazineParams({ editionId: 'edition-1', category: 'trends', sku: 'sku_1', refresh: 'yes' });
    assert.equal(result.valid, true);
    assert.equal(result.value.refresh, true);
  });

  it('rejects unsafe inputs', () => {
    const result = validateMagazineParams({ editionId: 'bad id' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});
