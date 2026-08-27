import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../index.js';

vi.mock('../../utils/page-builder-client.js', () => ({
  saveArticleToPageBuilder: vi.fn(),
  toPageBuilderArticle: vi.fn((article) => article),
}));
vi.mock('../../utils/state-cache.js', () => ({ getJson: vi.fn(), putJson: vi.fn(), cacheKey: vi.fn((prefix, suffix) => `${prefix}:${suffix}`) }));
const pageBuilder = await import('../../utils/page-builder-client.js');

beforeEach(() => vi.clearAllMocks());

describe('admin-save-article', () => {
  it('creates article', async () => {
    pageBuilder.saveArticleToPageBuilder.mockResolvedValue({ id: '1', title: 'A' });
    const result = await main({ title: 'A', MESH_ENDPOINT: 'https://pb' });
    expect(result.statusCode).toBe(200);
  });

  it('validates input', async () => {
    const result = await main({});
    expect(result.statusCode).toBe(400);
  });
});
