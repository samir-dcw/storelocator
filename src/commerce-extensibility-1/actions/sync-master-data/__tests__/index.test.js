import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../index.js';

vi.mock('../../utils/state-cache.js', () => ({
  putJson: vi.fn(),
  cacheKey: vi.fn((prefix, suffix) => `${prefix}:${suffix}`),
}));

vi.mock('../../utils/mesh-client.js', () => ({ queryMesh: vi.fn() }));

const meshClient = await import('../../utils/mesh-client.js');

beforeEach(() => vi.clearAllMocks());

describe('sync-master-data', () => {
  it('refreshes cache on success', async () => {
    meshClient.queryMesh.mockResolvedValue({ magazineHub: { magazineIssues: { items: [{ articles: [{ id: '1', enabled: true }] }] } } });
    const result = await main({ IO_STATE_KEY: 'magazine', MESH_ENDPOINT: 'https://mesh' });
    expect(result.statusCode).toBe(200);
  });

  it('returns failure on mesh error', async () => {
    meshClient.queryMesh.mockRejectedValue(new Error('mesh failed'));
    const result = await main({ IO_STATE_KEY: 'magazine', MESH_ENDPOINT: 'https://mesh' });
    expect(result.statusCode).toBe(500);
  });
});
