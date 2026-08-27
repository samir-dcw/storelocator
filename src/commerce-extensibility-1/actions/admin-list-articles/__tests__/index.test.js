import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../index.js';

vi.mock('../../utils/mesh-client.js', () => ({ queryMesh: vi.fn() }));
const meshClient = await import('../../utils/mesh-client.js');

beforeEach(() => vi.clearAllMocks());

describe('admin-list-articles', () => {
  it('lists all articles', async () => {
    meshClient.queryMesh.mockResolvedValue({ magazineHub: { magazineIssues: { items: [{ articles: [{ id: '1', enabled: true }, { id: '2', enabled: false }] }] } } });
    const result = await main({ MESH_ENDPOINT: 'https://mesh' });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).articles).toHaveLength(2);
  });
});
