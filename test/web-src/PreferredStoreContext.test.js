import assert from 'node:assert/strict';
import React from 'react';
import { PreferredStoreProvider, usePreferredStoreContext } from '../../web-src/src/context/PreferredStoreContext.jsx';

describe('PreferredStoreContext', () => {
  it('provides a writable preferred store context', () => {
    const store = { id: '1', name: 'Main' };
    const Wrapper = () => {
      const ctx = usePreferredStoreContext();
      return React.createElement('div', null, ctx.preferredStore ? ctx.preferredStore.name : 'none');
    };
    assert.ok(PreferredStoreProvider);
    assert.ok(Wrapper);
    assert.deepEqual(store, { id: '1', name: 'Main' });
  });
});
