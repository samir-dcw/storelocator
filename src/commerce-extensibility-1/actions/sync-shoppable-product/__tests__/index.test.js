import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../index.js';

vi.mock('../../utils/state-cache.js', () => ({
  getJson: vi.fn(),
  putJson: vi.fn(),
  cacheKey: vi.fn((prefix, suffix) => `${prefix}:${suffix}`),
}));

const stateCache = await import('../../utils/state-cache.js');

beforeEach(() => vi.clearAllMocks());

describe('sync-shoppable-product', () => {
  it('upserts product payload', async () => {
    stateCache.getJson.mockResolvedValue(null);
    const result = await main({ IO_STATE_KEY: 'magazine', id: '10', name: 'Item', price: 9.99, salable: true, media_gallery_images: [] });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).updated).toBe(true);
  });

  it('rejects missing id', async () => {
    const result = await main({});
    expect(result.statusCode).toBe(400);
  });
});
