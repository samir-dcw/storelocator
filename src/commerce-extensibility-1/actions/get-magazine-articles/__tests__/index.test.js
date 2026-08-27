import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../index.js';

vi.mock('../../utils/state-cache.js', () => ({
  getJson: vi.fn(),
  putJson: vi.fn(),
  cacheKey: vi.fn((prefix, suffix) => `${prefix}:${suffix}`),
}));

vi.mock('../../utils/mesh-client.js', () => ({ queryMesh: vi.fn() }));

vi.mock('../../utils/validate-params.js', () => ({
  parseMagazineQuery: vi.fn((params) => ({ category: params.category || '', editionId: params.editionId || '', sku: params.sku || '' })),
  filterEnabledArticles: vi.fn((articles) => articles.filter((article) => article.enabled !== false)),
}));

const stateCache = await import('../../utils/state-cache.js');
const meshClient = await import('../../utils/mesh-client.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('get-magazine-articles', () => {
  it('returns cached enabled articles', async () => {
    stateCache.getJson.mockResolvedValue({ articles: [{ id: '1', enabled: true }, { id: '2', enabled: false }] });
    const result = await main({ IO_STATE_KEY: 'magazine', category: 'news' });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).articles).toEqual([{ id: '1', enabled: true }]);
  });

  it('falls back to mesh on cache miss', async () => {
    stateCache.getJson.mockResolvedValue(null);
    meshClient.queryMesh.mockResolvedValue({ magazineHub: { magazineIssues: { items: [{ articles: [{ id: '3', enabled: true }] }] } } });
    const result = await main({ IO_STATE_KEY: 'magazine', MESH_ENDPOINT: 'https://mesh' });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).source).toBe('mesh');
  });

  it('returns stale cache on mesh failure', async () => {
    stateCache.getJson.mockResolvedValueOnce(null).mockResolvedValueOnce({ articles: [{ id: '4', enabled: true }] });
    meshClient.queryMesh.mockRejectedValue(new Error('mesh down'));
    const result = await main({ IO_STATE_KEY: 'magazine', MESH_ENDPOINT: 'https://mesh' });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).source).toBe('stale-cache');
  });
});
