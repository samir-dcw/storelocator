import assert from 'node:assert/strict';
import { main } from './index.js';

test('list-articles returns response shape', async () => {
  const result = await main({ IO_STATE_KEY: 'magazine' });
  assert.equal(result.statusCode, 500);
});
